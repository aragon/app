import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { IPageContext } from '../pageContext';
import { PageAside, type IPageAsideProps } from './pageAside';

jest.mock('../pageContext', () => ({
    PageContextProvider: (props: { value: IPageContext; children: ReactNode }) => (
        <div data-testid="page-context-mock" data-type={props.value.contentType}>
            {props.children}
        </div>
    ),
}));

describe('<Page.Aside /> component', () => {
    const createTestComponent = (props?: Partial<IPageAsideProps>) => {
        const completeProps: IPageAsideProps = { ...props };

        return <PageAside {...completeProps} />;
    };

    it('renders the children property', () => {
        const children = 'test-children';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    it('renders a page context to set the content type to "aside"', () => {
        render(createTestComponent());
        const pageContext = screen.getByTestId('page-context-mock');
        expect(pageContext).toBeInTheDocument();
        expect(pageContext.dataset.type).toEqual('aside');
    });
});
