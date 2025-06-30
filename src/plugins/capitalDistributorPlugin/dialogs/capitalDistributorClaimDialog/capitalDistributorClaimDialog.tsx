'use client';

import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardDialog } from '@/shared/components/wizards/wizardDialog';
import { invariant } from '@aragon/gov-ui-kit';
import type { ICampaign } from '../../api/capitalDistributorService';

export interface ICapitalDistributorClaimDialogParams {
    /**
     * Campaign to be claimed.
     */
    campaign: ICampaign;
}

export interface ICapitalDistributorClaimDialogProps
    extends IDialogComponentProps<ICapitalDistributorClaimDialogParams> {}

export const CapitalDistributorClaimDialog: React.FC<ICapitalDistributorClaimDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'CapitalDistributorClaimDialog: params must be defined');
    const { campaign } = location.params;

    const { t } = useTranslations();

    const handleSubmit = () => null;

    return (
        <WizardDialog.Container
            title={campaign.title}
            formId="capitalDistributorClaim"
            onSubmit={handleSubmit}
            submitLabel={t('app.plugins.capitalDistributor.capitalDistributorClaimDialog.submit')}
        >
            <WizardDialog.Step id="overview" order={1} meta={{ name: '' }}>
                <p>Overview Step</p>
            </WizardDialog.Step>
            <WizardDialog.Step id="claim" order={2} meta={{ name: '' }}>
                <p>Claim Step</p>
            </WizardDialog.Step>
        </WizardDialog.Container>
    );
};
