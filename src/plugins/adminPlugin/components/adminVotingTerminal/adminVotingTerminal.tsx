import { useTranslations } from '@/shared/components/translationsProvider';
import { CardEmptyState } from '@aragon/gov-ui-kit';

export const AdminVotingTerminal: React.FC = () => {
    const { t } = useTranslations();

    return (
        <CardEmptyState
            heading={t('app.plugins.admin.adminVotingTerminal.title')}
            description={t('app.plugins.admin.adminVotingTerminal.description')}
            objectIllustration={{ object: 'USERS' }}
        />
    );
};
