import type { IDaoPlugin } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useStepper } from '@/shared/hooks/useStepper';
import { invariant, type VoteIndicator, VoteProposalDataListItemStructure } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import type { IProposal } from '../../api/governanceService';
import { proposalUtils } from '../../utils/proposalUtils';
import { voteDialogUtils } from './voteDialogUtils';
import { TransactionType } from '@/shared/api/transactionService/transactionService.api';

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
    /**
     * Plugin where the proposal has been created.
     */
    plugin: IDaoPlugin;
}

export interface IVoteDialogProps extends IDialogComponentProps<IVoteDialogParams> {}

export const VoteDialog: React.FC<IVoteDialogProps> = (props) => {
    const { location } = props;

    const { t } = useTranslations();
    const router = useRouter();

    invariant(location.params != null, 'VoteDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'VoteDialog: user must be connected.');

    const { vote, proposal, isVeto, daoId, plugin } = location.params;

    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({
        initialActiveStep: TransactionDialogStep.PREPARE,
    });

    const handlePrepareTransaction = () => voteDialogUtils.buildTransaction({ proposal, voteValue: vote.value });

    // Fallback to the parent plugin to display the slug of the parent proposal (if exists)
    const pluginAddress = plugin.parentPlugin ?? plugin.address;
    const processedPlugin = useDaoPlugins({ daoId, pluginAddress, includeSubPlugins: true })?.[0];

    const slug = proposalUtils.getProposalSlug(proposal.incrementalId, processedPlugin?.meta);

    return (
        <TransactionDialog
            title={t('app.governance.voteDialog.title')}
            description={t('app.governance.voteDialog.description')}
            submitLabel={t('app.governance.voteDialog.button.submit')}
            successLink={{ label: t('app.governance.voteDialog.button.success'), onClick: () => router.refresh() }}
            stepper={stepper}
            prepareTransaction={handlePrepareTransaction}
            network={proposal.network}
            transactionType={TransactionType.PROPOSAL_VOTE}
        >
            <VoteProposalDataListItemStructure
                proposalId={slug}
                proposalTitle={proposal.title}
                voteIndicator={vote.label}
                confirmationLabel={
                    isVeto
                        ? t('app.governance.voteDialog.confirmationLabelVeto')
                        : t('app.governance.voteDialog.confirmationLabelApprove')
                }
            />
        </TransactionDialog>
    );
};
