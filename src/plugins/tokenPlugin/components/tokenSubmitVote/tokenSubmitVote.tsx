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
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { DaoTokenVotingMode, type ITokenProposal, type ITokenVote, VoteOption } from '../../types';

export interface ITokenSubmitVoteProps {
    daoId: string;
    proposal: ITokenProposal;
    isVeto?: boolean;
}

export const TokenSubmitVote: React.FC<ITokenSubmitVoteProps> = ({ daoId, proposal, isVeto }) => {
    const { t } = useTranslations();
    const { open } = useDialogContext();

    const abstainLabel = t('app.plugins.token.tokenSubmitVote.options.abstain');
    const yesLabel = t('app.plugins.token.tokenSubmitVote.options.yes');
    const noLabel = t('app.plugins.token.tokenSubmitVote.options.no');

    const voteOptionToIndicator: Record<string, VoteIndicator> = {
        [VoteOption.YES.toString()]: 'yes',
        [VoteOption.ABSTAIN.toString()]: 'abstain',
        [VoteOption.NO.toString()]: 'no',
    };

    const { voteStatus, isFetchingVote } = useVotedStatus({ proposal });
    const latestVote = voteStatus?.pages[0].data[0] as ITokenVote;
    const { transactionHash, replacedTransactionHash } = latestVote ?? {};

    const [voteState, setVoteState] = useState({
        showOptions: false,
        selectedOption: latestVote?.voteOption.toString() ?? '',
        latestHash: transactionHash,
    });

    useEffect(() => {
        if (latestVote && transactionHash !== voteState.latestHash) {
            setVoteState((prevState) => ({
                ...prevState,
                latestHash: transactionHash,
                selectedOption: latestVote.voteOption.toString(),
                showOptions: false,
            }));
        }
    }, [replacedTransactionHash, transactionHash, voteState.latestHash, latestVote]);

    const openTransactionDialog = () => {
        const vote = {
            value: Number(voteState.selectedOption),
            label: voteOptionToIndicator[voteState.selectedOption],
        };
        const params: IVoteDialogParams = { daoId, proposal, vote, isVeto };

        open(GovernanceDialogs.VOTE, { params });
    };

    const chainId = networkDefinitions[proposal.network].chainId;
    const { buildEntityUrl } = useBlockExplorer({ chainId });
    const latestVoteTxHref = buildEntityUrl({
        type: ChainEntityType.TRANSACTION,
        id: voteState.latestHash,
    });

    const onCancel = () => {
        setVoteState((prevState) => ({
            ...prevState,
            selectedOption: latestVote?.voteOption.toString() ?? '',
            showOptions: false,
        }));
    };

    return (
        <div className={classNames('flex flex-col gap-4', { 'pt-4': !isFetchingVote })}>
            {!voteState.showOptions && !latestVote && !isFetchingVote && (
                <Button
                    className="w-fit"
                    size="md"
                    onClick={() => setVoteState((prev) => ({ ...prev, showOptions: true }))}
                >
                    {t('app.plugins.token.tokenSubmitVote.buttons.default')}
                </Button>
            )}
            {!voteState.showOptions && latestVote && (
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
                            onClick={() => setVoteState((prev) => ({ ...prev, showOptions: true }))}
                        >
                            {t('app.plugins.token.tokenSubmitVote.buttons.changeVote')}
                        </Button>
                    )}
                </div>
            )}
            {voteState.showOptions && (
                <Card className="border border-neutral-100 p-6 shadow-neutral-sm">
                    <RadioGroup
                        label={t('app.plugins.token.tokenSubmitVote.options.label', {
                            label: isVeto
                                ? t('app.plugins.token.tokenSubmitVote.options.vetoLabel')
                                : t('app.plugins.token.tokenSubmitVote.options.approveLabel'),
                        })}
                        value={voteState.selectedOption}
                        onValueChange={(value) => setVoteState((prev) => ({ ...prev, selectedOption: value }))}
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
            {voteState.showOptions && (
                <div className="flex w-full flex-col items-center gap-y-3 md:flex-row md:gap-x-4">
                    <Button
                        onClick={openTransactionDialog}
                        disabled={
                            !voteState.selectedOption || voteState.selectedOption === latestVote?.voteOption.toString()
                        }
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
