'use client';

import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { IVoteDialogOption, IVoteDialogParams } from '@/modules/governance/dialogs/voteDialog';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { useUserVote } from '@/modules/governance/hooks/useUserVote';
import type { ISubmitVoteProps } from '@/modules/governance/types';
import { TokenVotingOptions } from '@/plugins/tokenPlugin/components/tokenSubmitVote/components/tokenVotingOptions';
import { VoteOption, type ITokenVote } from '@/plugins/tokenPlugin/types';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { Button, Card, ChainEntityType, IconType, useBlockExplorer, type VoteIndicator } from '@aragon/gov-ui-kit';
import { useCallback, useEffect, useState } from 'react';
import { LockToVotePluginDialogId } from '../../constants/lockToVotePluginDialogId';
import type { ILockToVoteSubmitVoteFeedbackDialogParams } from '../../dialogs/lockToVoteSubmitVoteFeedbackDialog';
import { useLockToVoteData } from '../../hooks/useLockToVoteData';
import { DaoLockToVoteVotingMode, type ILockToVotePlugin, type ILockToVoteProposal } from '../../types';
import type { ILockToVoteOption } from '../../utils/lockToVoteTransactionUtils';

export interface ILockToVoteSubmitVoteProps extends ISubmitVoteProps<ILockToVoteProposal> {}

interface ILockToVoteOptionVoteDialog extends IVoteDialogOption, ILockToVoteOption {}

const voteOptionToIndicator: Record<string, VoteIndicator> = {
    [VoteOption.YES.toString()]: 'yes',
    [VoteOption.ABSTAIN.toString()]: 'abstain',
    [VoteOption.NO.toString()]: 'no',
};

