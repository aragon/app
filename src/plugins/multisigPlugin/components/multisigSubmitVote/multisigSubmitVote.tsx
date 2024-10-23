import { GovernanceDialogs } from '@/modules/governance/constants/moduleDialogs';
import type { IVoteDialogParams } from '@/modules/governance/dialogs/voteDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button } from '@aragon/gov-ui-kit';
import type { IMultisigProposal } from '../../types';

export interface IMultisigSubmitVoteProps {
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
    /**
     * Proposal to submit the vote for.
     */
    proposal: IMultisigProposal;
    /**
     *  Defines if the vote to approve or veto the proposal.
     */
    isVeto?: boolean;
}

export const MultisigSubmitVote: React.FC<IMultisigSubmitVoteProps> = (props) => {
    const { daoId, proposal, isVeto } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const openTransactionDialog = () => {
        const params: IVoteDialogParams = { daoId, proposal, vote: { label: 'approve' }, isVeto };
        open(GovernanceDialogs.VOTE, { params });
    };

    return (
        <div className="pt-4">
            <Button onClick={openTransactionDialog} size="md" variant="primary">
                {t('app.plugins.multisig.multisigSubmitVote.button')}
            </Button>
        </div>
    );
};
