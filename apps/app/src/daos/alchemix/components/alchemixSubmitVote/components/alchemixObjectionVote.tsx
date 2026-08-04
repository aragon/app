'use client';

import { Button, Card, IconType } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { IVoteDialogParams } from '@/modules/governance/dialogs/voteDialog';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import {
    type IDisabledVotingOption,
    TokenVotingOptions,
} from '@/plugins/tokenPlugin/components/tokenSubmitVote';
import type { ITokenProposal } from '@/plugins/tokenPlugin/types';
import { VoteOption } from '@/plugins/tokenPlugin/types';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useAlchemixObjectionStatus } from '../../../hooks/useAlchemixObjectionStatus';

export interface IAlchemixObjectionVoteProps {
    /**
     * ID of the DAO the proposal belongs to.
     */
    daoId: string;
    /**
     * Proposal to submit the vote for.
     */
    proposal: ITokenProposal;
    /**
     * Defines if the vote is to approve or veto the proposal.
     */
    isVeto?: boolean;
}

export const AlchemixObjectionVote: React.FC<IAlchemixObjectionVoteProps> = (
    props,
) => {
    const { daoId, proposal, isVeto } = props;
    const { pluginAddress, network, proposalIndex } = proposal;

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { address } = useWalletAccount();

    const plugin = useDaoPlugins({
        daoId,
        pluginAddress,
        includeSubPlugins: true,
        includeLinkedAccounts: true,
    })?.[0]?.meta;

    const [showOptions, setShowOptions] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | undefined>(
        undefined,
    );

    const { voteOption, votingPower, canObject, isFetched, refetch } =
        useAlchemixObjectionStatus({
            proposalIndex,
            pluginAddress,
            network,
            userAddress: address,
        });

    const { check: submitVoteGuard } = usePermissionCheckGuard({
        permissionNamespace: 'vote',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_VOTE_SUBMISSION,
        plugin,
        daoId,
        proposal,
        onSuccess: () => setShowOptions(true),
    });

    // Only "No" can be submitted during the objection phase, every other option is disabled with the reason.
    const disabledOptions: IDisabledVotingOption[] = [
        VoteOption.YES,
        VoteOption.ABSTAIN,
    ].map((option) => ({
        value: option.toString(),
        reason: t('app.daos.alchemix.alchemixSubmitVote.options.objectionOnly'),
    }));

    const openTransactionDialog = () => {
        if (plugin == null) {
            return;
        }

        const vote: IVoteDialogParams['vote'] = {
            value: VoteOption.NO,
            label: 'no',
            labelDescription: t(
                `app.plugins.token.tokenSubmitVote.voteDescription.${isVeto ? 'veto' : 'approve'}`,
            ),
        };
        const handleVoteSuccess = () => {
            refetch();
            setShowOptions(false);
            setSelectedOption(undefined);
        };
        const params: IVoteDialogParams = {
            daoId,
            proposal,
            vote,
            isVeto,
            plugin,
            onSuccess: handleVoteSuccess,
        };

        open(GovernanceDialogId.VOTE, { params });
    };

    if (plugin == null || (address != null && !isFetched)) {
        return null;
    }

    const hasVoted = voteOption != null;
    const canChangeVote =
        voteOption === VoteOption.YES || voteOption === VoteOption.ABSTAIN;

    const handleVoteClick = () =>
        address != null && canObject ? setShowOptions(true) : submitVoteGuard();

    const resetVoteOptions = () => {
        setSelectedOption(undefined);
        setShowOptions(false);
    };

    return (
        <div className="flex flex-col gap-4">
            {!showOptions && !hasVoted && (
                <Button
                    className="w-fit"
                    onClick={handleVoteClick}
                    size="md"
                    variant={
                        address == null || votingPower > BigInt(0)
                            ? 'primary'
                            : 'secondary'
                    }
                >
                    {t('app.plugins.token.tokenSubmitVote.buttons.vote')}
                </Button>
            )}
            {!showOptions && hasVoted && (
                <div className="flex w-full flex-col items-center gap-4 md:flex-row">
                    {/* The vote may have been cast on either stage, so there is no single transaction to link to. */}
                    <Button
                        className="w-full md:w-fit"
                        disabled
                        iconLeft={IconType.CHECKMARK}
                        size="md"
                        variant="secondary"
                    >
                        {t(
                            'app.plugins.token.tokenSubmitVote.buttons.submitted',
                        )}
                    </Button>
                    {canChangeVote && (
                        <Button
                            className="w-full md:w-fit"
                            onClick={handleVoteClick}
                            size="md"
                            variant="tertiary"
                        >
                            {t(
                                'app.plugins.token.tokenSubmitVote.buttons.change.vote',
                            )}
                        </Button>
                    )}
                </div>
            )}
            {showOptions && (
                <Card className="border border-neutral-100 p-6 shadow-neutral-sm">
                    <TokenVotingOptions
                        disabledOptions={disabledOptions}
                        isVeto={isVeto}
                        onChange={setSelectedOption}
                        value={selectedOption}
                    />
                </Card>
            )}
            {showOptions && (
                <div className="flex w-full flex-col items-center gap-y-3 md:flex-row md:gap-x-4">
                    <Button
                        className="w-full md:w-fit"
                        disabled={
                            !canObject ||
                            selectedOption !== VoteOption.NO.toString()
                        }
                        onClick={openTransactionDialog}
                        size="md"
                        variant="primary"
                    >
                        {hasVoted
                            ? t(
                                  'app.plugins.token.tokenSubmitVote.buttons.change.submit',
                              )
                            : t(
                                  'app.plugins.token.tokenSubmitVote.buttons.submit',
                              )}
                    </Button>
                    <Button
                        className="w-full md:w-fit"
                        onClick={resetVoteOptions}
                        size="md"
                        variant="tertiary"
                    >
                        {t('app.plugins.token.tokenSubmitVote.buttons.cancel')}
                    </Button>
                </div>
            )}
        </div>
    );
};
