'use client';

import { invariant } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';
import type { Network } from '@/shared/api/daoService';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardDialog } from '@/shared/components/wizards/wizardDialog';
import type { ICampaign } from '../../api/capitalDistributorService';
import { CapitalDistributorPluginDialogId } from '../../constants/capitalDistributorPluginDialogId';
import type { ICapitalDistributorPlugin } from '../../types';
import type { ICapitalDistributorClaimTransactionDialogParams } from '../capitalDistributorClaimTransactionDialog';
import type { ICapitalDistributorClaimDialogForm } from './capitalDistributorClaimDialogDefinitions';
import { CapitalDistributorClaimDialogDetails } from './capitalDistributorClaimDialogDetails';
import { CapitalDistributorClaimDialogInputs } from './capitalDistributorClaimDialogInputs';

export interface ICapitalDistributorClaimDialogParams {
    /**
     * Campaign to be claimed.
     */
    campaign: ICampaign;
    /**
     * Capital distributor plugin.
     */
    plugin: ICapitalDistributorPlugin;
    /**
     * Network of the plugin.
     */
    network: Network;
}

export interface ICapitalDistributorClaimDialogProps
    extends IDialogComponentProps<ICapitalDistributorClaimDialogParams> {}

export const CapitalDistributorClaimDialog: React.FC<
    ICapitalDistributorClaimDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'CapitalDistributorClaimDialog: params must be defined',
    );
    const { campaign, plugin, network } = location.params;

    const { address } = useAccount();
    const { t } = useTranslations();
    const { open } = useDialogContext();

    const handleSubmit = (values: ICapitalDistributorClaimDialogForm) => {
        const params: ICapitalDistributorClaimTransactionDialogParams = {
            campaign,
            pluginAddress: plugin.address,
            recipient: values.recipient,
            network,
        };
        open(CapitalDistributorPluginDialogId.CLAIM_TRANSACTION, { params });
    };

    return (
        <WizardDialog.Container<ICapitalDistributorClaimDialogForm>
            className="pt-2 pb-1.5"
            defaultValues={{ recipient: address }}
            description={campaign.description}
            formId="capitalDistributorClaim"
            onSubmit={handleSubmit}
            submitLabel={t(
                'app.plugins.capitalDistributor.capitalDistributorClaimDialog.submit',
            )}
            title={campaign.title}
        >
            <WizardDialog.Step id="overview" meta={{ name: '' }} order={1}>
                <CapitalDistributorClaimDialogDetails
                    campaign={campaign}
                    plugin={plugin}
                />
            </WizardDialog.Step>
            <WizardDialog.Step
                className="flex grow flex-col gap-6"
                id="claim"
                meta={{ name: '' }}
                order={2}
            >
                <CapitalDistributorClaimDialogInputs
                    network={network}
                    plugin={plugin}
                />
            </WizardDialog.Step>
        </WizardDialog.Container>
    );
};
