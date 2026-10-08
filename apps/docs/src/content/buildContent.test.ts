import type { ICorpusDocument, ILinkContext } from '@aragon/docs-corpus';
import {
    buildSite,
    renderContentFiles,
    renderPublicFiles,
    resolveSiteLink,
    toRoute,
} from './buildContent';

const publishedPaths: ReadonlySet<string> = new Set([
    'accounts/account.md',
    'accounts/safe.md',
    'governance/process.md',
    'value-proposition.md',
]);

const contextOf = (path: string): ILinkContext => ({ path, publishedPaths });

const document = (
    path: string,
    overrides: Partial<ICorpusDocument> = {},
): ICorpusDocument => ({
    path,
    title: path,
    type: 'concept',
    area: 'Area',
    body: `Body of ${path}.`,
    ...overrides,
});

describe('toRoute', () => {
    it('maps a page to its route and an index page to its folder', () => {
        expect(toRoute('accounts/account.md')).toBe('/accounts/account');
        expect(toRoute('accounts/index.md')).toBe('/accounts');
        expect(toRoute('index.md')).toBe('/');
    });
});

describe('resolveSiteLink', () => {
    it('keeps same-page anchors and absolute links as written', () => {
        expect(
            resolveSiteLink('#stages', contextOf('governance/process.md')),
        ).toBe('#stages');
        expect(
            resolveSiteLink(
                'https://aragon.org/',
                contextOf('accounts/account.md'),
            ),
        ).toBe('https://aragon.org/');
    });

    it('sends protocol pages to their public GitHub page', () => {
        expect(
            resolveSiteLink(
                '../protocol-doc/core/dao.md#upgrades',
                contextOf('accounts/account.md'),
            ),
        ).toBe(
            'https://github.com/aragon/protocol-doc/blob/main/core/dao.md#upgrades',
        );
    });

    it('resolves a link to a published page onto its route, fragment kept', () => {
        expect(
            resolveSiteLink(
                '../accounts/account.md#naming',
                contextOf('governance/process.md'),
            ),
        ).toBe('/accounts/account#naming');
        expect(
            resolveSiteLink('./safe.md', contextOf('accounts/account.md')),
        ).toBe('/accounts/safe');
        expect(
            resolveSiteLink(
                '/governance/process.md',
                contextOf('accounts/account.md'),
            ),
        ).toBe('/governance/process');
    });

    it('resolves index pages onto their folder, the root index onto the home page', () => {
        expect(
            resolveSiteLink('./accounts/index.md', contextOf('index.md')),
        ).toBe('/accounts');
        expect(
            resolveSiteLink('../index.md', contextOf('accounts/account.md')),
        ).toBe('/');
    });

    it('drops links to pages the site does not publish', () => {
        expect(
            resolveSiteLink(
                './linked-account.md',
                contextOf('accounts/account.md'),
            ),
        ).toBeNull();
        // An area without a published page has no landing page either.
        expect(
            resolveSiteLink(
                '../treasury/index.md',
                contextOf('accounts/account.md'),
            ),
        ).toBeNull();
        expect(
            resolveSiteLink('./internal/index.md', contextOf('index.md')),
        ).toBeNull();
    });
});

const documents: ICorpusDocument[] = [
    document('accounts/account.md', {
        title: 'Account',
        area: 'Accounts',
        summary: 'What an account is.',
    }),
    document('accounts/safe.md', { title: 'Safe', area: 'Accounts' }),
    document('governance/process.md', {
        title: 'Governance: process',
        area: 'Governance',
        status: 'draft',
        body: 'Decides for the [account](/accounts/account).',
    }),
    document('value-proposition.md', {
        title: 'Value proposition',
        area: 'Aragon Platform',
    }),
];

const indexSources = new Map<string, string>([
    [
        'index.md',
        [
            '---',
            'okf_version: "0.1"',
            '---',
            '',
            '# Aragon Platform',
            '',
            'Start with the [value proposition](./value-proposition.md), then [Governance](./governance/index.md) and [Accounts](./accounts/index.md); [internal](./internal/index.md) stays out.',
        ].join('\n'),
    ],
    [
        'accounts/index.md',
        [
            '# Accounts',
            '',
            '- [Safe](./safe.md)',
            '- [Account](./account.md)',
            '- [Treasury](../treasury/index.md)',
            '',
            '## Open questions',
            '',
            '- [ ] Pending',
        ].join('\n'),
    ],
]);

