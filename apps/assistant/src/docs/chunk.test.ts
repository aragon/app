import { buildBreadcrumb, chunkDocument, toEmbeddingInput } from './chunk';
import type { ICorpusDocument } from './corpus';

const buildDocument = (body: string): ICorpusDocument => ({
    path: 'accounts/account.md',
    title: 'Account',
    type: 'concept',
    status: 'ready',
    area: 'Accounts',
    body,
});

describe('chunkDocument', () => {
    it('cuts a page into its introduction and one passage per level-two section', () => {
        const chunks = chunkDocument(
            buildDocument(
                [
                    'The entity a user deploys.',
                    '',
                    '## What an account is',
                    '',
                    'It holds assets.',
                    '',
                    '### Display',
                    '',
                    'Name and avatar.',
                    '',
                    '## Naming',
                    '',
                    'Prefer account.',
                ].join('\n'),
            ),
        );

        expect(chunks.map((chunk) => chunk.breadcrumb)).toEqual([
            'Accounts › Account',
            'Accounts › Account › What an account is',
            'Accounts › Account › Naming',
        ]);
        expect(chunks[1]?.text).toEqual(
            '## What an account is\n\nIt holds assets.\n\n### Display\n\nName and avatar.',
        );
        expect(chunks.map((chunk) => chunk.id)).toEqual([
            'accounts/account.md#0',
            'accounts/account.md#1',
            'accounts/account.md#2',
        ]);
    });

    it('splits an oversized section at its subsections, then at paragraphs', () => {
        const paragraph = 'Words. '.repeat(20).trim();
        const chunks = chunkDocument(
            buildDocument(
                [
                    '## Long section',
                    '',
                    paragraph,
                    '',
                    '### Part one',
                    '',
                    paragraph,
                    '',
                    paragraph,
                    '',
                    '### Part two',
                    '',
                    paragraph,
                ].join('\n'),
            ),
            { maxChars: 250 },
        );

        expect(chunks.map((chunk) => chunk.section)).toEqual([
            'Long section',
            'Long section › Part one',
            'Long section › Part one',
            'Long section › Part two',
        ]);
        expect(chunks.every((chunk) => chunk.text.length <= 250)).toBe(true);
        expect(chunks[0]?.text.startsWith('## Long section')).toBe(true);
        expect(chunks[1]?.text.startsWith('### Part one')).toBe(true);
    });

    it('treats a heading inside a code fence as text', () => {
        const chunks = chunkDocument(
            buildDocument(
                ['## Sample', '', '```sh', '## not a heading', '```'].join(
                    '\n',
                ),
            ),
        );

        expect(chunks).toHaveLength(1);
        expect(chunks[0]?.text).toContain('## not a heading');
    });

    it('drops empty passages', () => {
        const chunks = chunkDocument(
            buildDocument('## Empty\n\n## Filled\n\nText.'),
        );

        expect(chunks.map((chunk) => chunk.section)).toEqual([
            'Empty',
            'Filled',
        ]);
        expect(chunkDocument(buildDocument(''))).toEqual([]);
    });
});

describe('toEmbeddingInput', () => {
    it('prefixes the passage with its breadcrumb and the page summary when there is one', () => {
        const chunk = { breadcrumb: 'Accounts › Account', text: 'Body.' };

        expect(toEmbeddingInput(chunk, 'What an account is.')).toEqual(
            'Accounts › Account\n\nWhat an account is.\n\nBody.',
        );
        expect(toEmbeddingInput(chunk)).toEqual('Accounts › Account\n\nBody.');
    });
});

describe('buildBreadcrumb', () => {
    it('joins the non-empty parts', () => {
        expect(buildBreadcrumb(['Accounts', 'Account', '', undefined])).toEqual(
            'Accounts › Account',
        );
    });
});
