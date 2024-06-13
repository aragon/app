import { render, screen } from '@testing-library/react';
import { PageContent, type IPageContentProps } from './pageContent';

describe('<Page.Content /> component', () => {
    const createTestComponent = (props?: Partial<IPageContentProps>) => {
        const completeProps: IPageContentProps = { ...props };

        return <PageContent {...completeProps} />;
    };

    it('renders the children property', () => {
        const children = 'page-content-children';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });
});
