import type {
    IAppContext,
    IChatMessage,
    ICreateTicketToolInput,
} from '@aragon/assistant-contracts';
import { buildIssueDescription, buildIssueTitle } from './issueBody';

const sessionId = 'b3b8f8a2-6c9d-4c9e-8f6a-2d1e0c9b8a7f';

const fields: ICreateTicketToolInput = {
    intent: 'bug',
    email: 'user@example.com',
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
        expect(description).toContain('- **Email:** user@example.com');
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

        // Extracted fields render quoted line by line — no heading, mention, collapsible or
        // checklist marker of the user content ever starts a line in the Description section.
        for (const line of injection.split('\n')) {
            expect(description).toContain(`> ${line}`);
        }
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

    it('renders the reproduction steps as a numbered quoted list', () => {
        const description = buildIssueDescription({
            sessionId,
            fields: {
                ...fields,
                stepsToReproduce: ['Open the proposal page', 'Press Vote'],
            },
            appContext,
            messages: [buildUserMessage('hello')],
            files: [],
        });

        expect(description).toContain('## Steps to reproduce');
        expect(description).toContain('> 1. Open the proposal page');
        expect(description).toContain('> 2. Press Vote');
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
