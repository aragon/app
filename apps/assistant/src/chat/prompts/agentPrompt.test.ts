import { buildAgentSystemPrompt } from './agentPrompt';

describe('buildAgentSystemPrompt', () => {
    it('puts the product answers between the role and the tickets with the documentation tools on', () => {
        const prompt = buildAgentSystemPrompt({ docsSearchEnabled: true });

        expect(prompt.indexOf('# Role')).toBeLessThan(
            prompt.indexOf('# Answering questions'),
        );
        expect(prompt.indexOf('# Answering questions')).toBeLessThan(
            prompt.indexOf('# Tickets'),
        );
    });

    it('leaves the product answers out of the intake-only prompt', () => {
        const prompt = buildAgentSystemPrompt({ docsSearchEnabled: false });

        expect(prompt).not.toContain('# Answering questions');
        expect(prompt).not.toContain('searchDocs');
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
