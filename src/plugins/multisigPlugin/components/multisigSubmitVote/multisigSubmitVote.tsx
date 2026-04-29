'use client';

import { Button, ChainEntityType, IconType } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { GovernanceServiceKey } from '@/modules/governance/api/governanceService';
import { useRunProposalAudit } from '@/modules/governance/api/proposalAuditService';
import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { IProposalAuditDialogParams } from '@/modules/governance/dialogs/proposalAuditDialog';
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

    const queryClient = useQueryClient();
    const { mutate: runAudit, isPending: isAuditRunning } =
        useRunProposalAudit();

    const openAuditDialog = (audit: IProposalAuditDialogParams['audit']) =>
        open(GovernanceDialogId.PROPOSAL_AUDIT, { params: { audit } });

    const handleAuditClick = () => {
        if (proposal.audit) {
            openAuditDialog(proposal.audit);
            return;
        }
        runAudit(
            { urlParams: { id: proposal.id } },
            {
                onSuccess: (audit) => {
                    openAuditDialog(audit);
                    // Refresh only the proposal queries so the cached audit
                    // surfaces on the next render — avoid invalidating
                    // unrelated caches across the app.
                    void queryClient.invalidateQueries({
                        predicate: ({ queryKey }) =>
                            queryKey[0] ===
                                GovernanceServiceKey.PROPOSAL_BY_SLUG ||
                            queryKey[0] === GovernanceServiceKey.PROPOSAL_LIST,
                    });
                },
            },
        );
    };

    const auditLabel = proposal.audit
        ? 'showAudit'
        : isAuditRunning
          ? 'auditing'
          : 'runAudit';

    // Show the button when the proposal is still open OR when we already have
    // a cached audit (executed proposals retain "Show audit" so members can
    // review the audit post-execution). Hidden only on executed-without-audit.
    const showAuditButton = !proposal.executed.status || proposal.audit != null;

    return (
        <div className="flex w-full flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
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
            {showAuditButton && (
                <Button
                    className="w-full md:w-fit"
                    disabled={isAuditRunning}
                    iconLeft={
                        proposal.audit
                            ? IconType.RICHTEXT_LIST_UNORDERED
                            : IconType.WARNING
                    }
                    isLoading={isAuditRunning}
                    onClick={handleAuditClick}
                    size="md"
                    variant="secondary"
                >
                    {t(`app.plugins.multisig.multisigSubmitVote.${auditLabel}`)}
                </Button>
            )}
        </div>
    );
};
