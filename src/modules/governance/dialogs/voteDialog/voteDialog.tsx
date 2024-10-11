import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { invariant, type VoteIndicator, VoteProposalDataListItemStructure } from '@aragon/ods';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import type { IProposal } from '../../api/governanceService';
import { voteDialogUtils } from './voteDialogUtils';

export interface IVoteDialogParams {
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
    /**
     * Vote option.
     */
    vote: { value?: number; label: VoteIndicator };
    /**
     * Proposal to submit the vote for.
     */
    proposal: IProposal;
    /**
     *  Defines if the vote to approve or veto the proposal.
     */
    isVeto?: boolean;
}

export interface IVoteDialogProps extends IDialogComponentProps<IVoteDialogParams> {}

export const VoteDialog: React.FC<IVoteDialogProps> = (props) => {
    const { location } = props;

    const { t } = useTranslations();
    const router = useRouter();

    invariant(location.params != null, 'VoteDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'VoteDialog: user must be connected.');

    const { vote, proposal, isVeto } = location.params;

    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({
        initialActiveStep: TransactionDialogStep.PREPARE,
    });

    const handlePrepareTransaction = () => voteDialogUtils.buildTransaction({ proposal, voteValue: vote.value });

    return (
        <TransactionDialog
            title={t('app.governance.voteDialog.title')}
            description={t('app.governance.voteDialog.description')}
            submitLabel={t('app.governance.voteDialog.button.submit')}
            successLink={{ label: t('app.governance.voteDialog.button.success'), action: () => router.refresh() }}
            stepper={stepper}
            prepareTransaction={handlePrepareTransaction}
        >
            <VoteProposalDataListItemStructure
                proposalId={proposal.proposalIndex}
                proposalTitle={proposal.title}
                voteIndicator={vote.label}
                confirmationLabel={t('app.governance.voteDialog.confirmationLabel', {
                    veto: isVeto ? 'to veto' : undefined,
                })}
            />
        </TransactionDialog>
    );
};
