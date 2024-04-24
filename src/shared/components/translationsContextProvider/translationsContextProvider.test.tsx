import { testLogger } from '@/test/utils';
import { render, renderHook, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
    TranslationsContextProvider,
    useTranslations,
    type ITranslationsContextProviderProps,
    type Translations,
} from './translationsContextProvider';

describe('<TranslationsContextProvider /> component', () => {
    const createTestComponent = (props?: Partial<ITranslationsContextProviderProps>) => {
        const completeProps: ITranslationsContextProviderProps = {
            translations: {} as Translations,
            ...props,
        };

        return <TranslationsContextProvider {...completeProps} />;
    };

    const createHookWrapper = (context?: Translations) =>
        function hookWrapper(props: { children: ReactNode }) {
            const completeContext: Translations = { ...context } as Translations;

            return (
                <TranslationsContextProvider translations={completeContext}>
                    {props.children}
                </TranslationsContextProvider>
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
            const context = { key: 'value' } as unknown as Translations;
            const { result } = renderHook(() => useTranslations(), { wrapper: createHookWrapper(context) });
            expect(result.current).toEqual(context);
        });
    });
});
