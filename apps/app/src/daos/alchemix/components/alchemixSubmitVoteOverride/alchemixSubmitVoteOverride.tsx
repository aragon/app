'use client';

import {
    addressUtils,
    Button,
    Card,
    CheckboxCard,
    formatterUtils,
    MemberAvatar,
    NumberFormat,
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
    TokenVotingOptions,
} from '@/plugins/tokenPlugin/components/tokenSubmitVote';
import type { ITokenProposal, ITokenVote } from '@/plugins/tokenPlugin/types';
import { VoteOption } from '@/plugins/tokenPlugin/types';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useAlchemixOverrideStatus } from '../../hooks/useAlchemixOverrideStatus';
import type { IAlchemixVoteOption } from '../../utils/alchemixTransactionUtils';

export interface IAlchemixSubmitVoteOverrideProps {
    /**
     * ID of the DAO the proposal belongs to.
     */
    daoId: string;
    /**
     * Proposal to override the delegate vote for.
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

export const AlchemixSubmitVoteOverride: React.FC<
    IAlchemixSubmitVoteOverrideProps
> = (props) => {
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
        refetch,
    } = useAlchemixOverrideStatus({
        proposalIndex,
        pluginAddress,
        network,
        userAddress: address,
    });

    const { data: delegateeEnsName } = useEnsName(delegatee);
    const { data: delegateeEnsAvatar } = useEnsAvatar(delegateeEnsName);

    const latestVote = useUserVote<ITokenVote>({ proposal, network });

    const [showOptions, setShowOptions] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | undefined>(
        undefined,
    );
    const [alsoVote, setAlsoVote] = useState(false);

    const hasOverridden = userVoteRecord?.hasOverridden === true;
    const overrideOption = hasOverridden
        ? userVoteRecord.voteOption
        : undefined;
    const delegateeVoteOption = delegateeVoteRecord?.voteOption;

    // The vote records are read from the chain while the vote list is indexed by the backend, refetch the reads as
    // soon as the indexed user vote changes to keep both in sync after an override.
    const latestVoteTransactionHash = latestVote?.transactionHash;
    useEffect(() => {
        if (latestVoteTransactionHash != null) {
            refetch();
        }
    }, [latestVoteTransactionHash, refetch]);

    if (address == null || plugin == null || !isEligible) {
        return null;
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
    const delegateeName =
        delegateeEnsName ?? addressUtils.truncateAddress(delegatee);

    const disabledOptions: IDisabledVotingOption[] = [];

    if (hasOverridden && overrideOption != null) {
        disabledOptions.push({
            value: overrideOption.toString(),
            reason: t(
                'app.daos.alchemix.alchemixSubmitVoteOverride.options.currentOverride',
            ),
        });
    } else if (!hasOverridden && delegateeVoteOption != null) {
        disabledOptions.push({
            value: delegateeVoteOption.toString(),
            reason: t(
                'app.daos.alchemix.alchemixSubmitVoteOverride.options.alreadyCounted',
                { option: getOptionLabel(delegateeVoteOption) },
            ),
        });
    }

    const isSelectionValid =
        selectedOption != null &&
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
        const params: IVoteDialogParams = {
            daoId,
            proposal,
            vote,
            isVeto,
            plugin,
        };

        open(GovernanceDialogId.VOTE, { params });
    };

    const resetVoteOptions = () => {
        setSelectedOption(undefined);
        setAlsoVote(false);
        setShowOptions(false);
    };

    // After an override the delegated power no longer counts toward the delegate's vote, and a fully overridden
    // delegate vote is even removed from the vote records — describe the delegate status accordingly instead of
    // stating that the delegate holds (or voted with) the user's tokens.
    const delegateeStatusKey = hasOverridden
        ? delegateeVoteOption != null
            ? 'delegateVotedOverridden'
            : 'delegateOverridden'
        : delegateeVoteOption != null
          ? 'delegateVoted'
          : 'delegateNotVoted';

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
                            'app.daos.alchemix.alchemixSubmitVoteOverride.delegateTag',
                        )}
                        variant="primary"
                    />
                </div>
                <p className="text-neutral-500 text-sm leading-tight">
                    {t(
                        `app.daos.alchemix.alchemixSubmitVoteOverride.${delegateeStatusKey}`,
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
            {hasOverridden && overrideOption != null && !showOptions && (
                <div className="flex items-center gap-3 border-neutral-100 border-t pt-4">
                    <MemberAvatar address={address} size="md" />
                    <div className="flex min-w-0 grow flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            <p className="truncate font-semibold text-base text-neutral-800 leading-tight">
                                {addressUtils.truncateAddress(address)}
                            </p>
                            <Tag
                                label={t(
                                    'app.daos.alchemix.alchemixSubmitVoteOverride.youTag',
                                )}
                                variant="neutral"
                            />
                        </div>
                        <p className="text-neutral-500 text-sm leading-tight">
                            {t(
                                'app.daos.alchemix.alchemixSubmitVoteOverride.overrideInfo',
                                {
                                    amount: formattedDelegatedPower,
                                    symbol: token.symbol,
                                    delegate: delegateeName,
                                },
                            )}
                        </p>
                    </div>
                    <Tag
                        label={getOptionLabel(overrideOption)}
                        variant={optionToTagVariant[overrideOption.toString()]}
                    />
                </div>
            )}
            {!showOptions && (
                <Button
                    className="w-fit"
                    disabled={!canOverride}
                    onClick={() => setShowOptions(true)}
                    size="md"
                    variant={
                        hasOverridden
                            ? 'tertiary'
                            : delegateeVoteOption != null
                              ? 'secondary'
                              : 'primary'
                    }
                >
                    {hasOverridden
                        ? t(
                              'app.daos.alchemix.alchemixSubmitVoteOverride.buttons.change',
                          )
                        : t(
                              'app.daos.alchemix.alchemixSubmitVoteOverride.buttons.override',
                          )}
                </Button>
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
                        <CheckboxCard
                            checked={alsoVote}
                            description={t(
                                'app.daos.alchemix.alchemixSubmitVoteOverride.alsoVote.description',
                            )}
                            label={t(
                                'app.daos.alchemix.alchemixSubmitVoteOverride.alsoVote.label',
                            )}
                            onCheckedChange={(checked) =>
                                setAlsoVote(checked === true)
                            }
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
                            {t(
                                'app.daos.alchemix.alchemixSubmitVoteOverride.buttons.submit',
                            )}
                        </Button>
                        <Button
                            className="w-full md:w-fit"
                            onClick={resetVoteOptions}
                            size="md"
                            variant="tertiary"
                        >
                            {t(
                                'app.daos.alchemix.alchemixSubmitVoteOverride.buttons.cancel',
                            )}
                        </Button>
                    </div>
                </>
            )}
        </Card>
    );
};
