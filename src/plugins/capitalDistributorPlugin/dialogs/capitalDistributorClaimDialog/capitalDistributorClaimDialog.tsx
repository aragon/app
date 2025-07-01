'use client';

import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardDialog } from '@/shared/components/wizards/wizardDialog';
import { invariant } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';
import type { ICampaign } from '../../api/capitalDistributorService';
import { CapitalDistributorPluginDialogId } from '../../constants/capitalDistributorPluginDialogId';
import { ICapitalDistributorClaimTransactionDialogParams } from '../capitalDistributorClaimTransactionDialog';
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

    const handleSubmit = (values: ICapitalDistributorClaimDialogForm) => {
        const params: ICapitalDistributorClaimTransactionDialogParams = {
            campaignId: campaign.id,
            pluginAddress,
            ...values,
        };
        open(CapitalDistributorPluginDialogId.CLAIM_TRANSACTION, { params });
    };

    return (
        <WizardDialog.Container<ICapitalDistributorClaimDialogForm>
            title={campaign.title}
            formId="capitalDistributorClaim"
            onSubmit={handleSubmit}
            submitLabel={t('app.plugins.capitalDistributor.capitalDistributorClaimDialog.submit')}
            defaultValues={{ recipient: address }}
        >
            <CapitalDistributorClaimDialogDetails campaign={campaign} />
            <CapitalDistributorClaimDialogInputs />
        </WizardDialog.Container>
    );
};
