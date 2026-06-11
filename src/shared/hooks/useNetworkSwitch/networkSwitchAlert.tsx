import { AlertCard } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface INetworkSwitchAlertProps {
    /** Whether the wallet's current chain differs from the required chain. */
    isCrossNetworkTransaction: boolean;
    /** Human-readable name of the required network. */
    networkName: string | undefined;
}

export const NetworkSwitchAlert: React.FC<INetworkSwitchAlertProps> = (
    props,
) => {
    const { isCrossNetworkTransaction, networkName } = props;

    const { t } = useTranslations();

    if (!isCrossNetworkTransaction || networkName == null) {
        return null;
    }

    return (
        <AlertCard
            message={t('app.shared.transactionDialog.networkAlert.title')}
            variant="info"
        >
            {t('app.shared.transactionDialog.networkAlert.body', {
                transactionNetworkName: networkName,
            })}
        </AlertCard>
    );
};
