import type {
    IAppContext,
    IChatMessage,
    ICreateTicketToolInput,
} from '@aragon/assistant-contracts';
import {
    buildIssueDescription,
    buildIssueTitle,
    issueLabelByIntent,
} from './issueBody';

const sessionId = 'b3b8f8a2-6c9d-4c9e-8f6a-2d1e0c9b8a7f';

const fields: ICreateTicketToolInput = {
    intent: 'bug',
    contact: 'user@example.com',
    title: 'Voting crashes on Base',
    description: 'The vote button crashes the page.',
};

const appContext: IAppContext = {
    route: '/dao/proposals',
    appVersion: '1.33.2',
    daoAddress: '0x123',
    network: 'base-mainnet',
};

const buildUserMessage = (text: string): IChatMessage => ({
    id: 'user-1',
    role: 'user',
    parts: [{ type: 'text', text }],
});

describe('buildIssueTitle', () => {
    it('uses the ticket title and falls back when blank', () => {
        expect(buildIssueTitle(fields)).toEqual('Voting crashes on Base');
        expect(buildIssueTitle({ ...fields, title: '   ' })).toEqual(
            'Support request from the Aragon App',
        );
    });
});

describe('buildIssueDescription', () => {
    it('renders fields, app context, attachments and the collapsed transcript', () => {
        const description = buildIssueDescription({
            sessionId,
            fields,
            appContext,
            messages: [buildUserMessage('The vote button crashes the page.')],
            files: [
                {
                    assetUrl: 'https://uploads.linear.app/shot.png',
                    filename: 'shot.png',
                },
            ],
        });

        expect(description).toContain('- **Intent:** bug');
        expect(description).toContain('- **Contact:** user@example.com');
        expect(description).toContain(`- **Session:** \`${sessionId}\``);
        expect(description).toContain('- **DAO:** 0x123');
        expect(description).toContain(
            '- [shot.png](https://uploads.linear.app/shot.png)',
        );
        expect(description).toContain('+++ Transcript');
    });

    it('quotes the extracted fields and fences the transcript so markdown cannot escape', () => {
        const injection =
            '# Fake heading\n@aragon-team urgent\n+++ Collapse\n- [ ] task';
        const description = buildIssueDescription({
            sessionId,
            fields: { ...fields, description: injection },
            appContext,
            messages: [buildUserMessage(injection)],
            files: [],
        });

        // Extracted fields render quoted and escaped line by line — no heading, mention,
        // collapsible or checklist marker of the user content renders, inside the quote or out.
        expect(description).toContain(
            '> \\# Fake heading\n> @aragon-team urgent\n> +++ Collapse\n> - \\[ \\] task',
        );
        // The raw transcript renders as inert fenced data with an explicit provenance note for
        // any automation reading the ticket later.
        expect(description).toContain('untrusted end-user input');
        expect(description).toMatch(/```text\n# Fake heading/);
    });

    it('extends the transcript fence beyond any backtick run inside the message', () => {
        const message = 'before\n```\ninjected fence';
        const description = buildIssueDescription({
            sessionId,
            fields,
            appContext,
            messages: [buildUserMessage(message)],
            files: [],
        });

        // Three backticks inside → the wrapping fence uses four, so the content cannot close it.
        expect(description).toContain('````text');
    });

    it('escapes the contact and attachment filenames so they cannot inject markdown', () => {
        const description = buildIssueDescription({
            sessionId,
            fields: {
                ...fields,
                contact: 'me@example.com\n## Injected heading',
            },
            appContext,
            messages: [buildUserMessage('hello')],
            files: [
                {
                    assetUrl: 'https://uploads.linear.app/shot.png',
                    filename: 'shot](https://evil.example)[.png',
                },
            ],
        });

        expect(description).not.toMatch(/^## Injected heading/m);
        expect(description).toContain(
            '- **Contact:** me@example.com \\#\\# Injected heading',
        );
        expect(description).not.toContain('](https://evil.example)');
        expect(description).toContain(
            '- [shot\\]\\(https://evil.example\\)\\[.png](https://uploads.linear.app/shot.png)',
        );
    });

    it('quotes every line of the description and steps, whatever its line ending', () => {
        const description = buildIssueDescription({
            sessionId,
            fields: {
                ...fields,
                description: 'Voting fails.\r# Injected heading\r\n- [ ] task',
                stepsToReproduce: ['Open the proposal\r## Injected step'],
            },
            appContext,
            messages: [buildUserMessage('hello')],
            files: [],
        });

        expect(description).not.toContain('\r');
        expect(description).toContain(
            '> Voting fails.\n> \\# Injected heading\n> - \\[ \\] task',
        );
        expect(description).toContain(
            '> 1. Open the proposal\n> \\#\\# Injected step',
        );
    });

    it('escapes the quoted description so markdown cannot render inside the quote', () => {
        const description = buildIssueDescription({
            sessionId,
            fields: {
                ...fields,
                description:
                    'Reset at [this link](https://evil.example), ask @[Kevin](user-uuid) for `help`',
            },
            appContext,
            messages: [buildUserMessage('hello')],
            files: [],
        });

        expect(description).not.toContain('](https://evil.example)');
        expect(description).toContain(
            '> Reset at \\[this link\\]\\(https://evil.example\\), ask @\\[Kevin\\]\\(user-uuid\\) for \\`help\\`',
        );
    });

    it('escapes the client-posted app context so it cannot inject markdown', () => {
        const description = buildIssueDescription({
            sessionId,
            fields,
            appContext: {
                route: '/dao [replay](https://evil.example/r)',
                appVersion: '1.0.0 ![](https://evil.example/p.png)',
                daoAddress: '<img src="https://evil.example/i.png">',
                network: 'base-mainnet',
                walletAddress: '0xabc` [w](https://evil.example/w) x',
                recentTransactions: [
                    {
                        type: '[t](https://evil.example/t)',
                        status: '<b>ok</b>',
                        hash: '0x1` [h](https://evil.example/h)',
                    },
                ],
            },
            messages: [buildUserMessage('hello')],
            files: [],
        });

        expect(description).toContain(
            '- **Route:** /dao \\[replay\\]\\(https://evil.example/r\\)',
        );
        expect(description).toContain(
            '- **App version:** 1.0.0 !\\[\\]\\(https://evil.example/p.png\\)',
        );
        expect(description).toContain(
            '- **DAO:** \\<img src="https://evil.example/i.png"\\>',
        );
        expect(description).toContain(
            '- **Wallet:** 0xabc\\` \\[w\\]\\(https://evil.example/w\\) x',
        );
        // Values inside code spans get a delimiter longer than their own backtick runs.
        expect(description).toContain(
            '- **Sentry:** search ``user.id:0xabc` [w](https://evil.example/w) x``',
        );
        expect(description).toContain(
            '- \\[t\\]\\(https://evil.example/t\\) — \\<b\\>ok\\</b\\> ``0x1` [h](https://evil.example/h)``',
        );
    });

    it('renders the reproduction steps as a numbered quoted list', () => {
        const description = buildIssueDescription({
            sessionId,
            fields: {
                ...fields,
                // The second step is model-numbered despite the schema: its prefix must be
                // stripped so the applied numbering never doubles up ("2. 2. Press Vote").
                stepsToReproduce: ['Open the proposal page', '2. Press Vote'],
            },
            appContext,
            messages: [buildUserMessage('hello')],
            files: [],
        });

        expect(description).toContain('## Steps to reproduce');
        expect(description).toContain('> 1. Open the proposal page');
        expect(description).toContain('> 2. Press Vote');
        expect(description).not.toContain('2. 2.');
    });

    it('omits empty context rows and optional sections', () => {
        const description = buildIssueDescription({
            sessionId,
            fields,
            appContext: { route: '/home', appVersion: '1.0.0' },
            messages: [buildUserMessage('hello')],
            files: [],
        });

        expect(description).not.toContain('**DAO:**');
        expect(description).not.toContain('**Wallet:**');
        expect(description).not.toContain('**Chain ID:**');
        expect(description).not.toContain('**Sentry:**');
        expect(description).not.toContain('## Recent transactions');
        expect(description).not.toContain('## Attachments');
        expect(description).not.toContain('## Steps to reproduce');
    });

    it('renders the auto-collected debug context (chainId, transactions, Sentry pointer)', () => {
        const description = buildIssueDescription({
            sessionId,
            fields,
            appContext: {
                ...appContext,
                walletAddress: '0xabc',
                chainId: 8453,
                recentTransactions: [
                    { hash: '0xdeadbeef', status: 'SUBMITTED', type: 'vote' },
                    { status: 'FAILED' },
                ],
            },
            messages: [buildUserMessage('hello')],
            files: [],
        });

        expect(description).toContain('- **Chain ID:** 8453');
        expect(description).toContain('- **Sentry:** search `user.id:0xabc`');
        expect(description).toContain('## Recent transactions');
        expect(description).toContain('- vote — SUBMITTED `0xdeadbeef`');
        expect(description).toContain('- transaction — FAILED');
    });
});

describe('issueLabelByIntent', () => {
    it('files an unanswered product question as a documentation gap', () => {
        expect(issueLabelByIntent.question).toEqual('docs-gap');
        expect(issueLabelByIntent.support).toEqual('bug');
    });
});
