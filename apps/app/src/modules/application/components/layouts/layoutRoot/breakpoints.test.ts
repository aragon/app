/**
 * @jest-environment node
 */
import path from 'node:path';
import tailwindcss from '@tailwindcss/postcss';
import postcss, { type AtRule, type Root, type Rule } from 'postcss';

// breakpoints.css redefines the breakpoint variants as container queries on the `app` container.
// Tailwind lets `@custom-variant` replace a built-in variant, but nothing fails loudly if that
// stops holding after an upgrade: `lg:` would silently fall back to a viewport media query and the
// layout would collide with the docked assistant again (APP-1143). These tests compile the
// variants the way layoutRoot.css does and pin what each of them means.
describe('breakpoints.css', () => {
    // Directory of this test file, so the CSS is compiled from the folder of breakpoints.css and
    // `@import "tailwindcss"` resolves the way it does for layoutRoot.css.
    const getTestDirectory = () => path.dirname(expect.getState().testPath!);

    const compile = async (classNames: string[]): Promise<Root> => {
        const source = [
            '@import "tailwindcss" source(none);',
            '@import "./breakpoints.css";',
            `@source inline("${classNames.join(' ')}");`,
        ].join('\n');

        const result = await postcss([
            tailwindcss({ base: getTestDirectory(), optimize: false }),
        ]).process(source, {
            from: path.join(getTestDirectory(), 'breakpoints.test.css'),
        });

        return result.root;
    };

    // Tailwind escapes the special characters of a class name in the selector it generates, and a
    // leading digit becomes a code-point escape (`2xl:flex` → `.\32 xl\:flex`). Rather than
    // re-implementing those rules to build a selector, compare the generated selectors with their
    // escapes stripped.
    const readClassName = (selector: string) =>
        selector.replace(/\\3(\d) /g, '$1').replaceAll('\\', '');

    const findRules = (root: Root, className: string): Rule[] => {
        const rules: Rule[] = [];
        root.walkRules((rule) => {
            if (readClassName(rule.selector) === `.${className}`) {
                rules.push(rule);
            }
        });

        return rules;
    };

    // The at-rules wrapping the rule of a class, outermost first, e.g. ['@container app (width >= 64rem)'].
    const getWrappers = (root: Root, className: string): string[] => {
        const wrappers: string[] = [];

        for (const rule of findRules(root, className)) {
            let parent = rule.parent;
            while (parent && parent.type === 'atrule') {
                const atRule = parent as AtRule;
                if (atRule.name !== 'layer') {
                    wrappers.unshift(`@${atRule.name} ${atRule.params}`);
                }
                parent = atRule.parent;
            }
        }

        return wrappers;
    };

    const getPosition = (root: Root, className: string): number =>
        findRules(root, className).at(-1)?.source?.start?.offset ?? -1;

    const sizes = ['sm', 'md', 'lg', 'xl', '2xl'];
    const thresholds: Record<string, string> = {
        sm: '40rem',
        md: '48rem',
        lg: '64rem',
        xl: '80rem',
        '2xl': '96rem',
    };

    it('turns the breakpoint variants into container queries on the app container', async () => {
        const root = await compile(sizes.map((size) => `${size}:flex`));

        for (const size of sizes) {
            expect(getWrappers(root, `${size}:flex`)).toEqual([
                `@container app (width >= ${thresholds[size]})`,
            ]);
        }
    });

    it('turns the max breakpoint variants into container queries on the app container', async () => {
        const root = await compile(sizes.map((size) => `max-${size}:hidden`));

        for (const size of sizes) {
            expect(getWrappers(root, `max-${size}:hidden`)).toEqual([
                `@container app (width < ${thresholds[size]})`,
            ]);
        }
    });

    // The thresholds are literal in breakpoints.css because a container query cannot read a custom
    // property. Tailwind's `min-*` variant still derives its media query from the theme, so it
    // tells whether the literals drifted from `--breakpoint-*`.
    it('uses the breakpoint thresholds of the theme', async () => {
        const root = await compile(sizes.map((size) => `min-${size}:flex`));

        for (const size of sizes) {
            expect(getWrappers(root, `min-${size}:flex`)).toEqual([
                `@media (width >= ${thresholds[size]})`,
            ]);
        }
    });

    it('keeps the cascade order of the breakpoints', async () => {
        const root = await compile([
            ...sizes.map((size) => `${size}:flex`),
            ...sizes.map((size) => `max-${size}:hidden`),
        ]);

        // Wider breakpoints win, so `md:flex lg:hidden` collapses at lg.
        const minPositions = sizes.map((size) =>
            getPosition(root, `${size}:flex`),
        );
        // A class that generated nothing would order vacuously.
        expect(minPositions).not.toContain(-1);
        expect(minPositions).toEqual([...minPositions].sort((a, b) => a - b));

        // Narrower max ranges win, so `max-lg:flex max-md:hidden` collapses below md.
        const maxPositions = sizes.map((size) =>
            getPosition(root, `max-${size}:hidden`),
        );
        expect(maxPositions).not.toContain(-1);
        expect(maxPositions).toEqual([...maxPositions].sort((a, b) => b - a));
    });

    it('supports stacking a min and a max breakpoint variant', async () => {
        const root = await compile(['md:max-lg:block']);

        expect(getWrappers(root, 'md:max-lg:block')).toEqual([
            '@container app (width >= 48rem)',
            '@container app (width < 64rem)',
        ]);
    });

    it('keeps the screen variants on the viewport', async () => {
        const root = await compile([
            'screen-lg:sticky',
            'screen-max-lg:overflow-hidden',
        ]);

        expect(getWrappers(root, 'screen-lg:sticky')).toEqual([
            '@media (width >= 64rem)',
        ]);
        expect(getWrappers(root, 'screen-max-lg:overflow-hidden')).toEqual([
            '@media (width < 64rem)',
        ]);
    });

    it('declares the app container on the application column utility and as a fallback on the body', async () => {
        const root = await compile(['@container/app']);

        const declarations: Record<string, string[]> = {};
        root.walkDecls(/^container/, (decl) => {
            const selector = (decl.parent as { selector?: string }).selector;
            if (selector != null) {
                const className = readClassName(selector);
                declarations[className] ??= [];
                declarations[className].push(`${decl.prop}: ${decl.value}`);
            }
        });

        expect(declarations['.@container/app']).toEqual([
            'container-type: inline-size',
            'container-name: app',
        ]);
        expect(declarations.body).toEqual(['container: app / inline-size']);
    });
});
