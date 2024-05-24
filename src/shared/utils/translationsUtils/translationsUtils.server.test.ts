import { translationUtilsServer } from './translationsUtils.server';

describe('translations utils (server)', () => {
    it('returns the application translations', async () => {
        const result = await translationUtilsServer.getTranslations();
        expect(result).toBeDefined();
    });
});
