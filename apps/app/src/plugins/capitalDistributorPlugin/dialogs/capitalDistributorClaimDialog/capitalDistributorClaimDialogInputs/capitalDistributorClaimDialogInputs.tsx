import { addressUtils, InputText } from '@aragon/gov-ui-kit';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import type { ICapitalDistributorPlugin } from '@/plugins/capitalDistributorPlugin/types';
import { useSanctionedAddresses } from '@/shared/api/cmsService';
import type { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import type { ICapitalDistributorClaimDialogForm } from '../capitalDistributorClaimDialogDefinitions';

export interface ICapitalDistributorClaimDialogInputsProps {
    /**
     * Capital distributor plugin.
     */
    plugin: ICapitalDistributorPlugin;
    /**
     * Network of the plugin.
     */
    network: Network;
}

export const CapitalDistributorClaimDialogInputs: React.FC<
    ICapitalDistributorClaimDialogInputsProps
> = (props) => {
    const { plugin, network } = props;

    const { t } = useTranslations();
    const { address } = useWalletAccount();

    const { data: sanctionedAddresses } = useSanctionedAddresses();

    const validateRecipient = (value: string) => {
        if (!addressUtils.isAddress(value)) {
            return false;
        }

        if (!plugin.enableOfacCheck) {
            return true;
        }

        // Fail closed: a recipient is only cleared against a loaded, well-formed sanctions list. A list
        // whose entries are not addresses, or one that names no address at all, matches nobody and
        // would clear everyone.
        // A sanctioned EVM address is the same key on every chain, and the CMS file does not list
        // every network, so the recipient is checked against the lists of all networks.
        const sanctionedLists =
            sanctionedAddresses == null
                ? []
                : Object.values(sanctionedAddresses);
        const sanctionedEntries: unknown[] = sanctionedLists.every((list) =>
            Array.isArray(list),
        )
            ? sanctionedLists.flat()
            : [];
        const isAddressEntry = (entry: unknown): entry is string =>
            typeof entry === 'string' && addressUtils.isAddress(entry);
        if (
            sanctionedEntries.length === 0 ||
            !sanctionedEntries.every(isAddressEntry)
        ) {
            return 'app.plugins.capitalDistributor.capitalDistributorClaimDialog.inputs.recipient.error.ofacUnavailable';
        }

        const isSanctionedAddress = sanctionedEntries.some((sanctioned) =>
            addressUtils.isAddressEqual(sanctioned, value),
        );

        if (isSanctionedAddress) {
            const context = {
                pluginAddress: plugin.address,
                network,
                userAddress: address,
                recipient: value,
            };
            monitoringUtils.logMessage(
                'Capital Distributor: Claim error (OFAC)',
                { level: 'warning', context },
            );

            return 'app.plugins.capitalDistributor.capitalDistributorClaimDialog.inputs.recipient.error.ofac';
        }

        return true;
    };

    const recipientField = useFormField<
        ICapitalDistributorClaimDialogForm,
        'recipient'
    >('recipient', {
        label: t(
            'app.plugins.capitalDistributor.capitalDistributorClaimDialog.inputs.recipient.label',
        ),
        rules: { required: true, validate: validateRecipient },
    });

    return (
        <InputText
            helpText={t(
                'app.plugins.capitalDistributor.capitalDistributorClaimDialog.inputs.recipient.helpText',
            )}
            {...recipientField}
        />
    );
};
