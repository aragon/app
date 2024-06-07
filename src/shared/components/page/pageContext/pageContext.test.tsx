import { testLogger } from '@/test/utils';
import { render, renderHook, screen } from '@testing-library/react';
import type { ProviderProps, ReactNode } from 'react';
import { PageContextProvider, usePageContext, type IPageContext } from './pageContext';

describe('<PageContextProvider /> component', () => {
    const createTestComponent = (props?: Partial<ProviderProps<IPageContext>>) => {
        const completeProps: ProviderProps<IPageContext> = {
            value: { contentType: 'aside' },
            ...props,
        };

        return <PageContextProvider {...completeProps} />;
    };

    const createHookWrapper = (context?: Partial<IPageContext>) =>
        function hookWrapper(props: { children: ReactNode }) {
            const completeContext: IPageContext = {
                contentType: 'aside',
                ...context,
            };

            return <PageContextProvider value={completeContext}>{props.children}</PageContextProvider>;
        };

    it('renders the children property', () => {
        const children = 'test';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    describe('usePageContext hook', () => {
        it('throws error when not wrapped inside a PageContext provider', () => {
            testLogger.suppressErrors();
            expect(() => renderHook(() => usePageContext())).toThrow();
        });

        it('returns the context values', () => {
            const context = { contentType: 'main' as const };
            const { result } = renderHook(() => usePageContext(), { wrapper: createHookWrapper(context) });
            expect(result.current).toEqual(context);
        });
    });
});
