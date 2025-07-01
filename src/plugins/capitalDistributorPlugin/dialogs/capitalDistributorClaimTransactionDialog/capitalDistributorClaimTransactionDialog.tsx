'use client';

import { capitalDistributorClaimTransactionDialog } from '@/plugins/capitalDistributorPlugin/dialogs/capitalDistributorClaimTransactionDialog/capitalDistributorClaimTransactionDialogUtils';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider/dialogProvider.api';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper/useStepper';
import { invariant } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import type { Hex } from 'viem';

export interface ICapitalDistributorClaimTransactionDialogParams {
    /**
     * The ID of the campaign to claim.
     */
    campaignId: number;
    /**
     * The address of the recipient.
     */
    recipient: Hex;
    /**
     * The address of the plugin.
     */
    pluginAddress: Hex;
    /**
     * Additional data for the transaction.
     */
    auxData?: Hex;
}

export interface ICapitalDistributorClaimTransactionDialogProps
    extends IDialogComponentProps<ICapitalDistributorClaimTransactionDialogParams> {}

export const CapitalDistributorClaimTransactionDialog: React.FC<ICapitalDistributorClaimTransactionDialogProps> = (
    props,
) => {
    const { location } = props;
    invariant(location.params != null, 'CapitalDistributorClaimTransactionDialog: required parameters must be set.');

    const { campaignId, recipient, pluginAddress } = location.params;

    const { t } = useTranslations();

    const router = useRouter();

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const prepareTransaction = () =>
        capitalDistributorClaimTransactionDialog.buildTransaction({ campaignId, recipient, pluginAddress });

    return (
        <TransactionDialog
            title={t('app.plugins.capitalDistributor.capitalDistributorClaimTransactionDialog.title')}
            description={t('app.plugins.capitalDistributor.capitalDistributorClaimTransactionDialog.description')}
            submitLabel={t('app.plugins.capitalDistributor.capitalDistributorClaimTransactionDialog.submit')}
            successLink={{
                onClick: () => router.refresh(),
                label: t('app.plugins.capitalDistributor.capitalDistributorClaimTransactionDialog.successLinkLabel'),
            }}
            stepper={stepper}
            prepareTransaction={prepareTransaction}
        />
    );
};
