'use client';

import { CardEmptyState } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';

// Rendered as the PERMISSION_CONDITION fallback, so it must tolerate (and
// ignore) any condition payload props forwarded by the slot.
export const NoConditionSlot: React.FC = () => {
    const { t } = useTranslations();

    return (
        <CardEmptyState
            description={t('app.settings.noConditionSlot.description')}
            heading={t('app.settings.noConditionSlot.heading')}
            isStacked={false}
            objectIllustration={{ object: 'SETTINGS' }}
        />
    );
};
