'use client';

import { Button, ChainEntityType, IconType } from '@aragon/gov-ui-kit';
import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { IVoteDialogParams } from '@/modules/governance/dialogs/voteDialog';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { useUserVote } from '@/modules/governance/hooks/useUserVote';
import type { ISubmitVoteProps } from '@/modules/governance/types';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import type { IMultisigProposal, IMultisigVote } from '../../types';

export interface IMultisigSubmitVoteProps extends ISubmitVoteProps<IMultisigProposal> {}

export const MultisigSubmitVote: React.FC<IMultisigSubmitVoteProps> = (props) => {
    const { daoId, proposal, isVeto } = props;
    const { pluginAddress, network } = proposal;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const userVote = useUserVote<IMultisigVote>({ proposal, network });
    const voted = userVote != null;

    const { buildEntityUrl } = useDaoChain({ network });
    const voteTransactionHref = buildEntityUrl({
        type: ChainEntityType.TRANSACTION,
        id: userVote?.transactionHash,
    });

    const openTransactionDialog = () => {
        const vote = {
            label: isVeto ? 'veto' : 'approve',
            value: undefined,
        } as const;
        const params: IVoteDialogParams<undefined> = {
            daoId,
            proposal,
            vote,
            isVeto,
            plugin,
        };
        open(GovernanceDialogId.VOTE, { params });
    };

    let voteLabel: 'vetoed' | 'approved' | 'veto' | 'approve' = 'approve';
    if (voted) {
        voteLabel = isVeto ? 'vetoed' : 'approved';
    } else if (isVeto) {
        voteLabel = 'veto';
    }

    const { meta: plugin } = useDaoPlugins({
        daoId,
        pluginAddress,
        includeSubPlugins: true,
    })![0];

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
                className="w-full md:w-fit"
                href={voted ? voteTransactionHref : undefined}
                iconLeft={voted ? IconType.CHECKMARK : undefined}
                onClick={voted ? undefined : handleVoteClick}
                size="md"
                target={voted ? '_blank' : undefined}
                variant={voted ? 'secondary' : 'primary'}
            >
                {t(`app.plugins.multisig.multisigSubmitVote.${voteLabel}`)}
            </Button>
        </div>
    );
};
