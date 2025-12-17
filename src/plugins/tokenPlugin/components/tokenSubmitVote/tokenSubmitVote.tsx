'use client';

import { Button, Card, ChainEntityType, IconType, type VoteIndicator } from '@aragon/gov-ui-kit';
import { useCallback, useEffect, useState } from 'react';
import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { IVoteDialogParams } from '@/modules/governance/dialogs/voteDialog';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { useUserVote } from '@/modules/governance/hooks/useUserVote';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { DaoTokenVotingMode, type ITokenProposal, type ITokenVote, VoteOption } from '../../types';
import { TokenVotingOptions } from './components/tokenVotingOptions';

export interface ITokenSubmitVoteProps {
    /**
     * ID of the DAO to create the proposal for.
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

const voteOptionToIndicator: Record<string, VoteIndicator> = {
    [VoteOption.YES.toString()]: 'yes',
    [VoteOption.ABSTAIN.toString()]: 'abstain',
    [VoteOption.NO.toString()]: 'no',
};

export const TokenSubmitVote: React.FC<ITokenSubmitVoteProps> = (props) => {
    const { daoId, proposal, isVeto } = props;
    const { pluginAddress, network } = proposal;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const latestVote = useUserVote<ITokenVote>({ proposal, network });
    const { meta: plugin } = useDaoPlugins({
        daoId,
        pluginAddress,
        includeSubPlugins: true,
    })![0];

    const { buildEntityUrl } = useDaoChain({ network });
    const latestVoteTxHref = buildEntityUrl({
        type: ChainEntityType.TRANSACTION,
        id: latestVote?.transactionHash,
    });

    const [showOptions, setShowOptions] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | undefined>(latestVote?.voteOption.toString());

    const openTransactionDialog = () => {
        const voteLabel = voteOptionToIndicator[selectedOption ?? ''];
        const voteLabelDescription =
            voteLabel === 'abstain' ? undefined : t(`app.plugins.token.tokenSubmitVote.voteDescription.${isVeto ? 'veto' : 'approve'}`);
        const vote = {
            value: Number(selectedOption),
            label: voteLabel,
            labelDescription: voteLabelDescription,
        };
        const params: IVoteDialogParams = {
            daoId,
            proposal,
            vote,
            isVeto,
            plugin,
        };

        open(GovernanceDialogId.VOTE, { params });
    };

    const resetVoteOptions = useCallback(() => {
        setSelectedOption(latestVote?.voteOption.toString());
        setShowOptions(false);
    }, [latestVote]);

    const { check: submitVoteGuard, result: canSubmitVote } = usePermissionCheckGuard({
        permissionNamespace: 'vote',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_VOTE_SUBMISSION,
        plugin,
        daoId,
        proposal,
        onSuccess: () => setShowOptions(true),
    });

    const handleVoteClick = () => (canSubmitVote ? setShowOptions(true) : submitVoteGuard());

    useEffect(() => {
        setSelectedOption(latestVote?.voteOption.toString());
    }, [latestVote]);

    useEffect(() => {
        if (!canSubmitVote) {
            setShowOptions(false);
        }
    }, [canSubmitVote]);

    return (
        <div className="flex flex-col gap-4">
            {!showOptions && latestVote == null && (
                <Button className="w-fit" onClick={handleVoteClick} size="md">
                    {t('app.plugins.token.tokenSubmitVote.buttons.vote')}
                </Button>
            )}
            {!showOptions && latestVote != null && (
                <div className="flex w-full flex-col items-center gap-4 md:flex-row">
                    <Button
                        className="w-full md:w-fit"
                        href={latestVoteTxHref}
                        iconLeft={IconType.CHECKMARK}
                        size="md"
                        target="_blank"
                        variant="secondary"
                    >
                        {t('app.plugins.token.tokenSubmitVote.buttons.submitted')}
                    </Button>
                    {proposal.settings.votingMode === DaoTokenVotingMode.VOTE_REPLACEMENT && (
                        <Button className="w-full md:w-fit" onClick={() => setShowOptions(true)} size="md" variant="tertiary">
                            {t('app.plugins.token.tokenSubmitVote.buttons.change.vote')}
                        </Button>
                    )}
                </div>
            )}
            {showOptions && (
                <Card className="border border-neutral-100 p-6 shadow-neutral-sm">
                    <TokenVotingOptions isVeto={isVeto} onChange={setSelectedOption} value={selectedOption} />
                </Card>
            )}
            {showOptions && (
                <div className="flex w-full flex-col items-center gap-y-3 md:flex-row md:gap-x-4">
                    <Button
                        className="w-full md:w-fit"
                        disabled={!selectedOption || selectedOption === latestVote?.voteOption.toString()}
                        onClick={openTransactionDialog}
                        size="md"
                        variant="primary"
                    >
                        {latestVote
                            ? t('app.plugins.token.tokenSubmitVote.buttons.change.submit')
                            : t('app.plugins.token.tokenSubmitVote.buttons.submit')}
                    </Button>
                    <Button className="w-full md:w-fit" onClick={resetVoteOptions} size="md" variant="tertiary">
                        {t('app.plugins.token.tokenSubmitVote.buttons.cancel')}
                    </Button>
                </div>
            )}
        </div>
    );
};
