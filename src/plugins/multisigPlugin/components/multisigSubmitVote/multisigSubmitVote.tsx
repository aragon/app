import { GovernanceDialog } from '@/modules/governance/constants/moduleDialogs';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { IVoteDialogParams } from '@/modules/governance/dialogs/voteDialog';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { useUserVote } from '@/modules/governance/hooks/useUserVote';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { Button, ChainEntityType, IconType, useBlockExplorer } from '@aragon/gov-ui-kit';
import type { IMultisigProposal, IMultisigVote } from '../../types';

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
     *  Defines if the vote is to approve or veto the proposal.
     */
    isVeto?: boolean;
}

export const MultisigSubmitVote: React.FC<IMultisigSubmitVoteProps> = (props) => {
    const { daoId, proposal, isVeto } = props;
    const { pluginAddress, network } = proposal;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const userVote = useUserVote<IMultisigVote>({ proposal });
    const voted = userVote != null;

    const { chainId } = networkDefinitions[network];
    const { buildEntityUrl } = useBlockExplorer({ chainId });
    const voteTransactionHref = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: userVote?.transactionHash });

    const openTransactionDialog = () => {
        const vote = { label: 'approve' as const };
        const params: IVoteDialogParams = {
            daoId,
            proposal,
            vote,
            isVeto,
            pluginAddress: plugin.parentPlugin ?? plugin.address,
        };
        open(GovernanceDialog.VOTE, { params });
    };

    const voteLabel = voted ? (isVeto ? 'vetoed' : 'approved') : isVeto ? 'veto' : 'approve';

    const { meta: plugin } = useDaoPlugins({ daoId, pluginAddress, includeSubPlugins: true })![0];

    const { check: submitVoteGuard, result: canSubmitVote } = usePermissionCheckGuard({
        permissionNamespace: 'vote',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_VOTE_SUBMISSION,
        plugin,
        daoId,
        proposal,
        onSuccess: openTransactionDialog,
    });

    const handleVoteClick = () => (canSubmitVote ? openTransactionDialog() : submitVoteGuard());

    return (
        <div className="w-full">
            <Button
                onClick={voted ? undefined : handleVoteClick}
                href={voted ? voteTransactionHref : undefined}
                target={voted ? '_blank' : undefined}
                size="md"
                iconLeft={voted ? IconType.CHECKMARK : undefined}
                variant={voted ? 'secondary' : 'primary'}
                className="w-full md:w-fit"
            >
                {t(`app.plugins.multisig.multisigSubmitVote.${voteLabel}`)}
            </Button>
        </div>
    );
};
