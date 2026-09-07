import { render, screen } from '@testing-library/react';
import * as featureFlagsProvider from '@/shared/components/featureFlagsProvider';
import {
    type ITelegramSubscriptionCardProps,
    TelegramSubscriptionCard,
} from './telegramSubscriptionCard';

describe('<TelegramSubscriptionCard /> component', () => {
    const useFeatureFlagsSpy = jest.spyOn(
        featureFlagsProvider,
        'useFeatureFlags',
    );

    const originalBotName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME;

    const setFeatureEnabled = (enabled: boolean) => {
        useFeatureFlagsSpy.mockReturnValue({
            isEnabled: (key) => key === 'telegramSubscription' && enabled,
        } as ReturnType<typeof featureFlagsProvider.useFeatureFlags>);
    };

    beforeEach(() => {
        setFeatureEnabled(true);
        process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME = 'aragon_test_bot';
    });

    afterEach(() => {
        useFeatureFlagsSpy.mockReset();
        process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME = originalBotName;
    });

    const createTestComponent = (
        props?: Partial<ITelegramSubscriptionCardProps>,
    ) => {
        const completeProps: ITelegramSubscriptionCardProps = {
            daoId: 'ethereum-sepolia-0x2da3',
            ...props,
        };

        return <TelegramSubscriptionCard {...completeProps} />;
    };

    it('renders a link to the configured bot with the dao id as start parameter', () => {
        const daoId = 'ethereum-sepolia-0x2da3';
        render(createTestComponent({ daoId }));

        expect(
            screen.getByText(/telegramSubscriptionCard.title/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/telegramSubscriptionCard.description/),
        ).toBeInTheDocument();

        const link = screen.getByRole('link', {
            name: /telegramSubscriptionCard.action/,
        });
        expect(link).toHaveAttribute(
            'href',
            `https://t.me/aragon_test_bot?start=${daoId}`,
        );
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('renders nothing when the feature flag is disabled', () => {
        setFeatureEnabled(false);
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when no bot is configured for the environment', () => {
        process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME = '';
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });
});
