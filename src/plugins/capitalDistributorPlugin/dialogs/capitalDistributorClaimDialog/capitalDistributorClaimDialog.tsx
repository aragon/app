'use client';

import { CapitalDistributorPluginDialogId } from '../../constants/capitalDistributorPluginDialogId';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardDialog } from '@/shared/components/wizards/wizardDialog';
import { invariant } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';
import type { ICampaign } from '../../api/capitalDistributorService';
import { CapitalDistributorClaimDialogDetails } from './capitalDistributorClaimDialogDetails';

export interface ICapitalDistributorClaimDialogParams {
    /**
     * Campaign to be claimed.
     */
    campaign: ICampaign;
    /**
     * Address of the plugin to use for the claim.
     */
    pluginAddress: string;
}

export interface ICapitalDistributorClaimDialogProps
    extends IDialogComponentProps<ICapitalDistributorClaimDialogParams> {}

export const CapitalDistributorClaimDialog: React.FC<ICapitalDistributorClaimDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'CapitalDistributorClaimDialog: params must be defined');
    const { campaign, pluginAddress } = location.params;
    const { address } = useAccount();

    const { t } = useTranslations();
    const { open } = useDialogContext();

    //TODO: Update address to recipient when claim step is implemented
    const handleSubmit = () =>
        open(CapitalDistributorPluginDialogId.CLAIM_TRANSACTION, {
            params: { campaignId: campaign.id, recipient: address!, pluginAddress },
        });

    return (
        <WizardDialog.Container
            title={campaign.title}
            formId="capitalDistributorClaim"
            onSubmit={handleSubmit}
            submitLabel={t('app.plugins.capitalDistributor.capitalDistributorClaimDialog.submit')}
        >
            <CapitalDistributorClaimDialogDetails campaign={campaign} />
            <WizardDialog.Step id="claim" order={2} meta={{ name: '' }}>
                <p>Claim Step</p>
            </WizardDialog.Step>
        </WizardDialog.Container>
    );
};
