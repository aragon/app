'use client';

import { invariant } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import type { Hex } from 'viem';
import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider/dialogProvider.api';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper/useStepper';
import {
    CapitalDistributorServiceKey,
    type ICampaign,
} from '../../api/capitalDistributorService';
import { capitalDistributorClaimTransactionDialogUtils } from './capitalDistributorClaimTransactionDialogUtils';

export interface ICapitalDistributorClaimTransactionDialogParams {
    /**
     * Campaign to be claimed.
     */
    campaign: ICampaign;
    /**
     * Network of the plugin.
     */
    network: Network;
    /**
     * The address of the recipient.
     */
    recipient: string;
    /**
     * The address of the plugin.
     */
    pluginAddress: string;
    /**
     * Additional data for the transaction.
     */
    auxData?: Hex;
}

export interface ICapitalDistributorClaimTransactionDialogProps
    extends IDialogComponentProps<ICapitalDistributorClaimTransactionDialogParams> {}

export const CapitalDistributorClaimTransactionDialog: React.FC<
    ICapitalDistributorClaimTransactionDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'CapitalDistributorClaimTransactionDialog: required parameters must be set.',
    );

    const { campaign, recipient, pluginAddress, network } = location.params;

    const { t } = useTranslations();
    const queryClient = useQueryClient();

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<
        ITransactionDialogStepMeta,
        TransactionDialogStep
    >({ initialActiveStep });

    const prepareTransaction = () =>
        capitalDistributorClaimTransactionDialogUtils.buildTransaction({
            campaign,
            recipient,
            pluginAddress,
        });

    const onSuccessClick = () =>
        queryClient.invalidateQueries({
            queryKey: [CapitalDistributorServiceKey.CAMPAIGN_LIST],
        });

    return (
        <TransactionDialog
            description={t(
                'app.plugins.capitalDistributor.capitalDistributorClaimTransactionDialog.description',
            )}
            network={network}
            prepareTransaction={prepareTransaction}
            stepper={stepper}
            submitLabel={t(
                'app.plugins.capitalDistributor.capitalDistributorClaimTransactionDialog.submit',
            )}
            successLink={{
                onClick: onSuccessClick,
                label: t(
                    'app.plugins.capitalDistributor.capitalDistributorClaimTransactionDialog.successLinkLabel',
                ),
            }}
            title={t(
                'app.plugins.capitalDistributor.capitalDistributorClaimTransactionDialog.title',
            )}
        />
    );
};
