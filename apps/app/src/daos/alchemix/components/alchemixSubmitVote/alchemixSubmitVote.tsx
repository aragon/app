'use client';

import {
    addressUtils,
    Button,
    Card,
    ChainEntityType,
    formatterUtils,
    IconType,
    MemberAvatar,
    NumberFormat,
    Switch,
    Tag,
    type TagVariant,
    type VoteIndicator,
} from '@aragon/gov-ui-kit';
import { useEffect, useState } from 'react';
import { formatUnits } from 'viem';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { useEnsAvatar, useEnsName } from '@/modules/ens';
import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import type { IVoteDialogParams } from '@/modules/governance/dialogs/voteDialog';
import { useUserVote } from '@/modules/governance/hooks/useUserVote';
import {
    type IDisabledVotingOption,
    TokenSubmitVoteDefault,
    TokenVotingOptions,
} from '@/plugins/tokenPlugin/components/tokenSubmitVote';
import type { ITokenProposal, ITokenVote } from '@/plugins/tokenPlugin/types';
import { VoteOption } from '@/plugins/tokenPlugin/types';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useAlchemixOverrideStatus } from '../../hooks/useAlchemixOverrideStatus';
import type { IAlchemixVoteOption } from '../../utils/alchemixTransactionUtils';

export interface IAlchemixSubmitVoteProps {
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

const voteOptionToIndicator: Record<string, VoteIndicator> = {
    [VoteOption.YES.toString()]: 'yes',
    [VoteOption.ABSTAIN.toString()]: 'abstain',
    [VoteOption.NO.toString()]: 'no',
};

export const AlchemixSubmitVote: React.FC<IAlchemixSubmitVoteProps> = (
    props,
) => {
    const { daoId, proposal, isVeto } = props;
    const { pluginAddress, network, proposalIndex, settings } = proposal;
    const { token } = settings;

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { address } = useWalletAccount();

    const plugin = useDaoPlugins({
        daoId,
        pluginAddress,
        includeSubPlugins: true,
        includeLinkedAccounts: true,
    })?.[0]?.meta;

    const {
        isEligible,
        delegatee,
        delegatedVotingPower,
        userVoteRecord,
        delegateeVoteRecord,
        canOverride,
        canVote,
        isLoading,
        isError,
        refetch,
    } = useAlchemixOverrideStatus({
        proposalIndex,
        pluginAddress,
        network,
        userAddress: address,
    });

    const { data: delegateeEnsName } = useEnsName(delegatee);
    const { data: delegateeEnsAvatar } = useEnsAvatar(delegateeEnsName);
    const { data: userEnsName } = useEnsName(address);
    const { data: userEnsAvatar } = useEnsAvatar(userEnsName);

    const latestVote = useUserVote<ITokenVote>({ proposal, network });

    const { buildEntityUrl } = useDaoChain({ network });
    const latestVoteTxHref = buildEntityUrl({
        type: ChainEntityType.TRANSACTION,
        id: latestVote?.transactionHash,
    });

    const [showOptions, setShowOptions] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | undefined>(
        undefined,
    );
    const [alsoVote, setAlsoVote] = useState(true);

    const hasOverridden = userVoteRecord?.hasOverridden === true;
    // The user's position on the proposal is tracked through the contract flags and not through the indexed votes:
    // the plugin also emits a vote-cast event for a pure override, which must not be displayed as a normal vote.
    const hasPosition =
        hasOverridden || userVoteRecord?.votedWithDelegatedVp === true;
    const positionOption = userVoteRecord?.voteOption;
    const delegateeVoteOption = delegateeVoteRecord?.voteOption;

    // The vote records are read from the chain while the vote list is indexed by the backend, refetch the reads as
    // soon as the indexed user vote changes to keep both in sync after a vote, and close the vote options to
    // display the updated position.
    const latestVoteTransactionHash = latestVote?.transactionHash;
    useEffect(() => {
        if (latestVoteTransactionHash != null) {
            refetch();
            setShowOptions(false);
            setSelectedOption(undefined);
        }
    }, [latestVoteTransactionHash, refetch]);

    // Fall back to the default token-voting controls when the override feature does not apply to the connected
    // user or its status cannot be resolved. While the status is loading, render nothing to avoid briefly showing
    // the default controls to a user that is only allowed to override.
    if (address == null || plugin == null || isError) {
        return <TokenSubmitVoteDefault {...props} />;
    }

    if (isLoading) {
        return null;
    }

    if (!isEligible) {
        return <TokenSubmitVoteDefault {...props} />;
    }

    const getOptionLabel = (option: VoteOption) =>
        t(
            `app.plugins.token.tokenSubmitVote.options.${voteOptionToIndicator[option.toString()]}`,
        );

    const optionToTagVariant: Record<string, TagVariant> = {
        [VoteOption.YES.toString()]: isVeto ? 'critical' : 'success',
        [VoteOption.ABSTAIN.toString()]: 'neutral',
        [VoteOption.NO.toString()]: isVeto ? 'success' : 'critical',
    };

    const formattedDelegatedPower = formatterUtils.formatNumber(
        formatUnits(delegatedVotingPower ?? BigInt(0), token.decimals),
        { format: NumberFormat.TOKEN_AMOUNT_SHORT },
    );
    const formattedPositionPower = formatterUtils.formatNumber(
        formatUnits(userVoteRecord?.votingPower ?? BigInt(0), token.decimals),
        { format: NumberFormat.TOKEN_AMOUNT_SHORT },
    );
    const delegateeName =
        delegateeEnsName ?? addressUtils.truncateAddress(delegatee);
    const userName = userEnsName ?? addressUtils.truncateAddress(address);

    const disabledOptions: IDisabledVotingOption[] = [];

    if (positionOption != null) {
        disabledOptions.push({
            value: positionOption.toString(),
            reason: t(
                'app.daos.alchemix.alchemixSubmitVote.options.currentVote',
            ),
        });
    }

    if (
        !hasOverridden &&
        delegateeVoteOption != null &&
        delegateeVoteOption !== positionOption
    ) {
        disabledOptions.push({
            value: delegateeVoteOption.toString(),
            reason: t(
                'app.daos.alchemix.alchemixSubmitVote.options.alreadyCounted',
                { option: getOptionLabel(delegateeVoteOption) },
            ),
        });
    }

    const isSelectionValid =
        !!selectedOption &&
        !disabledOptions.some((option) => option.value === selectedOption);

    const openTransactionDialog = () => {
        const voteLabel = voteOptionToIndicator[selectedOption ?? ''];
        const voteLabelDescription =
            voteLabel === 'abstain'
                ? undefined
                : t(
                      `app.plugins.token.tokenSubmitVote.voteDescription.${isVeto ? 'veto' : 'approve'}`,
                  );
        const vote: IAlchemixVoteOption & IVoteDialogParams['vote'] = {
            value: Number(selectedOption),
            label: voteLabel,
            labelDescription: voteLabelDescription,
            voteType: alsoVote && canVote ? 'voteAndOverride' : 'override',
        };
        // The position is read from the chain, refetch it as soon as the transaction is included in a block instead
        // of waiting for the vote to be indexed by the backend.
        const handleVoteSuccess = () => {
            refetch();
            setShowOptions(false);
            setSelectedOption(undefined);
            setAlsoVote(true);
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

    const resetVoteOptions = () => {
        setSelectedOption(undefined);
        setAlsoVote(true);
        setShowOptions(false);
    };

    // After an override the delegated power no longer counts toward the delegate's vote, and a fully overridden
    // delegate vote is even removed from the vote records — describe the delegate status accordingly instead of
    // stating that the delegate votes with the user's tokens.
    const delegateeStatusKey = hasOverridden
        ? delegateeVoteOption != null
            ? 'delegateVotedOverridden'
            : 'delegateOverridden'
        : delegateeVoteOption != null
          ? 'delegateVoted'
          : 'delegateNotVoted';

    // The contract records a single position per account: a normal vote and an override always share one vote
    // option and only differ in the power sources counted for it — describe the position accordingly.
    const positionInfo = hasOverridden
        ? t('app.daos.alchemix.alchemixSubmitVote.position.overrode', {
              amount: formattedPositionPower,
              symbol: token.symbol,
              delegate: delegateeName,
          })
        : t('app.daos.alchemix.alchemixSubmitVote.position.voted', {
              amount: formattedPositionPower,
              symbol: token.symbol,
          });

    const delegateeInfo = (
        <div className="flex items-center gap-3">
            <MemberAvatar
                address={delegatee}
                avatarSrc={delegateeEnsAvatar ?? undefined}
                size="md"
            />
            <div className="flex min-w-0 grow flex-col gap-0.5">
                <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-base text-neutral-800 leading-tight">
                        {delegateeName}
                    </p>
                    <Tag
                        label={t(
                            'app.daos.alchemix.alchemixSubmitVote.delegateTag',
                        )}
                        variant="primary"
                    />
                </div>
                <p className="text-neutral-500 text-sm leading-tight">
                    {t(
                        `app.daos.alchemix.alchemixSubmitVote.${delegateeStatusKey}`,
                        {
                            amount: formattedDelegatedPower,
                            symbol: token.symbol,
                        },
                    )}
                </p>
            </div>
            {delegateeVoteOption != null && (
                <Tag
                    label={getOptionLabel(delegateeVoteOption)}
                    variant={optionToTagVariant[delegateeVoteOption.toString()]}
                />
            )}
        </div>
    );

    return (
        <Card className="flex flex-col gap-4 border border-neutral-100 p-4 shadow-neutral-sm md:p-6">
            {delegateeInfo}
            {hasPosition && !showOptions && (
                <div className="flex items-center gap-3 border-neutral-100 border-t pt-4">
                    <MemberAvatar
                        address={address}
                        avatarSrc={userEnsAvatar ?? undefined}
                        size="md"
                    />
                    <div className="flex min-w-0 grow flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            <p className="truncate font-semibold text-base text-neutral-800 leading-tight">
                                {userName}
                            </p>
                            <Tag
                                label={t(
                                    'app.daos.alchemix.alchemixSubmitVote.youTag',
                                )}
                                variant="neutral"
                            />
                        </div>
                        <p className="text-neutral-500 text-sm leading-tight">
                            {positionInfo}
                        </p>
                    </div>
                    {positionOption != null && (
                        <Tag
                            label={getOptionLabel(positionOption)}
                            variant={
                                optionToTagVariant[positionOption.toString()]
                            }
                        />
                    )}
                </div>
            )}
            {!showOptions && !hasPosition && (
                <Button
                    className="w-fit"
                    disabled={!canOverride}
                    onClick={() => setShowOptions(true)}
                    size="md"
                    variant="secondary"
                >
                    {t('app.daos.alchemix.alchemixSubmitVote.buttons.override')}
                </Button>
            )}
            {!showOptions && hasPosition && (
                <div className="flex w-full flex-col items-center gap-4 md:flex-row">
                    {latestVoteTxHref != null ? (
                        <Button
                            className="w-full md:w-fit"
                            href={latestVoteTxHref}
                            iconLeft={IconType.CHECKMARK}
                            size="md"
                            target="_blank"
                            variant="secondary"
                        >
                            {t(
                                'app.plugins.token.tokenSubmitVote.buttons.submitted',
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
                                'app.plugins.token.tokenSubmitVote.buttons.submitted',
                            )}
                        </Button>
                    )}
                    <Button
                        className="w-full md:w-fit"
                        disabled={!canOverride && !canVote}
                        onClick={() => setShowOptions(true)}
                        size="md"
                        variant="tertiary"
                    >
                        {t(
                            'app.plugins.token.tokenSubmitVote.buttons.change.vote',
                        )}
                    </Button>
                </div>
            )}
            {showOptions && (
                <>
                    <TokenVotingOptions
                        disabledOptions={disabledOptions}
                        isVeto={isVeto}
                        onChange={setSelectedOption}
                        value={selectedOption}
                    />
                    {canVote && (
                        <Switch
                            checked={alsoVote}
                            helpText={t(
                                'app.daos.alchemix.alchemixSubmitVote.alsoVote.description',
                            )}
                            inlineLabel={t(
                                'app.daos.alchemix.alchemixSubmitVote.alsoVote.label',
                            )}
                            onCheckedChanged={setAlsoVote}
                        />
                    )}
                    <div className="flex w-full flex-col items-center gap-y-3 md:flex-row md:gap-x-4">
                        <Button
                            className="w-full md:w-fit"
                            disabled={!isSelectionValid || !canOverride}
                            onClick={openTransactionDialog}
                            size="md"
                            variant="primary"
                        >
                            {hasPosition
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
                            {t(
                                'app.plugins.token.tokenSubmitVote.buttons.cancel',
                            )}
                        </Button>
                    </div>
                </>
            )}
        </Card>
    );
};
