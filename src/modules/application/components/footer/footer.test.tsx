import { render, screen } from '@testing-library/react';
import { Footer, type IFooterProps } from './footer';
import { footerLinks } from './footerLinks';

describe('<Footer /> component', () => {
    const originalProcessEnv = process.env;

    const createTestComponent = (props?: Partial<IFooterProps>) => {
        const completeProps: IFooterProps = { ...props };

        return <Footer {...completeProps} />;
    };

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        process.env = originalProcessEnv;
        jest.useRealTimers();
    });

    it('renders the application metadata info', () => {
        render(createTestComponent());
        expect(screen.getByRole('img', { name: 'Aragon logo' })).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'Aragon App logo' })).toBeInTheDocument();
        expect(screen.getByText(/footer.beta/)).toBeInTheDocument();
    });

    it('renders current version and DEV label on development environment', () => {
        process.env.version = '1.0.2';
        process.env.NEXT_PUBLIC_ENV = 'development';
        render(createTestComponent());
        expect(screen.getByText(/footer.versionEnv \(version=1.0.2,env=DEV\)/)).toBeInTheDocument();
    });

    it('renders current version and STG label on staging environment', () => {
        process.env.version = '0.0.1';
        process.env.NEXT_PUBLIC_ENV = 'staging';
        render(createTestComponent());
        expect(screen.getByText(/footer.versionEnv \(version=0.0.1,env=STG\)/)).toBeInTheDocument();
    });

    it('only renders current version of production environment', () => {
        process.env.version = '1.5.0';
        process.env.NEXT_PUBLIC_ENV = 'production';
        render(createTestComponent());
        expect(screen.getByText(/footer.version \(version=1.5.0,env=undefined\)/)).toBeInTheDocument();
    });

    it('renders the footer links', () => {
        render(createTestComponent());
        expect(screen.getAllByRole('link')).toHaveLength(footerLinks.length);
        footerLinks.forEach((link) => {
            const linkName = new RegExp(`footer.link.${link.label}`);
            const linkElement = screen.getByRole<HTMLAnchorElement>('link', { name: linkName });
            expect(linkElement).toBeInTheDocument();
            expect(linkElement.href).toMatch(link.link);
        });
    });

    it('renders the copyright info', () => {
        jest.setSystemTime(new Date(2021, 2, 1));
        render(createTestComponent());
        expect(screen.getByText(/footer.copyright \(year=2021\)/)).toBeInTheDocument();
    });
});
