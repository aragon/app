'use client';

import { invariant } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider/dialogProvider.api';
import { type ITransactionDialogStepMeta, TransactionDialog, TransactionDialogStep } from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper/useStepper';
import { gaugeVoterVoteTransactionDialogUtils } from './gaugeVoterVoteTransactionDialogUtils';
import type { IGaugeVote } from './gaugeVoterVoteTransactionDialogUtils.api';

export interface IGaugeVoterVoteTransactionDialogParams {
    /**
     * Array of vote allocations to submit.
     */
    votes: IGaugeVote[];
    /**
     * Network of the plugin.
     */
    network: Network;
    /**
     * The address of the gauge voter plugin.
     */
    pluginAddress: string;
    /**
     * Callback called after successful vote transaction.
     */
    onSuccess?: () => void;
}

export interface IGaugeVoterVoteTransactionDialogProps extends IDialogComponentProps<IGaugeVoterVoteTransactionDialogParams> {}

export const GaugeVoterVoteTransactionDialog: React.FC<IGaugeVoterVoteTransactionDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'GaugeVoterVoteTransactionDialog: required parameters must be set.');

    const { votes, pluginAddress, network, onSuccess: onSuccessCallback } = location.params;

    const { t } = useTranslations();
    const queryClient = useQueryClient();

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const prepareTransaction = () =>
        gaugeVoterVoteTransactionDialogUtils.buildTransaction({
            votes,
            pluginAddress,
        });

    const handleSuccess = async () => {
        // Refetch all active queries to get fresh data after vote submission
        // This includes:
        // - Backend queries: gauge list (vote totals), epoch metrics
        // - RPC queries: user's voting power, user's votes per gauge
        await queryClient.refetchQueries({
            predicate: (query) => query.isActive(),
        });

        // Call parent callback (e.g., to reset selected gauges)
        onSuccessCallback?.();
    };

    return (
        <TransactionDialog
            description={t('app.plugins.gaugeVoter.gaugeVoterVoteTransactionDialog.description')}
            network={network}
            onSuccess={handleSuccess}
            prepareTransaction={prepareTransaction}
            stepper={stepper}
            submitLabel={t('app.plugins.gaugeVoter.gaugeVoterVoteTransactionDialog.submit')}
            successLink={{
                onClick: handleSuccess,
                label: t('app.plugins.gaugeVoter.gaugeVoterVoteTransactionDialog.successLinkLabel'),
            }}
            title={t('app.plugins.gaugeVoter.gaugeVoterVoteTransactionDialog.title')}
        />
    );
};