export const LockToVoteSubmitVote: React.FC<ILockToVoteSubmitVoteProps> = (props) => {
    // When editing this component, take into consideration the following voting scenarios:
    // 0. User doesn't have required tokens at all - not eligible to vote.
    // 1. User has required tokens, but doesn't have any locked - no voting power, asked to lock first.
    // 2. User has some tokens locked, with more available for locking - asked to lock more with an option to skip to voting.
    // 3. User has all tokens locked - straight voting.
    // 4. Users can always update their votes, but with the following limitations:
    //    a. If the proposal is NOT in VOTE_REPLACEMENT mode, then they can only update their existing vote with more voting power - voting options are disabled.
    //    b. If the proposal is in VOTE_REPLACEMENT mode, then they can also change their vote to a different option.
    const { daoId, proposal, isVeto } = props;
    const { pluginAddress, network } = proposal;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const latestVote = useUserVote<ITokenVote>({ proposal, network });
    const plugins = useDaoPlugins({ daoId, pluginAddress, includeSubPlugins: true })!;
    const plugin = plugins[0].meta as ILockToVotePlugin;

    const { id: chainId } = networkDefinitions[network];
    const { buildEntityUrl } = useBlockExplorer({ chainId });
    const latestVoteTxHref = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: latestVote?.transactionHash });

    const { balance, allowance, approveTokens } = useLockToVoteData({ plugin, daoId });

    const [showOptions, setShowOptions] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | undefined>(latestVote?.voteOption.toString());

    const isVoteReplacement = proposal.settings.votingMode === DaoLockToVoteVotingMode.VOTE_REPLACEMENT;

    const openVoteDialog = (option?: string, lockAmount?: bigint) => {
        const voteLabel = voteOptionToIndicator[option ?? ''];
        const voteDescription = t(`app.plugins.lockToVote.lockToVoteSubmitVote.${isVeto ? 'veto' : 'approve'}`);
        const labelDescription = voteLabel === 'abstain' ? undefined : voteDescription;

        const vote = { value: Number(option), lockAmount, label: voteLabel, labelDescription };
        const params: IVoteDialogParams<number, ILockToVoteOptionVoteDialog> = {
            daoId,
            proposal,
            vote,
            isVeto,
            plugin,
            target: plugin.lockManagerAddress,
        };

        open(GovernanceDialogId.VOTE, { params });
    };

    const { check: submitVoteGuard, result: canSubmitVote } = usePermissionCheckGuard({
        permissionNamespace: 'vote',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_VOTE_SUBMISSION,
        plugin,
        daoId,
        proposal,
        onSuccess: () => setShowOptions(true),
    });

    const resetVoteOptions = useCallback(() => {
        setSelectedOption(latestVote?.voteOption.toString());
        setShowOptions(false);
    }, [latestVote]);

    const handleVoteClick = () => (canSubmitVote ? setShowOptions(true) : submitVoteGuard());

    const handleLockAndVote = (option?: string) => (lockAmount?: bigint) => {
        if (lockAmount != null && lockAmount > allowance) {
            approveTokens(lockAmount, () => openVoteDialog(option, lockAmount));
        } else {
            openVoteDialog(option, lockAmount);
        }
    };

    const openVoteFeedbackDialog = (option?: string) => {
        const onVoteClick = handleLockAndVote(option);
        const params: ILockToVoteSubmitVoteFeedbackDialogParams = {
            plugin,
            daoId,
            canVote: latestVote == null || isVoteReplacement, // available balance for locking is assumed here.
            onVoteClick,
        };
        open(LockToVotePluginDialogId.SUBMIT_VOTE_FEEDBACK, { params });
    };

    const handleSubmitVoteClick = () => {
        if (balance != null && balance > 0) {
            // offer user the option to lock additional tokens before voting
            openVoteFeedbackDialog(selectedOption);
        } else {
            openVoteDialog(selectedOption);
        }
    };

    useEffect(() => setSelectedOption(latestVote?.voteOption.toString()), [latestVote]);

    useEffect(() => {
        if (!canSubmitVote) {
            setShowOptions(false);
        }
    }, [canSubmitVote, setShowOptions]);

    return (
        <div className="flex flex-col gap-4">
            {!showOptions && latestVote == null && (
                <Button className="w-fit" size="md" onClick={handleVoteClick}>
                    {t('app.plugins.lockToVote.lockToVoteSubmitVote.buttons.vote')}
                </Button>
            )}
            {!showOptions && latestVote != null && (
                <div className="flex w-full flex-col items-center gap-4 md:flex-row">
                    <Button
                        href={latestVoteTxHref}
                        target="_blank"
                        variant="secondary"
                        iconLeft={IconType.CHECKMARK}
                        className="w-full md:w-fit"
                        size="md"
                    >
                        {t('app.plugins.lockToVote.lockToVoteSubmitVote.buttons.submitted')}
                    </Button>
                    {/* In lock to vote we always show the update button. If vote replacement is enabled, then the user can
                    change their vote. Otherwise, they can only update their voting power on the existing choice. */}
                    <Button
                        variant="tertiary"
                        className="w-full md:w-fit"
                        size="md"
                        onClick={() => setShowOptions(true)}
                    >
                        {t(`app.plugins.lockToVote.lockToVoteSubmitVote.buttons.update.vote`)}
                    </Button>
                </div>
            )}
            {showOptions && (
                <Card className="shadow-neutral-sm border border-neutral-100 p-6">
                    <TokenVotingOptions
                        value={selectedOption}
                        onChange={setSelectedOption}
                        isVeto={isVeto}
                        // disabled if voted and not in replacement mode, only update is allowed
                        disableOptions={latestVote != null && !isVoteReplacement}
                    />
                </Card>
            )}
            {showOptions && (
                <div className="flex w-full flex-col items-center gap-y-3 md:flex-row md:gap-x-4">
                    <Button
                        onClick={handleSubmitVoteClick}
                        disabled={!selectedOption}
                        size="md"
                        className="w-full md:w-fit"
                        variant="primary"
                    >
                        {latestVote
                            ? t(`app.plugins.lockToVote.lockToVoteSubmitVote.buttons.update.submit`)
                            : t('app.plugins.lockToVote.lockToVoteSubmitVote.buttons.submit')}
                    </Button>
                    <Button size="md" variant="tertiary" className="w-full md:w-fit" onClick={resetVoteOptions}>
                        {t('app.plugins.lockToVote.lockToVoteSubmitVote.buttons.cancel')}
                    </Button>
                </div>
            )}
        </div>
    );
};
