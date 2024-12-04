import { testLogger } from '@/test/utils';
import { translationUtils, type Translations } from './translationsUtils';

describe('translations utils', () => {
    describe('t function', () => {
        it('returns the string associated to the given key', () => {
            const key = 'app.module.component.key';
            const string = 'test-value';
            const translations = { app: { module: { component: { key: string } } } } as unknown as Translations;
            expect(translationUtils.t(translations)(key)).toEqual(string);
        });

        it('correctly replaces the given values on the translation', () => {
            const key = 'app.key';
            const string = 'String with values: {{firstValue}} and {{secondValue}}';
            const values = { firstValue: 'abc', secondValue: 123 };
            const translations = { app: { key: string } } as unknown as Translations;
            expect(translationUtils.t(translations)(key, { ...values })).toEqual(
                `String with values: ${values.firstValue} and ${values.secondValue.toString()}`,
            );
        });

        it('returns the translation as is when values to replace are not found', () => {
            const key = 'app.key';
            const string = 'Not found values {{first}} and {{second}}';
            const values = { third: 'value' };
            const translations = { app: { key: string } } as unknown as Translations;
            expect(translationUtils.t(translations)(key, { ...values })).toEqual(string);
        });

        it('returns the translation key when the relative value is not found', () => {
            testLogger.suppressErrors();
            const notFound = 'notFound';
            const partial = 'app.module';
            const nested = 'app.module.key.another';
            const translations = { app: { module: { key: 'value' } } } as unknown as Translations;
            expect(translationUtils.t(translations)(notFound)).toEqual(notFound);
            expect(translationUtils.t(translations)(partial)).toEqual(partial);
            expect(translationUtils.t(translations)(nested)).toEqual(nested);
        });
    });
});
