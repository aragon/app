import { render, screen } from '@testing-library/react';
import { Footer, type IFooterProps } from './footer';
import { footerLinks } from './footerLinks';

jest.mock('../applicationTags', () => ({ ApplicationTags: () => <div data-testid="application-tags-mock" /> }));
jest.mock('../aragonLogo', () => ({ AragonLogo: () => <div data-testid="aragon-logo-mock" /> }));

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

    it('renders the aragon logo', () => {
        render(createTestComponent());
        expect(screen.getByTestId('aragon-logo-mock')).toBeInTheDocument();
    });

    it('renders the application tags', () => {
        render(createTestComponent());
        expect(screen.getByTestId('application-tags-mock')).toBeInTheDocument();
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
