import { render, screen } from '@testing-library/react';
import * as useWalletConnected from '@/modules/application/hooks/useWalletConnected';
import { FeatureFlagsProvider } from '@/shared/components/featureFlagsProvider';
import * as useApplicationVersion from '@/shared/hooks/useApplicationVersion';
import { footerLinks } from './footerLinks';
import { Footer, FooterSidebar, type IFooterProps } from './index';

jest.mock('../../../../shared/components/aragonLogo', () => ({
    AragonLogo: () => <div data-testid="aragon-logo-mock" />,
}));

describe('<Footer /> component', () => {
    const useApplicationVersionSpy = jest.spyOn(
        useApplicationVersion,
        'useApplicationVersion',
    );
    const useWalletConnectedSpy = jest.spyOn(
        useWalletConnected,
        'useWalletConnected',
    );

    const createTestComponent = (
        props?: Partial<IFooterProps>,
        workspacesEnabled = false,
    ) => {
        const completeProps: IFooterProps = { ...props };

        return (
            <FeatureFlagsProvider
                initialSnapshot={[
                    {
                        key: 'workspaces',
                        name: 'Workspaces',
                        description: '',
                        enabled: workspacesEnabled,
                    },
                ]}
            >
                <Footer {...completeProps} />
            </FeatureFlagsProvider>
        );
    };

    beforeEach(() => {
        jest.useFakeTimers();
        useWalletConnectedSpy.mockReturnValue(false);
    });

    afterEach(() => {
        jest.useRealTimers();
        useWalletConnectedSpy.mockReset();
    });

    it('renders the aragon logo', () => {
        render(createTestComponent());
        expect(screen.getByTestId('aragon-logo-mock')).toBeInTheDocument();
    });

    it('renders the application version', () => {
        const version = 'v1.0.0';
        useApplicationVersionSpy.mockReturnValue(version);
        render(createTestComponent());
        expect(screen.getByText(version)).toBeInTheDocument();
    });

    it('renders the footer links', () => {
        render(createTestComponent());
        expect(screen.getAllByRole('link')).toHaveLength(footerLinks.length);
        footerLinks.forEach((link) => {
            const linkName = new RegExp(`footer.link.${link.label}`);
            const linkElement = screen.getByRole<HTMLAnchorElement>('link', {
                name: linkName,
            });
            expect(linkElement).toBeInTheDocument();
            expect(linkElement.href).toMatch(link.link);
        });
    });

    it('routes Explore to its dedicated page when workspaces are enabled', () => {
        render(createTestComponent(undefined, true));

        expect(
            screen.getByRole('link', {
                name: /footer.link.explore/,
            }),
        ).toHaveAttribute('href', '/explore');
    });

    it.each([
        [false, '/'],
        [true, '/explore'],
    ])(
        'routes the sidebar branding for wallet connection %s',
        (isConnected, href) => {
            useWalletConnectedSpy.mockReturnValue(isConnected);
            render(<FooterSidebar />);

            expect(
                screen.getByRole('link', {
                    name: /footer.governed/,
                }),
            ).toHaveAttribute('href', href);
        },
    );

    it('renders the copyright info', () => {
        jest.setSystemTime(new Date(2021, 2, 1));
        render(createTestComponent());
        expect(
            screen.getByText(/footer.copyright \(year=2021\)/),
        ).toBeInTheDocument();
    });
});
