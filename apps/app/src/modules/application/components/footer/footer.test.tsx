import { fireEvent, render, screen } from '@testing-library/react';
import * as featureFlagsProvider from '@/shared/components/featureFlagsProvider';
import * as useApplicationVersion from '@/shared/hooks/useApplicationVersion';
import { Footer, type IFooterProps } from './footer';
import { footerLinks } from './footerLinks';

jest.mock('../../../../shared/components/aragonLogo', () => ({
    AragonLogo: () => <div data-testid="aragon-logo-mock" />,
}));

jest.mock('../supportChat', () => ({
    SupportChat: (props: { isOpen: boolean }) =>
        props.isOpen ? <div data-testid="support-chat-mock" /> : null,
}));

describe('<Footer /> component', () => {
    const useApplicationVersionSpy = jest.spyOn(
        useApplicationVersion,
        'useApplicationVersion',
    );

    const useFeatureFlagsSpy = jest.spyOn(
        featureFlagsProvider,
        'useFeatureFlags',
    );

    const setSupportChatEnabled = (enabled: boolean) => {
        useFeatureFlagsSpy.mockReturnValue({
            isEnabled: (key) => key === 'supportChat' && enabled,
        } as ReturnType<typeof featureFlagsProvider.useFeatureFlags>);
    };

    const createTestComponent = (props?: Partial<IFooterProps>) => {
        const completeProps: IFooterProps = { ...props };

        return <Footer {...completeProps} />;
    };

    beforeEach(() => {
        jest.useFakeTimers();
        setSupportChatEnabled(false);
    });

    afterEach(() => {
        jest.useRealTimers();
        useFeatureFlagsSpy.mockReset();
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

    it('opens the chat on help click when the support chat flag is enabled', () => {
        setSupportChatEnabled(true);
        render(createTestComponent());

        // With the flag on, help becomes a button (not an anchor) so hover / middle-click don't
        // advertise a portal URL the click won't follow — the remaining links stay anchors.
        expect(screen.getAllByRole('link')).toHaveLength(
            footerLinks.length - 1,
        );
        const helpButton = screen.getByRole('button', {
            name: /footer.link.help/,
        });

        fireEvent.click(helpButton);
        expect(screen.getByTestId('support-chat-mock')).toBeInTheDocument();
    });

    it('keeps the plain portal navigation when the flag is disabled', () => {
        setSupportChatEnabled(false);
        render(createTestComponent());

        fireEvent.click(screen.getByRole('link', { name: /footer.link.help/ }));
        expect(
            screen.queryByTestId('support-chat-mock'),
        ).not.toBeInTheDocument();
    });

    it('renders the copyright info', () => {
        jest.setSystemTime(new Date(2021, 2, 1));
        render(createTestComponent());
        expect(
            screen.getByText(/footer.copyright \(year=2021\)/),
        ).toBeInTheDocument();
    });
});
