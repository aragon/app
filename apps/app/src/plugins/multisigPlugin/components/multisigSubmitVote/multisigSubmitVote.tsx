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

export interface IMultisigSubmitVoteProps
    extends ISubmitVoteProps<IMultisigProposal> {}

export const MultisigSubmitVote: React.FC<IMultisigSubmitVoteProps> = (
    props,
) => {
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

    const voteLabel = voted
        ? isVeto
            ? 'vetoed'
            : 'approved'
        : isVeto
          ? 'veto'
          : 'approve';

    const { meta: plugin } = useDaoPlugins({
        daoId,
        pluginAddress,
        includeSubPlugins: true,
        includeLinkedAccounts: true,
    })![0];

    const { check: submitVoteGuard, result: canSubmitVote } =
        usePermissionCheckGuard({
            permissionNamespace: 'vote',
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_VOTE_SUBMISSION,
            plugin,
            daoId,
            proposal,
            onSuccess: openTransactionDialog,
        });

    const handleVoteClick = () =>
        canSubmitVote ? openTransactionDialog() : submitVoteGuard();

    return (
        <div className="w-full">
            {voted ? (
                voteTransactionHref != null ? (
                    <Button
                        className="w-full md:w-fit"
                        href={voteTransactionHref}
                        iconLeft={IconType.CHECKMARK}
                        size="md"
                        target="_blank"
                        variant="secondary"
                    >
                        {t(
                            `app.plugins.multisig.multisigSubmitVote.${voteLabel}`,
                        )}
                    </Button>
                ) : (
                    <Button
                        className="w-full md:w-fit"
                        disabled
                        iconLeft={IconType.CHECKMARK}
                        size="md"
                        variant="secondary"
                    >
                        {t(
                            `app.plugins.multisig.multisigSubmitVote.${voteLabel}`,
                        )}
                    </Button>
                )
            ) : (
                <Button
                    className="w-full md:w-fit"
                    onClick={handleVoteClick}
                    size="md"
                    variant="primary"
                >
                    {t(`app.plugins.multisig.multisigSubmitVote.${voteLabel}`)}
                </Button>
            )}
        </div>
    );
};
