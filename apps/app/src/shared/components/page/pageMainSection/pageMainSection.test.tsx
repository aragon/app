import { render, screen } from '@testing-library/react';
import { type IPageMainSectionProps, PageMainSection } from './pageMainSection';

describe('<PageMainSection /> component', () => {
    const createTestComponent = (props?: Partial<IPageMainSectionProps>) => {
        const completeProps: IPageMainSectionProps = {
            title: 'test-title',
            ...props,
        };

        return <PageMainSection {...completeProps} />;
    };

    it('renders the children property', () => {
        const children = 'page-section-children';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    it('renders the title as heading 2', () => {
        const title = 'main-title';
        render(createTestComponent({ title }));
        expect(
            screen.getByRole('heading', { name: title, level: 2 }),
        ).toBeInTheDocument();
    });

    it('renders the description property when defined', () => {
        const description = 'test-description';
        render(createTestComponent({ description }));
        expect(screen.getByText(description)).toBeInTheDocument();
    });

    it('renders the action as a primary button by default', () => {
        render(createTestComponent({ action: { label: 'action' } }));

        expect(screen.getByRole('button', { name: 'action' })).toHaveClass(
            'bg-accent-default',
        );
    });

    it('renders the action with the given variant', () => {
        render(
            createTestComponent({
                action: { label: 'action', variant: 'secondary' },
            }),
        );

        const button = screen.getByRole('button', { name: 'action' });
        expect(button).toHaveClass('bg-accent-default-inverse');
        expect(button).not.toHaveClass('bg-accent-default');
    });
});
