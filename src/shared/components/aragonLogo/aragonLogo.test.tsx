import { render, screen } from '@testing-library/react';
import { AragonLogo, type IAragonLogoProps } from './aragonLogo';

describe('<AragonLogo /> component', () => {
    const createTestComponent = (props?: Partial<IAragonLogoProps>) => {
        const completeProps: IAragonLogoProps = { ...props };
        return <AragonLogo data-testid="logo-container" {...completeProps} />;
    };

    it('renders the complete logo by default', () => {
        render(createTestComponent());

        const logoWithText = screen.getByRole('img', { name: 'Aragon logo' });
        expect(logoWithText).toBeInTheDocument();

        const iconLogo = screen.queryByRole('img', { name: 'Aragon icon logo' });
        expect(iconLogo).not.toBeInTheDocument();
    });

    it('renders the icon only when iconOnly prop is true', () => {
        render(createTestComponent({ iconOnly: true }));

        const iconLogo = screen.getByRole('img', { name: 'Aragon icon logo' });
        expect(iconLogo).toBeInTheDocument();

        const logoWithText = screen.queryByRole('img', { name: 'Aragon logo' });
        expect(logoWithText).not.toBeInTheDocument();
    });

    it('renders both logos with responsive classes when responsiveIconOnly is true', () => {
        render(createTestComponent({ responsiveIconOnly: true }));

        const iconLogo = screen.getByRole('img', { name: 'Aragon icon logo' });
        const logoWithText = screen.getByRole('img', { name: 'Aragon logo' });

        expect(iconLogo).toBeInTheDocument();
        expect(logoWithText).toBeInTheDocument();

        const mobileContainer = screen.getByTestId('mobile-logo-container');
        const desktopContainer = screen.getByTestId('desktop-logo-container');

        expect(mobileContainer).toHaveClass('block', 'md:hidden');
        expect(desktopContainer).toHaveClass('hidden', 'md:block');

        expect(mobileContainer).toContainElement(iconLogo);
        expect(desktopContainer).toContainElement(logoWithText);
    });

    it('applies default variant and size classes', () => {
        render(createTestComponent());

        const logoContainer = screen.getByTestId('logo-container');
        expect(logoContainer).toHaveClass('text-primary-400', 'h-8');
    });

    it('applies the white variant class', () => {
        render(createTestComponent({ variant: 'white' }));

        const logoContainer = screen.getByTestId('logo-container');
        expect(logoContainer).toHaveClass('text-neutral-0');
    });

    it('applies the small size class', () => {
        render(createTestComponent({ size: 'sm' }));

        const logoContainer = screen.getByTestId('logo-container');
        expect(logoContainer).toHaveClass('h-6');
    });
});
