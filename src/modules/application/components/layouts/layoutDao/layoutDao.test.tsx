import { daoOptions, daoSettingsOptions } from '@/shared/api/daoService';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { LayoutDao, type ILayoutDaoProps } from './layoutDao';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode; state?: unknown }) => (
        <div data-testid="hydration-mock" data-state={JSON.stringify(props.state)}>
            {props.children}
        </div>
    ),
}));

jest.mock('../../navigations/navigationDao', () => ({
    NavigationDao: () => <div data-testid="navigation-dao-mock" />,
}));

jest.mock('@/modules/application/components/errorBoundary/errorFallback', () => ({
    ErrorFallback: () => <div>Error fallback</div>,
}));

describe('<LayoutDao /> component', () => {
    const prefetchQuerySpy = jest.spyOn(QueryClient.prototype, 'prefetchQuery');
    const consoleErrorSpy = jest.spyOn(console, 'error');

    beforeEach(() => {
        consoleErrorSpy.mockImplementation(jest.fn());
        prefetchQuerySpy.mockImplementation(jest.fn());
    });

    afterEach(() => {
        prefetchQuerySpy.mockReset();
        consoleErrorSpy.mockReset();
    });

    const createTestComponent = async (props?: Partial<ILayoutDaoProps>) => {
        const completeProps: ILayoutDaoProps = {
            params: { id: 'test-dao' },
            ...props,
        };

        const Component = await LayoutDao(completeProps);
        return Component;
    };

    it('renders the navigation DAO component and children property', async () => {
        const children = 'test-children';
        render(await createTestComponent({ children }));
        expect(screen.getByTestId('navigation-dao-mock')).toBeInTheDocument();
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    it('prefetches the DAO and its settings from the given slug', async () => {
        const params = { id: 'my-dao' };
        const daoSettingsParams = { daoId: params.id };
        render(await createTestComponent({ params }));
        expect(prefetchQuerySpy.mock.calls[0][0].queryKey).toEqual(daoOptions({ urlParams: params }).queryKey);
        expect(prefetchQuerySpy.mock.calls[1][0].queryKey).toEqual(
            daoSettingsOptions({ urlParams: daoSettingsParams }).queryKey,
        );
    });

    it('dehydrates the query client state', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('hydration-mock')).toBeInTheDocument();
    });

    describe('error handling', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error');

        beforeEach(() => {
            consoleErrorSpy.mockImplementation(jest.fn());
        });

        afterEach(() => {
            consoleErrorSpy.mockReset();
        });

        it('displays an error feedback if an error is thrown by a children component', async () => {
            const ThrowErrorComponent = () => {
                throw new Error('Test error');
            };

            render(await createTestComponent({ children: <ThrowErrorComponent /> }));

            expect(screen.getByText('Error fallback')).toBeInTheDocument();
        });
    });
});
