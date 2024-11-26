import { GovernanceDialogs } from '@/modules/governance/constants/moduleDialogs';
import type { IVoteDialogParams } from '@/modules/governance/dialogs/voteDialog';
import { useVotedStatus } from '@/modules/governance/hooks/useVotedStatus';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    Button,
    Card,
    ChainEntityType,
    IconType,
    RadioCard,
    RadioGroup,
    useBlockExplorer,
    type VoteIndicator,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { DaoTokenVotingMode, type ITokenProposal, VoteOption } from '../../types';

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
     *  Defines if the vote to approve or veto the proposal.
     */
    isVeto?: boolean;
}

export const TokenSubmitVote: React.FC<ITokenSubmitVoteProps> = (props) => {
    const { daoId, proposal, isVeto } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const [showOptions, setShowOptions] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');

    const abstainLabel = t('app.plugins.token.tokenSubmitVote.options.abstain');
    const yesLabel = t('app.plugins.token.tokenSubmitVote.options.yes');
    const noLabel = t('app.plugins.token.tokenSubmitVote.options.no');

    const voteOptionToIndicator: Record<string, VoteIndicator> = {
        [VoteOption.YES.toString()]: 'yes',
        [VoteOption.ABSTAIN.toString()]: 'abstain',
        [VoteOption.NO.toString()]: 'no',
    };

    const openTransactionDialog = () => {
        const vote = { value: Number(selectedOption), label: voteOptionToIndicator[selectedOption] };
        const params: IVoteDialogParams = { daoId, proposal, vote, isVeto };

        open(GovernanceDialogs.VOTE, { params });
    };

    const voted = useVotedStatus({ proposal });
    const chainId = networkDefinitions[proposal.network].chainId;
    const { buildEntityUrl } = useBlockExplorer({ chainId });
    const latestTxHref = buildEntityUrl({
        type: ChainEntityType.TRANSACTION,
        id: voted.replacedTransactionHash ?? voted.transactionHash,
    });

    const onCancel = () => {
        setSelectedOption('');
        setShowOptions(false);
    };

    // Set Radio Card selection to 'Current' vote if voted, update tag logic (tag stays on votedOption from backend)
    // 'Vote submitted' button opens Votes tab above and shows users vote at top

    return (
        <div className="flex flex-col gap-4 pt-4">
            {!showOptions && !voted && (
                <Button className="w-fit" size="md" onClick={() => setShowOptions(true)}>
                    {t('app.plugins.token.tokenSubmitVote.buttons.default')}
                </Button>
            )}
            {!showOptions && voted && (
                <div className="flex w-full flex-col items-center gap-4 md:flex-row">
                    <Button
                        href={latestTxHref}
                        target="_blank"
                        variant="secondary"
                        iconLeft={IconType.CHECKMARK}
                        className="w-full md:w-fit"
                        size="md"
                    >
                        {t('app.plugins.token.tokenSubmitVote.buttons.voteSubmitted')}
                    </Button>
                    {proposal.settings.votingMode === DaoTokenVotingMode.VOTE_REPLACEMENT && (
                        <Button
                            variant="tertiary"
                            className="w-full md:w-fit"
                            size="md"
                            onClick={() => setShowOptions(true)}
                        >
                            {t('app.plugins.token.tokenSubmitVote.buttons.changeVote')}
                        </Button>
                    )}
                </div>
            )}
            {showOptions && (
                <Card className="border border-neutral-100 p-6 shadow-neutral-sm">
                    <RadioGroup
                        label={t('app.plugins.token.tokenSubmitVote.options.label', {
                            label: isVeto
                                ? t('app.plugins.token.tokenSubmitVote.options.vetoLabel')
                                : t('app.plugins.token.tokenSubmitVote.options.approveLabel'),
                        })}
                        value={selectedOption}
                        onValueChange={setSelectedOption}
                    >
                        <RadioCard
                            label={yesLabel}
                            description=""
                            tag={voted ? { variant: 'info', label: 'Current' } : undefined}
                            value={VoteOption.YES.toString()}
                        />
                        <RadioCard
                            label={abstainLabel}
                            description=""
                            tag={voted ? { variant: 'info', label: 'Current' } : undefined}
                            value={VoteOption.ABSTAIN.toString()}
                        />
                        <RadioCard
                            label={noLabel}
                            description=""
                            tag={voted ? { variant: 'info', label: 'Current' } : undefined}
                            value={VoteOption.NO.toString()}
                        />
                    </RadioGroup>
                </Card>
            )}
            {showOptions && (
                <div className="flex w-full flex-col items-center gap-y-3 md:flex-row md:gap-x-4">
                    <Button
                        onClick={openTransactionDialog}
                        disabled={!selectedOption}
                        size="md"
                        className="w-full md:w-fit"
                        variant="primary"
                    >
                        {voted
                            ? t('app.plugins.token.tokenSubmitVote.buttons.submitChange')
                            : t('app.plugins.token.tokenSubmitVote.buttons.submit')}
                    </Button>
                    <Button size="md" variant="tertiary" className="w-full md:w-fit" onClick={onCancel}>
                        {t('app.plugins.token.tokenSubmitVote.buttons.cancel')}
                    </Button>
                </div>
            )}
        </div>
    );
};
