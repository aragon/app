import { useTranslations } from '@/shared/components/translationsProvider';
import { CardEmptyState, type IEmptyStateProps } from '@aragon/gov-ui-kit';

export const VoteListFallback: React.FC<IEmptyStateProps> = () => {
    const { t } = useTranslations();

    return (
        <CardEmptyState
            objectIllustration={{ object: 'ERROR' }}
            heading={t('app.governance.voteList.empty.title')}
            description={t('app.governance.voteList.empty.description')}
        />
    );
};
