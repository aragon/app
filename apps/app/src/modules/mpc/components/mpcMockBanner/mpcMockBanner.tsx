'use client';

import { AlertCard } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IMpcMockBannerProps {
    /**
     * Additional classes for the banner.
     */
    className?: string;
}

/**
 * POC banner: reminds the user that the threshold cryptography is mocked (Shamir 2-of-3 in the browser).
 */
export const MpcMockBanner: React.FC<IMpcMockBannerProps> = (props) => {
    const { className } = props;
    const { t } = useTranslations();

    return (
        <AlertCard
            className={className}
            message={t('app.mpc.mpcMockBanner.title')}
            variant="warning"
        >
            {t('app.mpc.mpcMockBanner.description')}
        </AlertCard>
    );
};
