/**
 * @jest-environment node
 */
import path from 'node:path';
import tailwindcss from '@tailwindcss/postcss';
import postcss, { type AtRule, type Root, type Rule } from 'postcss';

// Compiles breakpoints.css the way layoutRoot.css does and pins what each variant means, so a
// Tailwind upgrade that stops honouring the overrides fails here instead of in the layout.
describe('breakpoints.css', () => {
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

    // Strips Tailwind's selector escapes (`.\32 xl\:flex` → `.2xl:flex`).
    const readSelector = (selector: string) =>
        selector.replace(/\\3(\d) /g, '$1').replaceAll('\\', '');

    // The media half of a variant only applies outside the application column.
    const outsideColumn = ':where(:not(.@container/app *))';

    const findRules = (root: Root, className: string): Rule[] => {
        const rules: Rule[] = [];
        root.walkRules((rule) => {
            const selector = readSelector(rule.selector);
            if (
                selector === `.${className}` ||
                selector.startsWith(`.${className}:where(`)
            ) {
                rules.push(rule);
            }
        });

        return rules;
    };

    // Selector and wrapping at-rules (outermost first) of every rule generated for a class.
    const describeRules = (root: Root, className: string) =>
        findRules(root, className).map((rule) => {
            const wrappers: string[] = [];
            let parent = rule.parent;
            while (parent && parent.type === 'atrule') {
                const atRule = parent as AtRule;
                if (atRule.name !== 'layer') {
                    wrappers.unshift(`@${atRule.name} ${atRule.params}`);
                }
                parent = atRule.parent;
            }

            return { selector: readSelector(rule.selector), wrappers };
        });

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

    it('measures the column inside it and the window outside it', async () => {
        const root = await compile(sizes.map((size) => `${size}:flex`));

        for (const size of sizes) {
            const className = `${size}:flex`;
            expect(describeRules(root, className)).toEqual([
                {
                    selector: `.${className}`,
                    wrappers: [`@container app (width >= ${thresholds[size]})`],
                },
                {
                    selector: `.${className}${outsideColumn}`,
                    wrappers: [`@media (width >= ${thresholds[size]})`],
                },
            ]);
        }
    });

    it('does the same for the max variants', async () => {
        const root = await compile(sizes.map((size) => `max-${size}:hidden`));

        for (const size of sizes) {
            const className = `max-${size}:hidden`;
            expect(describeRules(root, className)).toEqual([
                {
                    selector: `.${className}`,
                    wrappers: [`@container app (width < ${thresholds[size]})`],
                },
                {
                    selector: `.${className}${outsideColumn}`,
                    wrappers: [`@media (width < ${thresholds[size]})`],
                },
            ]);
        }
    });

    // Tailwind's `min-*` still derives its query from the theme, so it tells whether the literals
    // in breakpoints.css drifted from `--breakpoint-*`.
    it('uses the breakpoint thresholds of the theme', async () => {
        const root = await compile(sizes.map((size) => `min-${size}:flex`));

        for (const size of sizes) {
            expect(describeRules(root, `min-${size}:flex`)).toEqual([
                {
                    selector: `.min-${size}:flex`,
                    wrappers: [`@media (width >= ${thresholds[size]})`],
                },
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
        expect(minPositions).not.toContain(-1);
        expect(minPositions).toEqual([...minPositions].sort((a, b) => a - b));

        // Narrower max ranges win, so `max-lg:flex max-md:hidden` collapses below md.
        const maxPositions = sizes.map((size) =>
            getPosition(root, `max-${size}:hidden`),
        );
        expect(maxPositions).not.toContain(-1);
        expect(maxPositions).toEqual([...maxPositions].sort((a, b) => b - a));
    });

    // Stacking nests both halves in both halves; the mixed pairs never match and are harmless.
    it('supports stacking a min and a max breakpoint variant', async () => {
        const root = await compile(['md:max-lg:block']);

        expect(
            describeRules(root, 'md:max-lg:block').map((rule) => rule.wrappers),
        ).toEqual(
            expect.arrayContaining([
                [
                    '@container app (width >= 48rem)',
                    '@container app (width < 64rem)',
                ],
                ['@media (width >= 48rem)', '@media (width < 64rem)'],
            ]),
        );
    });

    it('keeps the screen variants on the viewport everywhere', async () => {
        const root = await compile([
            'screen-lg:sticky',
            'screen-max-lg:overflow-hidden',
        ]);

        expect(describeRules(root, 'screen-lg:sticky')).toEqual([
            {
                selector: '.screen-lg:sticky',
                wrappers: ['@media (width >= 64rem)'],
            },
        ]);
        expect(describeRules(root, 'screen-max-lg:overflow-hidden')).toEqual([
            {
                selector: '.screen-max-lg:overflow-hidden',
                wrappers: ['@media (width < 64rem)'],
            },
        ]);
    });

    // A container on `body` or `html` would cut the propagation of the body's background and
    // overflow to the canvas and the viewport (css-contain-2 §3).
    it('declares the app container on the column utility only', async () => {
        const root = await compile(['@container/app']);

        const declarations: Record<string, string[]> = {};
        root.walkDecls(/^container/, (decl) => {
            const selector = (decl.parent as { selector?: string }).selector;
            if (selector != null) {
                const key = readSelector(selector);
                declarations[key] ??= [];
                declarations[key].push(`${decl.prop}: ${decl.value}`);
            }
        });

        expect(declarations).toEqual({
            '.@container/app': [
                'container-type: inline-size',
                'container-name: app',
            ],
        });
    });
});
