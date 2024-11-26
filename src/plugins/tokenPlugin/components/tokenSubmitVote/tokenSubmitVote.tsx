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
import { useEffect, useState } from 'react';
import { DaoTokenVotingMode, type ITokenProposal, ITokenVote, VoteOption } from '../../types';

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

    const abstainLabel = t('app.plugins.token.tokenSubmitVote.options.abstain');
    const yesLabel = t('app.plugins.token.tokenSubmitVote.options.yes');
    const noLabel = t('app.plugins.token.tokenSubmitVote.options.no');

    const voteOptionToIndicator: Record<string, VoteIndicator> = {
        [VoteOption.YES.toString()]: 'yes',
        [VoteOption.ABSTAIN.toString()]: 'abstain',
        [VoteOption.NO.toString()]: 'no',
    };

    const voteStatus = useVotedStatus({ proposal });
    const latestVote = voteStatus?.pages[0].data[0] as ITokenVote | undefined;
    const { transactionHash } = latestVote ?? {};

    const [selectedOption, setSelectedOption] = useState('');

    useEffect(() => {
        if (latestVote) {
            setSelectedOption(latestVote.voteOption.toString());
        }
    }, [latestVote]);

    const openTransactionDialog = () => {
        const vote = { value: Number(selectedOption), label: voteOptionToIndicator[selectedOption] };
        const params: IVoteDialogParams = { daoId, proposal, vote, isVeto };

        open(GovernanceDialogs.VOTE, { params });
    };

    // const latestVoteTx = replacedTransactionHash ?? transactionHash;
    const latestVoteTx = transactionHash;
    const chainId = networkDefinitions[proposal.network].chainId;
    const { buildEntityUrl } = useBlockExplorer({ chainId });
    const latestVoteTxHref = buildEntityUrl({
        type: ChainEntityType.TRANSACTION,
        id: latestVoteTx ?? '',
    });

    const onCancel = () => {
        setSelectedOption(latestVote?.voteOption.toString() ?? '');
        setShowOptions(false);
    };

    return (
        <div className="flex flex-col gap-4 pt-4">
            {!showOptions && !latestVote && (
                <Button className="w-fit" size="md" onClick={() => setShowOptions(true)}>
                    {t('app.plugins.token.tokenSubmitVote.buttons.default')}
                </Button>
            )}
            {!showOptions && latestVote && (
                <div className="flex w-full flex-col items-center gap-4 md:flex-row">
                    <Button
                        href={latestVoteTxHref}
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
                            tag={
                                latestVote?.voteOption === VoteOption.YES
                                    ? { variant: 'info', label: 'Current' }
                                    : undefined
                            }
                            value={VoteOption.YES.toString()}
                        />
                        <RadioCard
                            label={abstainLabel}
                            description=""
                            tag={
                                latestVote?.voteOption === VoteOption.ABSTAIN
                                    ? { variant: 'info', label: 'Current' }
                                    : undefined
                            }
                            value={VoteOption.ABSTAIN.toString()}
                        />
                        <RadioCard
                            label={noLabel}
                            description=""
                            tag={
                                latestVote?.voteOption === VoteOption.NO
                                    ? { variant: 'info', label: 'Current' }
                                    : undefined
                            }
                            value={VoteOption.NO.toString()}
                        />
                    </RadioGroup>
                </Card>
            )}
            {showOptions && (
                <div className="flex w-full flex-col items-center gap-y-3 md:flex-row md:gap-x-4">
                    <Button
                        onClick={openTransactionDialog}
                        disabled={!selectedOption || selectedOption === latestVote?.voteOption.toString()}
                        size="md"
                        className="w-full md:w-fit"
                        variant="primary"
                    >
                        {latestVote
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
