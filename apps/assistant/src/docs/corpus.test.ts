import path from 'node:path';
import { cleanBody, loadCorpus, rewriteLinks } from './corpus';

// Jest runs from the workspace root (its rootDir), which is what the paths below assume.
const fixtureRoot = path.resolve('src/test/fixtures/docsCorpus');

describe('loadCorpus', () => {
    it('keeps only validated knowledge pages in ready mode: status ready, or no status at all', async () => {
        const { documents } = await loadCorpus({
            rootDir: fixtureRoot,
            mode: 'ready',
        });

        // The base removes `status: draft` once the owner validated a page, so a page without a
        // status is a validated one.
        expect(documents.map((document) => document.path)).toEqual([
            'accounts/account.md',
            'design/wizard.md',
            'governance/action-simulation.md',
        ]);
        expect(
            documents.find((document) => document.path === 'design/wizard.md')
                ?.status,
        ).toBeUndefined();
    });

    it('adds the pages under review in drafts mode', async () => {
        const { documents } = await loadCorpus({
            rootDir: fixtureRoot,
            mode: 'drafts',
        });

        expect(documents.map((document) => document.path)).toEqual([
            'accounts/account.md',
            'accounts/linked-account.md',
            'design/wizard.md',
            'governance/action-simulation.md',
            'governance/process.md',
            'guides/lenient.md',
        ]);
    });

    it('reads the frontmatter line by line when it is not strict YAML', async () => {
        const { documents } = await loadCorpus({
            rootDir: fixtureRoot,
            mode: 'drafts',
        });
        const lenient = documents.find(
            (document) => document.path === 'guides/lenient.md',
        );

        // The `source:` line quotes a title with a colon — a YAML error the base's own tooling
        // shrugs at. The page keeps its type, title and status.
        expect(lenient).toMatchObject({
            type: 'guide',
            title: 'Choose a voting-power mechanism',
            status: 'draft',
        });
    });

    it('fails closed and reports why each file was left out', async () => {
        const { skipped } = await loadCorpus({
            rootDir: fixtureRoot,
            mode: 'drafts',
        });

        expect(
            Object.fromEntries(
                skipped.map(({ path, reason }) => [path, reason]),
            ),
        ).toEqual({
            'accounts/index.md': 'no-frontmatter',
            'broken.md': 'invalid-frontmatter',
            'governance/blocked-topic.md': 'status',
            'index.md': 'no-frontmatter',
            'notes.md': 'not-knowledge',
            'tasks/reconcile.md': 'not-knowledge',
            'treasury/vault.md': 'no-title',
        });
        // The inbox passes every frontmatter gate and is still out: skipped by directory, so it
        // never appears — neither as a document nor as a skipped file.
        expect(skipped.some(({ path }) => path.startsWith('inbox/'))).toBe(
            false,
        );
    });

    it('leaves the internal folder out in every mode: builder material, not product knowledge', async () => {
        const { documents, skipped } = await loadCorpus({
            rootDir: fixtureRoot,
            mode: 'drafts',
        });

        // A validated principle page by every frontmatter rule — its folder alone excludes it,
        // the way the base's own workflow excludes `internal/` from user-facing content.
        expect(
            documents.some((document) => document.path.startsWith('internal/')),
        ).toBe(false);
        expect(skipped.some(({ path }) => path.startsWith('internal/'))).toBe(
            false,
        );
    });

    it('rewrites the links of a page for a reader outside the wiki', async () => {
        const { documents } = await loadCorpus({
            rootDir: fixtureRoot,
            mode: 'drafts',
        });
        const body =
            documents.find(
                (document) => document.path === 'governance/process.md',
            )?.body ?? '';

        // Protocol pages get their public GitHub address, fragment included, whichever way the
        // base reached the submodule.
        expect(body).toContain(
            '[plugin](https://github.com/aragon/protocol-doc/blob/main/framework/plugins.md#what-a-plugin-is)',
        );
        expect(body).toContain(
            '[Staged Proposal Processor](https://github.com/aragon/protocol-doc/blob/main/plugins/spp-plugin.md)',
        );
        // Links to other pages of the base, and to sections of the same page, keep their text
        // only: the base has no public home to link to.
        expect(body).toContain('installs it for an account.');
        expect(body).toContain('one or more stages (stage). Each');
        expect(body).toContain('see how a stage advances and the');
        expect(body).not.toContain('accounts/account.md');
        expect(body).not.toContain('stage.md');
        // Absolute links stay (the angle-bracket form loses its brackets), images and fenced
        // code are left alone.
        expect(body).toContain('[Safe docs](https://help.safe.global/en/)');
        expect(body).toContain(
            '[assistance form](https://www.aragon.org/get-assistance-form)',
        );
        expect(body).toContain('![Stage diagram](./stage-diagram.png)');
        expect(body).toContain('[not a link](./kept-verbatim.md)');
    });

    it('names the area after the folder index heading, or the folder itself without one', async () => {
        const { documents } = await loadCorpus({
            rootDir: fixtureRoot,
            mode: 'drafts',
        });
        const areaByPath = Object.fromEntries(
            documents.map((document) => [document.path, document.area]),
        );

        expect(areaByPath['accounts/account.md']).toEqual('Accounts');
        expect(areaByPath['governance/process.md']).toEqual('Governance');
    });

    it('reads title, status, type and summary from the frontmatter', async () => {
        const { documents } = await loadCorpus({
            rootDir: fixtureRoot,
            mode: 'drafts',
        });
        const linked = documents.find(
            (document) => document.path === 'accounts/linked-account.md',
        );

        expect(linked).toMatchObject({
            title: 'Linked account',
            type: 'capability',
            status: 'draft',
            summary:
                'How an account links another account and what linking does not imply.',
        });
    });

    it('strips the frontmatter, the title heading, the maintenance sections and checklists from the body', async () => {
        const { documents } = await loadCorpus({
            rootDir: fixtureRoot,
            mode: 'ready',
        });
        const body = documents[0]?.body ?? '';

        expect(body.startsWith('The entity a user deploys')).toBe(true);
        expect(body).not.toContain('---');
        expect(body).not.toContain('# Account\n');
        expect(body).not.toContain('Open questions');
        expect(body).not.toContain('explore page show the account creator');
        expect(body).not.toContain('Notes under the open question');
        // The section after the skipped one comes back.
        expect(body).toContain('## Naming');
        expect(body).toContain('### Metadata-backed display');
    });
});

