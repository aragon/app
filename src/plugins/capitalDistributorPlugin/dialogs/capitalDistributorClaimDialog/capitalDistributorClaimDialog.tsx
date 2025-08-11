'use client';

import type { Network } from '@/shared/api/daoService';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardDialog } from '@/shared/components/wizards/wizardDialog';
import { invariant } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';
import type { ICampaign } from '../../api/capitalDistributorService';
import { CapitalDistributorPluginDialogId } from '../../constants/capitalDistributorPluginDialogId';
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
     * Address of the plugin to use for the claim.
     */
    pluginAddress: string;
    /**
     * Network of the plugin.
     */
    network: Network;
}

export interface ICapitalDistributorClaimDialogProps
    extends IDialogComponentProps<ICapitalDistributorClaimDialogParams> {}

export const CapitalDistributorClaimDialog: React.FC<ICapitalDistributorClaimDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'CapitalDistributorClaimDialog: params must be defined');
    const { campaign, pluginAddress, network } = location.params;

    const { address } = useAccount();
    const { t } = useTranslations();
    const { open } = useDialogContext();

    const handleSubmit = (values: ICapitalDistributorClaimDialogForm) => {
        const { recipient } = values;
        const params: ICapitalDistributorClaimTransactionDialogParams = { campaign, pluginAddress, recipient, network };
        open(CapitalDistributorPluginDialogId.CLAIM_TRANSACTION, { params });
    };

    return (
        <WizardDialog.Container<ICapitalDistributorClaimDialogForm>
            title={campaign.title}
            description={campaign.description}
            formId="capitalDistributorClaim"
            onSubmit={handleSubmit}
            submitLabel={t('app.plugins.capitalDistributor.capitalDistributorClaimDialog.submit')}
            defaultValues={{ recipient: address }}
            className="pt-2 pb-1.5"
        >
            <WizardDialog.Step id="overview" order={1} meta={{ name: '' }}>
                <CapitalDistributorClaimDialogDetails campaign={campaign} />
            </WizardDialog.Step>
            <WizardDialog.Step id="claim" order={2} meta={{ name: '' }} className="flex grow flex-col gap-6">
                <CapitalDistributorClaimDialogInputs />
            </WizardDialog.Step>
        </WizardDialog.Container>
    );
};
