'use client';

import { CardEmptyState } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';

export const AdminVotingTerminal: React.FC = () => {
    const { t } = useTranslations();

    return (
        <CardEmptyState
            description={t('app.plugins.admin.adminVotingTerminal.description')}
            heading={t('app.plugins.admin.adminVotingTerminal.title')}
            isStacked={false}
            objectIllustration={{ object: 'USERS' }}
        />
    );
};
