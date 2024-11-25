import { useTranslations } from '@/shared/components/translationsProvider';
import { AlertCard } from '@aragon/gov-ui-kit';

export const AdminVotingTerminal: React.FC = () => {
    const { t } = useTranslations();

    return (
        <AlertCard
            message={t('app.plugins.admin.adminVotingTerminal.title')}
            description={t('app.plugins.admin.adminVotingTerminal.description')}
            variant="info"
        />
    );
};
