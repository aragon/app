import { render, screen } from '@testing-library/react';
import { type IResourceLinkProps, ResourceLink } from './resourceLink';

describe('<ResourceLink /> component', () => {
    const createTestComponent = (props?: Partial<IResourceLinkProps>) => {
        const completeProps: IResourceLinkProps = {
            url: 'https://example.com',
            isExternal: true,
            ...props,
        };

        return <ResourceLink {...completeProps} />;
    };

    it('uses the URL once as link text when the name is empty', () => {
        const url = 'https://example.com';
        render(createTestComponent({ name: '', url }));

        const link = screen.getByRole('link', { name: url });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', url);
        expect(screen.getAllByText(url)).toHaveLength(1);
    });

    it('uses the name as link text and shows the URL when the name is present', () => {
        const url = 'https://example.com';
        render(createTestComponent({ name: 'Example', url }));

        const link = screen.getByRole('link', { name: /Example/ });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', url);
        expect(screen.getByText(url)).toBeInTheDocument();
    });
});
