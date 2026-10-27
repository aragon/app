import type { ICorpusDocument } from '@aragon/docs-corpus';
import { buildSite } from './buildContent';
import { diffSites } from './diffSite';

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

const siteOf = (
    documents: ICorpusDocument[],
    lastModified?: Map<string, string>,
) => buildSite(documents, new Map(), lastModified);

describe('diffSites', () => {
    it('reports the routes added, changed and removed, sorted', () => {
        const base = siteOf([
            document('accounts/account.md'),
            document('accounts/safe.md'),
            document('governance/process.md'),
        ]);
        const head = siteOf([
            document('accounts/account.md', { body: 'Rewritten.' }),
            document('governance/process.md'),
            document('governance/body.md'),
            document('accounts/linked-account.md'),
        ]);

        expect(diffSites(base, head)).toEqual({
            added: ['/accounts/linked-account', '/governance/body'],
            changed: ['/accounts/account'],
            removed: ['/accounts/safe'],
        });
    });

    it('counts a new title as a change and a new date as none', () => {
        const base = siteOf(
            [document('accounts/account.md'), document('accounts/safe.md')],
            new Map([['accounts/safe.md', '2026-01-01T00:00:00Z']]),
        );
        const head = siteOf(
            [
                document('accounts/account.md', { title: 'Account' }),
                document('accounts/safe.md'),
            ],
            new Map([['accounts/safe.md', '2026-02-01T00:00:00Z']]),
        );

        expect(diffSites(base, head)).toEqual({
            added: [],
            changed: ['/accounts/account'],
            removed: [],
        });
    });

    it('adds every page without a previous release', () => {
        const head = siteOf([document('accounts/account.md')]);

        expect(diffSites(undefined, head).added).toEqual(['/accounts/account']);
    });
});
