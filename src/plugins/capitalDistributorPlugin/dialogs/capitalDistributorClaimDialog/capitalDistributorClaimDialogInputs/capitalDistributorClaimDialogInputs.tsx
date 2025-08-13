import type { ICapitalDistributorPlugin } from '@/plugins/capitalDistributorPlugin/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { sanctionedAddressList } from '@/shared/constants/sanctionedAddressList';
import { useFormField } from '@/shared/hooks/useFormField';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { addressUtils, InputText } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';
import type { ICapitalDistributorClaimDialogForm } from '../capitalDistributorClaimDialogDefinitions';

export interface ICapitalDistributorClaimDialogInputsProps {
    /**
     * Capital distributor plugin.
     */
    plugin: ICapitalDistributorPlugin;
}

export const CapitalDistributorClaimDialogInputs: React.FC<ICapitalDistributorClaimDialogInputsProps> = (props) => {
    const { plugin } = props;

    const { t } = useTranslations();
    const { address } = useAccount();

    const validateRecipient = (value: string) => {
        if (!addressUtils.isAddress(value)) {
            return false;
        }

        const isSanctionedAddress = sanctionedAddressList.includes(value);

        if (plugin.enableOfacCheck && isSanctionedAddress) {
            const context = { pluginAddress: plugin.address, userAddress: address, recipient: value };
            monitoringUtils.logMessage('Capital Distributor: Claim error (OFAC)', { level: 'warning', context });

            return 'app.plugins.capitalDistributor.capitalDistributorClaimDialog.inputs.recipient.error.ofac';
        }

        return true;
    };

    const recipientField = useFormField<ICapitalDistributorClaimDialogForm, 'recipient'>('recipient', {
        label: t('app.plugins.capitalDistributor.capitalDistributorClaimDialog.inputs.recipient.label'),
        rules: { required: true, validate: validateRecipient },
    });

    return (
        <InputText
            helpText={t('app.plugins.capitalDistributor.capitalDistributorClaimDialog.inputs.recipient.helpText')}
            {...recipientField}
        />
    );
};
