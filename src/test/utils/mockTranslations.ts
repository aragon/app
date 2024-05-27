import * as TranslationsProvider from '@/shared/components/translationsProvider';
import type { ITFuncOptions } from '@/shared/utils/translationsUtils';

class MockTranslations {
    private shouldMockTranslations = true;

    private tMock = (key: string, options?: ITFuncOptions) => {
        if (options == null) {
            return key;
        }

        const values = Object.keys(options).map((key) => `${key}=${options[key]}`);

        return `${key} (${values.toString()})`;
    };

    setup = () => {
        const useTranslationsSpy = jest.spyOn(TranslationsProvider, 'useTranslations');

        beforeEach(() => {
            if (this.shouldMockTranslations) {
                useTranslationsSpy.mockReturnValue({ t: this.tMock });
            }
        });

        afterEach(() => {
            useTranslationsSpy.mockRestore();
            this.shouldMockTranslations = true;
        });
    };

    useOriginalImplementation = () => {
        this.shouldMockTranslations = false;
    };
}

export const mockTranslations = new MockTranslations();
