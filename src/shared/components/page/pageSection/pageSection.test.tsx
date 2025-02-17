import { render, screen } from '@testing-library/react';
import { PageSection, type IPageSectionProps } from './pageSection';

describe('<PageSection /> component', () => {
    const createTestComponent = (props?: Partial<IPageSectionProps>) => {
        const completeProps: IPageSectionProps = {
            title: 'test-title',
            ...props,
        };

        return <PageSection {...completeProps} />;
    };

    it('renders the children property', () => {
        const children = 'page-section-children';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    it('renders the title as heading 2 on main context', () => {
        const title = 'main-title';
        render(createTestComponent({ title }));
        expect(screen.getByRole('heading', { name: title, level: 2 })).toBeInTheDocument();
    });

    it('renders the description property when defined', () => {
        const description = 'test-description';
        render(createTestComponent({ description }));
        expect(screen.getByText(description)).toBeInTheDocument();
    });
});
