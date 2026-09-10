import { docsToolNames } from '@aragon/assistant-contracts';
import { createDocsSearch } from '../../docs/docsSearch';
import { observability } from '../../lib/observability';
import { docsIndexArtifact } from '../../test/fixtures/docsIndexFixture';
import { buildDocsTools } from './docsTools';

const sessionId = 'b3b8f8a2-6c9d-4c9e-8f6a-2d1e0c9b8a7f';
// The execution options the SDK passes to a tool; these tools read none of them.
const toolOptions = { toolCallId: 'call-1', messages: [], context: {} };

describe('docs tools', () => {
    const buildTools = () =>
        buildDocsTools({
            docsSearch: createDocsSearch(docsIndexArtifact),
            sessionId,
        });

    it('searches the documentation and logs counters, never the query', async () => {
        const logStepSpy = jest
            .spyOn(observability, 'logStep')
            .mockImplementation(jest.fn());
        const tools = buildTools();

        const output = (await tools[docsToolNames.searchDocs].execute?.(
            { query: 'linking control permissions' },
            toolOptions,
        )) as { results: Array<{ path: string }> };

        expect(output.results[0]?.path).toEqual('accounts/linked-account.md');
        expect(logStepSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                sessionId,
                step: 'searchDocs',
                resultCount: output.results.length,
                docsCorpus: 'drafts',
            }),
        );
        expect(JSON.stringify(logStepSpy.mock.calls)).not.toContain(
            'linking control permissions',
        );
        logStepSpy.mockRestore();
    });

    it('reads a page by path and answers softly when there is none', async () => {
        const tools = buildTools();

        const page = (await tools[docsToolNames.readDoc].execute?.(
            { path: 'accounts/account.md' },
            toolOptions,
        )) as { title: string; content: string };
        const missing = (await tools[docsToolNames.readDoc].execute?.(
            { path: 'nowhere.md' },
            toolOptions,
        )) as { found: boolean };

        expect(page.title).toEqual('Account');
        expect(page.content).toContain('## What an account is');
        expect(missing.found).toBe(false);
    });

    it('lists the pages of an area', async () => {
        const tools = buildTools();

        const output = (await tools[docsToolNames.listDocs].execute?.(
            { area: 'Accounts' },
            toolOptions,
        )) as { docs: Array<{ title: string }> };

        expect(output.docs.map((entry) => entry.title)).toEqual([
            'Account',
            'Linked account',
        ]);
    });
});
