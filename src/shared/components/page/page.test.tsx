import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Page, type IPageProps } from './page';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode; state?: unknown }) => (
        <div data-testid="hydration-mock">
            {props.children}
            {JSON.stringify(props.state)}
        </div>
    ),
}));

describe('<Page /> component', () => {
    const createTestComponent = (props?: Partial<IPageProps>) => {
        const completeProps: IPageProps = { ...props };

        return <Page {...completeProps} />;
    };

    it('renders the children property', () => {
        const children = 'test';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    it('renders the react-query hydration wrapper', () => {
        render(createTestComponent());
        expect(screen.getByTestId('hydration-mock')).toBeInTheDocument();
    });

    it('dehydrates the query client when set', () => {
        const queryClient = new QueryClient();
        const queryData = { key: 'value' };
        queryClient.setQueryData(['test'], queryData);
        render(createTestComponent({ queryClient }));
        expect(screen.getByText(new RegExp(JSON.stringify(queryData)))).toBeInTheDocument();
    });
});
