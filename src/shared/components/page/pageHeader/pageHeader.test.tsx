import { render, screen } from '@testing-library/react';
import { PageHeader, type IPageHeaderProps } from './pageHeader';

describe('<Page.Header /> component', () => {
    const createTestComponent = (props?: Partial<IPageHeaderProps>) => {
        const completeProps: IPageHeaderProps = { ...props };

        return <PageHeader {...completeProps} />;
    };

    it('renders the title as heading 1', () => {
        const title = 'Page title';
        render(createTestComponent({ title }));
        expect(screen.getByRole('heading', { name: title, level: 1 })).toBeInTheDocument();
    });

    it('renders the description property when defined', () => {
        const description = 'page-description';
        render(createTestComponent({ description }));
        expect(screen.getByText(description)).toBeInTheDocument();
    });

    it('renders the children property', () => {
        const children = 'header-children';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    it('renders the pae stats when defined', () => {
        const stats = [
            { label: 'stat-1', value: 'value-1' },
            { label: 'stat-2', value: 'value-2' },
        ];
        render(createTestComponent({ stats }));
        stats.forEach((stat) => {
            expect(screen.getByText(stat.label)).toBeInTheDocument();
            expect(screen.getByText(stat.value)).toBeInTheDocument();
        });
    });

    it('renders the avatar when defined', () => {
        const avatar = 'test-avatar';
        render(createTestComponent({ avatar }));
        expect(screen.getByText(avatar)).toBeInTheDocument();
    });
});
