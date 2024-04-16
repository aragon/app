import { render, screen } from '@testing-library/react';
import { Footer, type IFooterProps } from './footer';
import { footerLinks } from './footerLinks';

describe('<Footer /> component', () => {
    const createServerComponent = async (props?: Partial<IFooterProps>) => {
        const completeProps: IFooterProps = { ...props };
        const Component = await Footer(completeProps);

        return Component;
    };

    it('renders the footer links', async () => {
        render(await createServerComponent());
        expect(screen.getAllByRole('link')).toHaveLength(footerLinks.length);
    });
});
