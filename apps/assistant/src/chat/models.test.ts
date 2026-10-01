import { getConfig } from '../lib/config';
import {
    defaultChatReasoning,
    getChatModels,
    getChatProviderOptions,
    getChatReasoning,
} from './models';

describe('getChatProviderOptions', () => {
    it('routes every call to zero-data-retention providers only', () => {
        const { gateway } = getChatProviderOptions(['fallback/model']);

        expect(gateway.zeroDataRetention).toBe(true);
        expect(gateway.models).toEqual(['fallback/model']);
    });

    it('leaves the reasoning level to the provider-neutral call setting', () => {
        const { openai } = getChatProviderOptions([]);

        expect(openai).not.toHaveProperty('reasoningEffort');
    });
});

describe('getChatReasoning', () => {
    it('configures a level for every model of the chain', () => {
        const { reasoning } = getConfig().chat;

        for (const model of getChatModels()) {
            expect(reasoning[model]).toBeDefined();
        }
    });

    it("returns a chain model's own level and the default for any other model", () => {
        const [agentModel] = getChatModels();

        expect(getChatReasoning(agentModel)).toBe(
            getConfig().chat.reasoning[agentModel],
        );
        expect(getChatReasoning('some/other-model')).toBe(defaultChatReasoning);
    });
});
