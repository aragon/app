import { GovernanceDialog } from '@/modules/governance/constants/moduleDialogs';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { IVoteDialogParams } from '@/modules/governance/dialogs/voteDialog';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { useUserVote } from '@/modules/governance/hooks/useUserVote';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
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
import { useAccount } from 'wagmi';
import { DaoTokenVotingMode, VoteOption, type ITokenProposal, type ITokenVote } from '../../types';

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
     *  Defines if the vote is to approve or veto the proposal.
     */
    isVeto?: boolean;
}

export const TokenSubmitVote: React.FC<ITokenSubmitVoteProps> = (props) => {
    const { daoId, proposal, isVeto } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { isConnected } = useAccount();

    const latestVote = useUserVote<ITokenVote>({ proposal });

    const [voteState, setVoteState] = useState({
        showOptions: false,
        selectedOption: latestVote?.voteOption.toString(),
    });

    const voteOptionToIndicator: Record<string, VoteIndicator> = {
        [VoteOption.YES.toString()]: 'yes',
        [VoteOption.ABSTAIN.toString()]: 'abstain',
        [VoteOption.NO.toString()]: 'no',
    };

    const openTransactionDialog = () => {
        const voteLabel = voteOptionToIndicator[voteState.selectedOption ?? ''];
        const vote = { value: Number(voteState.selectedOption), label: voteLabel };
        const params: IVoteDialogParams = { daoId, proposal, vote, isVeto };

        open(GovernanceDialog.VOTE, { params });
    };

    const chainId = networkDefinitions[proposal.network].chainId;
    const { buildEntityUrl } = useBlockExplorer({ chainId });
    const latestVoteTxHref = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: latestVote?.transactionHash });

    useEffect(() => {
        setVoteState((prevState) => ({ ...prevState, selectedOption: latestVote?.voteOption.toString() }));
    }, [latestVote, isConnected]);

    const onCancel = () => {
        setVoteState((prevState) => ({
            ...prevState,
            selectedOption: latestVote?.voteOption.toString(),
            showOptions: false,
        }));
    };

    const currentTag = { variant: 'info' as const, label: t('app.plugins.token.tokenSubmitVote.options.current') };

    const voteOptions = [
        { label: t('app.plugins.token.tokenSubmitVote.options.yes'), value: VoteOption.YES.toString() },
        { label: t('app.plugins.token.tokenSubmitVote.options.abstain'), value: VoteOption.ABSTAIN.toString() },
        { label: t('app.plugins.token.tokenSubmitVote.options.no'), value: VoteOption.NO.toString() },
    ];

    const plugin = useDaoPlugins({ daoId, pluginAddress: proposal.pluginAddress });

    const slotParams = {
        plugin: plugin![0].meta,
        daoId,
        proposal,
        chainId,
        title: t('app.governance.permissionCheckTokenVoteDialog.title'),
        description: t('app.governance.permissionCheckTokenVoteDialog.description'),
    };
    const { check: submitVoteGuard, result: canVote } = usePermissionCheckGuard({
        params: slotParams,
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_VOTE_SUBMISSION,
        onSuccess: () => setVoteState((prev) => ({ ...prev, showOptions: true })),
    });

    useEffect(() => {
        if (!isConnected || !canVote) {
            setVoteState((prevState) => ({ ...prevState, showOptions: false }));
            // TODO should include vote guard, but need to investigate max rerender issue w/ Radix
        }
    }, [isConnected, canVote]);

    return (
        <div className="flex flex-col gap-4">
            {!voteState.showOptions && !latestVote && (
                <Button className="w-fit" size="md" onClick={submitVoteGuard}>
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
                        {t('app.plugins.token.tokenSubmitVote.buttons.submitted')}
                    </Button>
                    {proposal.settings.votingMode === DaoTokenVotingMode.VOTE_REPLACEMENT && (
                        <Button
                            variant="tertiary"
                            className="w-full md:w-fit"
                            size="md"
                            onClick={() => setVoteState((prev) => ({ ...prev, showOptions: true }))}
                        >
                            {t('app.plugins.token.tokenSubmitVote.buttons.change')}
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
                        value={voteState.selectedOption?.toString() ?? ''}
                        onValueChange={(value) => setVoteState((prev) => ({ ...prev, selectedOption: value }))}
                    >
                        {voteOptions.map(({ label, value }) => (
                            <RadioCard
                                key={value}
                                label={label}
                                tag={latestVote?.voteOption.toString() === value ? currentTag : undefined}
                                value={value}
                            />
                        ))}
                    </RadioGroup>
                </Card>
            )}
            {voteState.showOptions && (
                <div className="flex w-full flex-col items-center gap-y-3 md:flex-row md:gap-x-4">
                    <Button
                        onClick={openTransactionDialog}
                        disabled={
                            !voteState.selectedOption ||
                            voteState.selectedOption.toString() === latestVote?.voteOption.toString()
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