describe('cleanBody', () => {
    it('ignores headings and checklists inside code fences', () => {
        const body = cleanBody(
            [
                '# Title',
                '',
                'Intro.',
                '',
                '```text',
                '# not a heading',
                '- [ ] not a checklist',
                '```',
                '',
                '- [x] a real checklist item',
            ].join('\n'),
        );

        expect(body).toContain('# not a heading');
        expect(body).toContain('- [ ] not a checklist');
        expect(body).not.toContain('a real checklist item');
    });

    it('keeps a second level-one heading: only the title is dropped', () => {
        expect(cleanBody('# Title\n\n# Another\n\nText.')).toEqual(
            '# Another\n\nText.',
        );
    });
});

describe('rewriteLinks', () => {
    it('maps every relative form of a protocol link onto the same GitHub page', () => {
        expect(rewriteLinks('[a](./protocol-doc/core/dao.md)')).toEqual(
            '[a](https://github.com/aragon/protocol-doc/blob/main/core/dao.md)',
        );
        expect(
            rewriteLinks('[b](../protocol-doc/core/dao.md#keep-in-mind)'),
        ).toEqual(
            '[b](https://github.com/aragon/protocol-doc/blob/main/core/dao.md#keep-in-mind)',
        );
        expect(rewriteLinks('[c](/protocol-doc/index.md)')).toEqual(
            '[c](https://github.com/aragon/protocol-doc/blob/main/index.md)',
        );
    });

    it('keeps the text of relative links and the whole of absolute ones, several per line', () => {
        expect(
            rewriteLinks(
                'See [accounts](../accounts/account.md), [this section](#naming) and [Aragon](https://aragon.org).',
            ),
        ).toEqual(
            'See accounts, this section and [Aragon](https://aragon.org).',
        );
        expect(rewriteLinks('Mail [us](mailto:support@aragon.org).')).toEqual(
            'Mail [us](mailto:support@aragon.org).',
        );
    });
});
