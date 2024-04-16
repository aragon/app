import type { ITranslationContext } from '@/shared/components/translationsProvider';
import * as TranslationsProvider from '@/shared/components/translationsProvider';
import type { ITFuncOptions } from '@/shared/utils/translationsUtils';

class MockTranslations {
    private shouldMockTranslations = true;

    tMock = (key: string, options?: ITFuncOptions) => {
        if (options == null) {
            return key;
        }

        const values = Object.keys(options).map((key) => `${key}=${options[key]?.toString() ?? 'undefined'}`);

        return `${key} (${values.toString()})`;
    };

    setup = () => {
        let useTranslationsSpy: jest.SpyInstance<ITranslationContext> | undefined;

        beforeEach(() => {
            if (this.shouldMockTranslations) {
                useTranslationsSpy = jest
                    .spyOn(TranslationsProvider, 'useTranslations')
                    .mockReturnValue({ t: this.tMock });
            }
        });

        afterEach(() => {
            useTranslationsSpy?.mockRestore();
            this.shouldMockTranslations = true;
        });
    };

    useOriginalImplementation = () => {
        this.shouldMockTranslations = false;
    };
}

export const mockTranslations = new MockTranslations();
