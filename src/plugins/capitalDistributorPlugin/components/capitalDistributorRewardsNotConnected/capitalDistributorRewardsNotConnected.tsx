import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Card, EmptyState, IconType } from '@aragon/gov-ui-kit';

export interface ICapitalDistributorRewardsNotConnectedProps {}

export const CapitalDistributorRewardsNotConnected: React.FC<ICapitalDistributorRewardsNotConnectedProps> = () => {
    const { t } = useTranslations();
    const { open } = useDialogContext();

    return (
        <Card>
            <EmptyState
                heading={t('app.plugins.capitalDistributor.capitalDistributorRewardsNotConnected.heading')}
                description={t('app.plugins.capitalDistributor.capitalDistributorRewardsNotConnected.description')}
                objectIllustration={{ object: 'WALLET' }}
                primaryButton={{
                    label: t('app.plugins.capitalDistributor.capitalDistributorRewardsNotConnected.action'),
                    onClick: () => open(ApplicationDialogId.CONNECT_WALLET),
                    iconLeft: IconType.BLOCKCHAIN_WALLET
                }}
            />
        </Card>
    );
};
