import { buildAgentSystemPrompt } from './agentPrompt';

describe('buildAgentSystemPrompt', () => {
    it('adds the product answers between the routing and the ticket flow with the documentation tools on', () => {
        const prompt = buildAgentSystemPrompt({ docsSearchEnabled: true });

        expect(prompt.indexOf('# What the user says')).toBeLessThan(
            prompt.indexOf('# Answering product questions'),
        );
        expect(prompt.indexOf('# Answering product questions')).toBeLessThan(
            prompt.indexOf('# Filing a ticket'),
        );
    });

    it('leaves the product answers out of the intake-only prompt', () => {
        const prompt = buildAgentSystemPrompt({ docsSearchEnabled: false });

        expect(prompt).not.toContain('# Answering product questions');
        expect(prompt).toContain('# Filing a ticket');
    });

    it('adds the attachment row only when the transcript carries a file', () => {
        expect(buildAgentSystemPrompt({ hasAttachments: true })).toContain(
            '[attached: <name>]',
        );
        expect(buildAgentSystemPrompt({ hasAttachments: false })).not.toContain(
            '[attached: <name>]',
        );
    });
});
