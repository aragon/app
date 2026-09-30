import { buildAgentSystemPrompt } from './agentPrompt';

describe('buildAgentSystemPrompt', () => {
    it('reads role, answering, tickets and tone in that order with the documentation tools on', () => {
        const prompt = buildAgentSystemPrompt({ docsSearchEnabled: true });
        const headings = [...prompt.matchAll(/^# (.+)$/gm)].map(
            (match) => match[1],
        );

        expect(headings).toEqual([
            'Role',
            'Answering questions',
            'Tickets',
            'Tone',
        ]);
    });

    it('leaves the answering rules out of the intake-only prompt', () => {
        const prompt = buildAgentSystemPrompt({ docsSearchEnabled: false });

        expect(prompt).not.toContain('# Answering questions');
        expect(prompt).not.toContain('searchDocs');
        expect(prompt).toContain("can't answer product questions here");
        expect(prompt).toContain('# Tickets');
    });

    it('explains the attachment line only when the transcript carries a file', () => {
        expect(buildAgentSystemPrompt({ hasAttachments: true })).toContain(
            '[attached: <name>]',
        );
        expect(buildAgentSystemPrompt({ hasAttachments: false })).not.toContain(
            '[attached: <name>]',
        );
    });
});
