import { render, screen } from '@testing-library/react';
import { PageAside, type IPageAsideProps } from './pageAside';

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
});
