import { daoOptions } from '@/shared/api/daoService';
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

describe('<LayoutDao /> component', () => {
    const prefetchQuerySpy = jest.spyOn(QueryClient.prototype, 'prefetchQuery');

    beforeEach(() => {
        prefetchQuerySpy.mockImplementation(jest.fn());
    });

    afterEach(() => {
        prefetchQuerySpy.mockReset();
    });

    const createTestComponent = async (props?: Partial<ILayoutDaoProps>) => {
        const completeProps: ILayoutDaoProps = {
            params: { slug: 'test-dao' },
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

    it('prefetches the DAO from the given slug', async () => {
        const params = { slug: 'my-dao' };
        render(await createTestComponent({ params }));
        expect(prefetchQuerySpy.mock.calls[0][0].queryKey).toEqual(daoOptions({ urlParams: params }).queryKey);
    });

    it('dehydrates the query client state', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('hydration-mock')).toBeInTheDocument();
    });
});
