'use client';

import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider/dialogProvider.api';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper/useStepper';
import { invariant } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { GaugeVoterServiceKey } from '../../api/gaugeVoterService/gaugeVoterServiceKeys';
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
}

export interface IGaugeVoterVoteTransactionDialogProps
    extends IDialogComponentProps<IGaugeVoterVoteTransactionDialogParams> {}

export const GaugeVoterVoteTransactionDialog: React.FC<IGaugeVoterVoteTransactionDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'GaugeVoterVoteTransactionDialog: required parameters must be set.');

    const { votes, pluginAddress, network } = location.params;

    const { t } = useTranslations();
    const queryClient = useQueryClient();

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const prepareTransaction = () => gaugeVoterVoteTransactionDialogUtils.buildTransaction({ votes, pluginAddress });

    const onSuccessClick = () => queryClient.invalidateQueries({ queryKey: [GaugeVoterServiceKey.GAUGE_LIST] });

    return (
        <TransactionDialog
            title={t('app.plugins.gaugeVoter.gaugeVoterVoteTransactionDialog.title')}
            description={t('app.plugins.gaugeVoter.gaugeVoterVoteTransactionDialog.description')}
            submitLabel={t('app.plugins.gaugeVoter.gaugeVoterVoteTransactionDialog.submit')}
            successLink={{
                onClick: onSuccessClick,
                label: t('app.plugins.gaugeVoter.gaugeVoterVoteTransactionDialog.successLinkLabel'),
            }}
            stepper={stepper}
            prepareTransaction={prepareTransaction}
            network={network}
        />
    );
};
