'use client';

import { CardEmptyState } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';

export const UnrecognizedConditionSlot: React.FC = () => {
    const { t } = useTranslations();

    return (
        <CardEmptyState
            description={t(
                'app.settings.unrecognizedConditionSlot.description',
            )}
            heading={t('app.settings.unrecognizedConditionSlot.heading')}
            isStacked={false}
            objectIllustration={{ object: 'SETTINGS' }}
        />
    );
};
