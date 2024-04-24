import { translationUtils } from './translationsUtils';

describe('translations utils', () => {
    it('returns the application translations', async () => {
        const result = await translationUtils.getTranslations();
        expect(result).toBeDefined();
    });
});
