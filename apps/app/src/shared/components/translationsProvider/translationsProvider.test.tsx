import { render, renderHook, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { Translations } from '@/shared/utils/translationsUtils';
import { testLogger } from '@/test/utils';
import {
    type ITranslationsProviderProps,
    TranslationsProvider,
    useSafeTranslations,
    useTranslations,
} from './translationsProvider';

describe('<TranslationsProvider /> component', () => {
    const createTestComponent = (
        props?: Partial<ITranslationsProviderProps>,
    ) => {
        const completeProps: ITranslationsProviderProps = {
            translations: {} as Translations,
            ...props,
        };

        return <TranslationsProvider {...completeProps} />;
    };

    const createHookWrapper = (context?: Translations) =>
        function hookWrapper(props: { children: ReactNode }) {
            const completeContext: Translations = {
                ...context,
            } as Translations;

            return (
                <TranslationsProvider translations={completeContext}>
                    {props.children}
                </TranslationsProvider>
            );
        };

    it('renders the children property', () => {
        const children = 'test';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    describe('useTranslations hook', () => {
        it('throws error when not wrapped inside a TranslationsContext provider', () => {
            testLogger.suppressErrors();
            expect(() => renderHook(() => useTranslations())).toThrow();
        });

        it('returns the context values', () => {
            const translations = { key: 'value' } as unknown as Translations;
            const { result } = renderHook(() => useTranslations(), {
                wrapper: createHookWrapper(translations),
            });
            expect(result.current.t('key')).toEqual('value');
        });
    });

    describe('useSafeTranslations hook', () => {
        it('resolves keys from the fallback dictionary and echoes unknown keys when not wrapped inside a provider', () => {
            const { result } = renderHook(() =>
                useSafeTranslations({ key: 'fallback' }),
            );
            expect(result.current.t('key')).toEqual('fallback');
            expect(result.current.t('other')).toEqual('other');
        });

        it('returns the context values when a provider is available', () => {
            const translations = { key: 'value' } as unknown as Translations;
            const { result } = renderHook(
                () => useSafeTranslations({ key: 'fallback' }),
                { wrapper: createHookWrapper(translations) },
            );
            expect(result.current.t('key')).toEqual('value');
        });
    });
});
