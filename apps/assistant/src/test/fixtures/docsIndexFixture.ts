import type { IDocsIndexArtifact } from '../../docs/docsIndexArtifact';

// A tiny built index (no vectors: searches run full-text) standing in for the generated
// `docs/generated/docsIndex.js` in tests — see the jest moduleNameMapper — and behind the test
// dependencies' docs search.
export const docsIndexArtifact: IDocsIndexArtifact = {
    meta: {
        version: 1,
        mode: 'drafts',
        builtAt: '2026-09-08T00:00:00.000Z',
        corpusHash: 'fixture',
        documentCount: 2,
        chunkCount: 3,
    },
    documents: [
        {
            path: 'accounts/account.md',
            title: 'Account',
            breadcrumb: 'Accounts › Account',
        },
        {
            path: 'accounts/linked-account.md',
            title: 'Linked account',
            breadcrumb: 'Accounts › Linked account',
            summary:
                'How an account links another account and what linking does not imply.',
        },
    ],
    chunks: [
        {
            id: 'accounts/account.md#0',
            path: 'accounts/account.md',
            title: 'Account',
            breadcrumb: 'Accounts › Account',
            text: 'The entity a user deploys and governs through the app. Two vocabularies name it: account, the product term, and DAO, the protocol contract.',
        },
        {
            id: 'accounts/account.md#1',
            path: 'accounts/account.md',
            title: 'Account',
            breadcrumb: 'Accounts › Account › What an account is',
            text: '## What an account is\n\nAn account holds assets and acts on-chain. It is the product term for what the protocol calls a DAO.',
        },
        {
            id: 'accounts/linked-account.md#0',
            path: 'accounts/linked-account.md',
            title: 'Linked account',
            breadcrumb: 'Accounts › Linked account',
            text: 'An account can link another account to show a relationship without any control. Linking is a signal; control comes only from permissions.',
        },
    ],
};
