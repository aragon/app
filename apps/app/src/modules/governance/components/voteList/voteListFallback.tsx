import { CardEmptyState, type IEmptyStateProps } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';

export const VoteListFallback: React.FC<IEmptyStateProps> = () => {
    const { t } = useTranslations();

    return (
        <CardEmptyState
            description={t('app.governance.voteList.empty.description')}
            heading={t('app.governance.voteList.empty.title')}
            objectIllustration={{ object: 'ERROR' }}
        />
    );
};