describe('buildSite', () => {
    const site = buildSite(documents, indexSources);

    it('orders the areas by the root index links and the pages by their area index links', () => {
        expect(site.root.pages.map((page) => page.path)).toEqual([
            'value-proposition.md',
        ]);
        expect(site.areas.map((area) => area.dir)).toEqual([
            'governance',
            'accounts',
        ]);
        expect(site.areas[1]?.pages.map((page) => page.path)).toEqual([
            'accounts/safe.md',
            'accounts/account.md',
        ]);
    });

    it('builds the landing pages from the index files: title from the heading, body cleaned and resolved', () => {
        expect(site.root.title).toBe('Aragon Platform');
        expect(site.root.index).toMatchObject({ path: 'index.md', route: '/' });
        expect(site.root.index?.body).not.toContain('okf_version');
        expect(site.root.index?.body).toContain('[Accounts](/accounts)');
        expect(site.root.index?.body).toContain('internal stays out');

        const accounts = site.areas[1];
        expect(accounts?.index?.body).toBe(
            '- [Safe](/accounts/safe)\n- [Account](/accounts/account)\n- Treasury',
        );
    });

    it('names a folder without an index file after the area the loader read', () => {
        expect(site.areas[0]).toMatchObject({
            dir: 'governance',
            title: 'Governance',
            index: undefined,
        });
    });

    it('marks the pages under review', () => {
        expect(site.areas[0]?.pages[0]).toMatchObject({
            path: 'governance/process.md',
            draft: true,
        });
        expect(site.areas[1]?.pages[0]?.draft).toBe(false);
    });
});

describe('renderContentFiles', () => {
    const files = renderContentFiles(buildSite(documents, indexSources));
    const contentOf = (path: string) =>
        files.find((file) => file.path === path)?.content;

    it('writes a page with its frontmatter, quoted for YAML', () => {
        expect(contentOf('governance/process.md')).toBe(
            '---\ntitle: "Governance: process"\ndraft: true\n---\n\nDecides for the [account](/accounts/account).\n',
        );
        expect(contentOf('accounts/account.md')).toContain(
            'description: "What an account is."',
        );
        expect(contentOf('accounts/account.md')).not.toContain('draft');
    });

    it('writes the sidebar order of every folder, the rest of the folder after it', () => {
        expect(JSON.parse(contentOf('meta.json') ?? '')).toEqual({
            title: 'Aragon Platform',
            pages: [
                'index',
                'value-proposition',
                'governance',
                'accounts',
                '...',
            ],
        });
        expect(JSON.parse(contentOf('accounts/meta.json') ?? '')).toEqual({
            title: 'Accounts',
            pages: ['safe', 'account', '...'],
        });
    });
});

describe('renderPublicFiles', () => {
    const files = renderPublicFiles(buildSite(documents, indexSources));
    const contentOf = (path: string) =>
        files.find((file) => file.path === path)?.content;

    it('writes a markdown copy of every page with absolute links and the draft notice', () => {
        expect(contentOf('governance/process.md')).toBe(
            '# Governance: process\n\n> This page is a draft: the Aragon team is still reviewing it.\n\nDecides for the [account](https://app.aragon.org/help/accounts/account).\n',
        );
        expect(contentOf('accounts/index.md')).toContain(
            '[Safe](https://app.aragon.org/help/accounts/safe)',
        );
    });

    it('indexes the pages by area in llms.txt and concatenates them in llms-full.txt', () => {
        expect(contentOf('llms.txt')).toContain(
            '\n- [Value proposition](https://app.aragon.org/help/value-proposition.md)\n\n## Governance\n\n- [Governance: process](https://app.aragon.org/help/governance/process.md)\n\n## Accounts\n\n- [Safe](https://app.aragon.org/help/accounts/safe.md)\n- [Account](https://app.aragon.org/help/accounts/account.md): What an account is.\n',
        );
        expect(contentOf('llms-full.txt')).toContain(
            '\n---\n\n# Account (https://app.aragon.org/help/accounts/account)\n\nWhat an account is.\n\nBody of accounts/account.md.\n',
        );
    });
});
