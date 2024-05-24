import { render, screen } from '@testing-library/react';
import { Footer, type IFooterProps } from './footer';
import { footerLinks } from './footerLinks';

describe('<Footer /> component', () => {
    const createTestComponent = (props?: Partial<IFooterProps>) => {
        const completeProps: IFooterProps = { ...props };

        return <Footer {...completeProps} />;
    };

    it('renders the footer links', () => {
        render(createTestComponent());
        expect(screen.getAllByRole('link')).toHaveLength(footerLinks.length);
    });
});
