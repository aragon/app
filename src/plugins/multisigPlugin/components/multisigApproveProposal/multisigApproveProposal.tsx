import { GovernanceDialogs } from '@/modules/governance/constants/moduleDialogs';
import type { IVoteDialogParams } from '@/modules/governance/dialogs/voteDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button } from '@aragon/ods';

export interface IMultisigApproveProposalProps {
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
    /**
     * ID of proposal
     */
    proposalId: string;
    /**
     * The title of the proposal
     */
    title: string;
    /**
     * Summary of the proposal
     */
    summary: string;
}

export const MultisigApproveProposal: React.FC<IMultisigApproveProposalProps> = (props) => {
    const { daoId, proposalId, title, summary } = props;
    const { t } = useTranslations();

    const { open } = useDialogContext();

    const handleVoteTransaction = () => {
        const params: IVoteDialogParams = {
            daoId,
            values: { voteOption: 'APPROVE', title, summary, proposalId },
        };
        open(GovernanceDialogs.VOTE_ON_PROPOSAL, { params });
    };

    return (
        <div className="pt-4">
            <Button onClick={handleVoteTransaction} size="md" variant="primary">
                {t('app.plugins.multisig.multisigApproveProposal.button')}
            </Button>
        </div>
    );
};
