import { GovernanceDialogs } from '@/modules/governance/constants/moduleDialogs';
import type { IVoteDialogParams } from '@/modules/governance/dialogs/voteDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button } from '@aragon/ods';

export interface IMultisigSubmitVoteProps {
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
    /**
     * ID of proposal
     */
    proposalIndex: string;
    /**
     * The title of the proposal
     */
    title: string;
    /**
     * Summary of the proposal
     */
    summary: string;
}

export const MultisigSubmitVote: React.FC<IMultisigSubmitVoteProps> = (props) => {
    const { daoId, proposalIndex, title, summary } = props;
    const { t } = useTranslations();

    const { open } = useDialogContext();

    const openTransactionDialog = () => {
        const params: IVoteDialogParams = {
            daoId,
            title,
            summary,
            proposalIndex,
            vote: { label: 'approve' },
        };
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
