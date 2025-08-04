'use client';

import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { IVoteDialogParams } from '@/modules/governance/dialogs/voteDialog';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { useUserVote } from '@/modules/governance/hooks/useUserVote';
import type { ISubmitVoteProps } from '@/modules/governance/types';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { Button, Card, ChainEntityType, IconType, useBlockExplorer, type VoteIndicator } from '@aragon/gov-ui-kit';
import { useCallback, useEffect, useState } from 'react';
import { DaoTokenVotingMode, VoteOption, type ITokenProposal, type ITokenVote } from '../../types';
import { TokenVotingOptions } from './components/tokenVotingOptions';

export interface ITokenSubmitVoteProps extends ISubmitVoteProps<ITokenProposal> {
    /**
     * Callback called on submit vote click. Overrides the default behaviour of opening the vote dialog when set.
     */
    onSubmitVoteClick?: (option?: string) => void;
    /**
     * Namespace of the submit vote button.
     * @default change
     */
    submitNamespace?: 'change' | 'update';
}

const voteOptionToIndicator: Record<string, VoteIndicator> = {
    [VoteOption.YES.toString()]: 'yes',
    [VoteOption.ABSTAIN.toString()]: 'abstain',
    [VoteOption.NO.toString()]: 'no',
};

export const TokenSubmitVote: React.FC<ITokenSubmitVoteProps> = (props) => {
    const { daoId, proposal, isVeto, onSubmitVoteClick, submitNamespace = 'change' } = props;
    const { pluginAddress, network } = proposal;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const latestVote = useUserVote<ITokenVote>({ proposal, network });
    const { meta: plugin } = useDaoPlugins({ daoId, pluginAddress, includeSubPlugins: true })![0];

    const { id: chainId } = networkDefinitions[network];
    const { buildEntityUrl } = useBlockExplorer({ chainId });
    const latestVoteTxHref = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: latestVote?.transactionHash });

    const [showOptions, setShowOptions] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | undefined>(latestVote?.voteOption.toString());

    const openTransactionDialog = () => {
        const voteLabel = voteOptionToIndicator[selectedOption ?? ''];
        const descriptionLabel = t(`app.plugins.token.tokenSubmitVote.voteDescription.${isVeto ? 'veto' : 'approve'}`);
        const processedDescriptionLabel = voteLabel === 'abstain' ? undefined : descriptionLabel;

        const vote = { value: Number(selectedOption), label: voteLabel, labelDescription: processedDescriptionLabel };
        const params: IVoteDialogParams = { daoId, proposal, vote, isVeto, plugin };

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

    const handleSubmitVoteClick = () =>
        onSubmitVoteClick != null ? onSubmitVoteClick(selectedOption) : openTransactionDialog();

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
                    {t('app.plugins.token.tokenSubmitVote.buttons.vote')}
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
                        {t('app.plugins.token.tokenSubmitVote.buttons.submitted')}
                    </Button>
                    {proposal.settings.votingMode === DaoTokenVotingMode.VOTE_REPLACEMENT && (
                        <Button
                            variant="tertiary"
                            className="w-full md:w-fit"
                            size="md"
                            onClick={() => setShowOptions(true)}
                        >
                            {t(`app.plugins.token.tokenSubmitVote.buttons.${submitNamespace}.vote`)}
                        </Button>
                    )}
                </div>
            )}
            {showOptions && (
                <Card className="shadow-neutral-sm border border-neutral-100 p-6">
                    <TokenVotingOptions value={selectedOption} onChange={setSelectedOption} isVeto={isVeto} />
                </Card>
            )}
            {showOptions && (
                <div className="flex w-full flex-col items-center gap-y-3 md:flex-row md:gap-x-4">
                    <Button
                        onClick={handleSubmitVoteClick}
                        disabled={!selectedOption || selectedOption === latestVote?.voteOption.toString()}
                        size="md"
                        className="w-full md:w-fit"
                        variant="primary"
                    >
                        {latestVote
                            ? t(`app.plugins.token.tokenSubmitVote.buttons.${submitNamespace}.submit`)
                            : t('app.plugins.token.tokenSubmitVote.buttons.submit')}
                    </Button>
                    <Button size="md" variant="tertiary" className="w-full md:w-fit" onClick={resetVoteOptions}>
                        {t('app.plugins.token.tokenSubmitVote.buttons.cancel')}
                    </Button>
                </div>
            )}
        </div>
    );
};
