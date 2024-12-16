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
import { useCallback } from 'react';
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

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const userVote = useUserVote<IMultisigVote>({ proposal });
    const voted = userVote != null;

    const chainId = networkDefinitions[proposal.network].chainId;
    const { buildEntityUrl } = useBlockExplorer({ chainId });
    const voteTransactionHref = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: userVote?.transactionHash });

    const openTransactionDialog = useCallback(() => {
        const vote = { label: 'approve' as const };
        const params: IVoteDialogParams = { daoId, proposal, vote, isVeto };
        open(GovernanceDialog.VOTE, { params });
    }, [daoId, isVeto, open, proposal]);

    const voteLabel = voted ? (isVeto ? 'vetoed' : 'approved') : isVeto ? 'veto' : 'approve';

    const plugin = useDaoPlugins({ daoId, pluginAddress: proposal.pluginAddress });

    const slotParams = {
        plugin: plugin![0].meta,
        daoId,
        proposal,
        chainId,
        title: t('app.governance.permissionCheckMultisigVoteDialog.title'),
        description: t('app.governance.permissionCheckMultisigVoteDialog.description'),
    };

    const { check: submitVoteGuard, result: canSubmitVote } = usePermissionCheckGuard({
        params: slotParams,
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_VOTE_SUBMISSION,
        onSuccess: openTransactionDialog,
    });

    const handleVoteClick = () => {
        if (!canSubmitVote) {
            submitVoteGuard();
        }
        if (canSubmitVote && !voted) {
            openTransactionDialog();
        }
    };

    return (
        <div className="w-full">
            <Button
                onClick={handleVoteClick}
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
