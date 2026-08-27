'use client';

import { Button, IconType } from '@aragon/gov-ui-kit';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface ITelegramSubscriptionCardProps {
    /**
     * ID of the DAO, forwarded to the bot as its `start` parameter so the subscription is
     * bound to this DAO (e.g. `ethereum-sepolia-0x2da3...`).
     */
    daoId: string;
}

/**
 * Aside card linking to the Telegram bot that delivers DAO notifications. The bot handle is
 * configured per environment through `NEXT_PUBLIC_TELEGRAM_BOT_NAME`, so the card renders
 * nothing when the environment has no bot configured or the feature flag is off.
 */
export const TelegramSubscriptionCard: React.FC<
    ITelegramSubscriptionCardProps
> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();
    const { isEnabled } = useFeatureFlags();

    const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME;

    if (!isEnabled('telegramSubscription') || !botName) {
        return null;
    }

    const subscribeUrl = `https://t.me/${encodeURIComponent(botName)}?start=${encodeURIComponent(daoId)}`;

    return (
        <Page.AsideCard
            title={t('app.dashboard.telegramSubscriptionCard.title')}
        >
            <p className="text-neutral-500">
                {t('app.dashboard.telegramSubscriptionCard.description')}
            </p>
            <Button
                className="w-full"
                href={subscribeUrl}
                iconRight={IconType.LINK_EXTERNAL}
                size="md"
                target="_blank"
                variant="secondary"
            >
                {t('app.dashboard.telegramSubscriptionCard.action')}
            </Button>
        </Page.AsideCard>
    );
};
