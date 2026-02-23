'use client';

import { Link, Tabs } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { Address } from 'viem';
import { useConnection } from 'wagmi';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { TokenDelegationForm } from '@/plugins/tokenPlugin/components/tokenMemberPanel/tokenDelegation';
import { type IDao, PluginInterfaceType } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useFilterUrlParam } from '@/shared/hooks/useFilterUrlParam';
import type { IGauge, IGetGaugeListParams } from '../../api/gaugeVoterService';
import { useEpochMetrics, useGaugeList } from '../../api/gaugeVoterService';
import { GaugeVoterGaugeList } from '../../components/gaugeVoterGaugeList';
import { GaugeVoterLockForm } from '../../components/gaugeVoterLockForm';
import { GaugeVoterVotingStats } from '../../components/gaugeVoterVotingStats';
import { GaugeVoterVotingTerminal } from '../../components/gaugeVoterVotingTerminal';
import { GaugeVoterPluginDialogId } from '../../constants/gaugeVoterPluginDialogId';
import type { IGaugeVoterGaugeDetailsDialogParams } from '../../dialogs/gaugeVoterGaugeDetailsDialog';
import type { IGaugeVoterVoteDialogParams } from '../../dialogs/gaugeVoterVoteDialog';
import { useGaugeVoterPageData } from '../../hooks/useGaugeVoterPageData';
import type { IGaugeVoterPlugin } from '../../types';

export interface IGaugeVoterGaugesPageClientProps {
    /**
     * The DAO with the capital-distributor plugin installed.
     */
    dao: IDao;
    /**
     * Initial parameters for the campaign list query.
     */
    initialParams: IGetGaugeListParams;
}

enum GaugeVoterLocksPanelTab {
    DELEGATE = 'delegate',
    LOCK = 'lock',
}

export const gaugeVoterLocksPanelFilterParam = 'locksPanel';

export const GaugeVoterGaugesPageClient: React.FC<
    IGaugeVoterGaugesPageClientProps
> = (props) => {
    const { dao, initialParams } = props;

    const { address } = useConnection();
    const { open } = useDialogContext();
    const { t } = useTranslations();
    const { check: checkWalletConnection } = useConnectedWalletGuard();

    const isUserConnected = !!address;
    const { data: gaugeListData } = useGaugeList(initialParams);

    // There are possible multiple gaugeVoter plugins, but we don't support it currently (so we display only the first one).
    const plugins = useDaoPlugins({
        daoId: dao.id,
        interfaceType: PluginInterfaceType.GAUGE_VOTER,
    }) as IFilterComponentPlugin<IGaugeVoterPlugin>[];
    const plugin = plugins[0];

    // Fetch epoch metrics from backend (includes user voting power if connected)
    const epochMetricsParams = {
        urlParams: {
            pluginAddress: plugin.meta.address as Address,
            network: dao.network,
        },
        queryParams: {
            memberAddress: address,
        },
    };
    const { data: epochMetrics } = useEpochMetrics(epochMetricsParams, {
        enabled: !!plugin.meta.address,
    });

    const gauges = gaugeListData?.pages.flatMap((page) => page.data) ?? [];
    const gaugeAddresses = gauges.map((g) => g.address);

    const epochId = epochMetrics?.epochId ?? gauges[0]?.metrics?.epochId;
    const epochTotalVotingPower = epochMetrics?.totalVotingPower
        ? BigInt(epochMetrics.totalVotingPower)
        : undefined;

    // Determine if currently in voting period by comparing current time with vote start/end
    const now = Math.floor(Date.now() / 1000); // Convert to seconds
    const isVotingPeriod = epochMetrics
        ? now >= epochMetrics.epochVoteStart && now <= epochMetrics.epochVoteEnd
        : true; // Fallback to true if no epoch metrics

    const { token } = plugin.meta.settings;
    const tokenSymbol = token.symbol;
    const tokenDecimals = token.decimals ?? 18;

    // Fetch formatted user voting data with backend → RPC fallback
    const {
        votingPower,
        epochVotingPower,
        usagePercentage,
        hasVoted,
        gaugeVotes,
        votedGaugeAddresses,
        isLoading: isUserDataLoading,
    } = useGaugeVoterPageData({
        pluginAddress: plugin.meta.address as Address,
        network: dao.network,
        gaugeAddresses,
        gauges,
        epochTotalVotingPower,
        tokenDecimals,
        enabled: isUserConnected && !!plugin.meta.address,
        // Pass backend user voting power if available (skips RPC calls for performance)
        backendVotingPower: epochMetrics?.memberVotingPower,
        backendUsedVotingPower: epochMetrics?.memberUsedVotingPower,
    });

    const [selectedGauges, setSelectedGauges] = useState<string[]>([]);

    const { description, links } = plugin.meta;

    const selectedCount = selectedGauges.length + votedGaugeAddresses.length;

    const handleSelectGauge = (gauge: IGauge) => {
        // Don't allow selection of already voted gauges
        if (votedGaugeAddresses.includes(gauge.address)) {
            return;
        }

        setSelectedGauges((prev) => {
            if (prev.includes(gauge.address)) {
                return prev.filter((address) => address !== gauge.address);
            }
            return [...prev, gauge.address];
        });
    };

    const handleRemoveGauge = (gaugeAddress: string) => {
        setSelectedGauges((prev) =>
            prev.filter((address) => address !== gaugeAddress),
        );
    };

    const handleVoteClick = () => {
        checkWalletConnection({
            onSuccess: () => {
                if (selectedCount === 0) {
                    return;
                }

                const selectedGaugeList = gauges
                    .filter((gauge) => selectedGauges.includes(gauge.address))
                    .filter(
                        (gauge) => !votedGaugeAddresses.includes(gauge.address),
                    );

                const votedGaugeList = gauges.filter((gauge) =>
                    votedGaugeAddresses.includes(gauge.address),
                );

                const allGaugesToVote = [
                    ...votedGaugeList,
                    ...selectedGaugeList,
                ];

                const voteParams: IGaugeVoterVoteDialogParams = {
                    gauges: allGaugesToVote,
                    pluginAddress: plugin.meta.address,
                    network: dao.network,
                    onRemoveGauge: handleRemoveGauge,
                    totalVotingPower: votingPower.value,
                    tokenSymbol,
                    gaugeVotes: gaugeVotes.map((gv) => ({
                        gaugeAddress: gv.gaugeAddress,
                        votes: gv.votes,
                        formattedVotes: gv.formattedVotes,
                    })),
                    onSuccess: () => setSelectedGauges([]),
                };
                open(GaugeVoterPluginDialogId.VOTE_GAUGES, {
                    params: voteParams,
                });
            },
        });
    };

    const handleViewDetails = (gauge: IGauge) => {
        const selectedIndex = gauges.findIndex(
            (g) => g.address === gauge.address,
        );

        const gaugeDetailsParams: IGaugeVoterGaugeDetailsDialogParams = {
            gauges,
            selectedIndex,
            network: dao.network,
            totalVotingPower: votingPower.value,
            gaugeVotes: gaugeVotes.map((gauge) => ({
                gaugeAddress: gauge.gaugeAddress,
                userVotes: Number(gauge.votes),
            })),
        };
        open(GaugeVoterPluginDialogId.GAUGE_DETAILS, {
            params: gaugeDetailsParams,
        });
    };

    // Calculate days left to vote from epoch vote end time
    const daysLeftToVote = epochMetrics?.epochVoteEnd
        ? Math.max(
              0,
              Math.ceil(
                  (epochMetrics.epochVoteEnd * 1000 - Date.now()) /
                      (1000 * 60 * 60 * 24),
              ),
          )
        : 0;

    // Calculate days left for the next voting period to start (if voting is inactive)
    const daysToNextVoting =
        isVotingPeriod || epochMetrics?.epochVoteStart == null
            ? undefined
            : Math.ceil(
                  (epochMetrics.epochVoteStart * 1000 - Date.now()) /
                      (1000 * 60 * 60 * 24),
              );

    const visibleLocksPanelTabs = [
        { value: GaugeVoterLocksPanelTab.LOCK },
        { value: GaugeVoterLocksPanelTab.DELEGATE },
    ];

    const [selectedLocksPanelTab, setSelectedLocksPanelTab] = useFilterUrlParam(
        {
            name: gaugeVoterLocksPanelFilterParam,
            fallbackValue: GaugeVoterLocksPanelTab.LOCK,
            validValues: visibleLocksPanelTabs.map((tab) => tab.value),
        },
    );

    const cardTitle = token ? `${token.name} (${token.symbol})` : '';

    return (
        <Page.Content>
            <Page.Main
                title={t(
                    'app.plugins.gaugeVoter.gaugeVoterGaugesPage.main.title',
                )}
            >
                <div className="flex flex-col gap-6">
                    <GaugeVoterGaugeList
                        gaugeVotes={gaugeVotes.map((v) => ({
                            gaugeAddress: v.gaugeAddress,
                            formattedVotes: v.formattedVotes,
                            formattedTotalVotes: v.formattedTotalVotes,
                            totalVotesValue: v.totalVotesValue,
                        }))}
                        initialParams={initialParams}
                        isUserConnected={isUserConnected}
                        isUserVotesLoading={isUserDataLoading}
                        isVotingPeriod={isVotingPeriod}
                        onSelect={handleSelectGauge}
                        onViewDetails={handleViewDetails}
                        selectedGauges={selectedGauges}
                        tokenSymbol={tokenSymbol}
                        totalEpochVotingPower={epochVotingPower.value}
                        votedGauges={votedGaugeAddresses}
                    />
                    <GaugeVoterVotingTerminal
                        daysLeftToVote={daysLeftToVote}
                        daysToNextVoting={daysToNextVoting}
                        formattedVotingPower={votingPower.formatted}
                        hasVoted={hasVoted}
                        isLoading={isUserDataLoading}
                        isVotingPeriod={isVotingPeriod}
                        onVote={handleVoteClick}
                        selectedCount={selectedCount}
                        tokenSymbol={tokenSymbol}
                        usagePercentage={usagePercentage}
                    />
                </div>
            </Page.Main>
            <Page.Aside>
                <Page.AsideCard
                    title={t(
                        'app.plugins.gaugeVoter.gaugeVoterGaugesPage.asideStats.title',
                        { epochId },
                    )}
                >
                    {description && (
                        <p className="text-base text-gray-500">{description}</p>
                    )}
                    <GaugeVoterVotingStats
                        daysLeftToVote={daysLeftToVote}
                        formattedEpochVotingPower={epochVotingPower.formatted}
                        formattedUserVotingPower={votingPower.formatted}
                        isUserConnected={isUserConnected}
                        usagePercentage={usagePercentage}
                    />
                    {links?.map(({ url, name }) => (
                        <Link
                            href={url}
                            isExternal={true}
                            key={url}
                            showUrl={true}
                        >
                            {name}
                        </Link>
                    ))}
                </Page.AsideCard>
                <Page.AsideCard title={cardTitle}>
                    <Tabs.Root
                        onValueChange={setSelectedLocksPanelTab}
                        value={selectedLocksPanelTab}
                    >
                        <Tabs.List className="pb-4">
                            {visibleLocksPanelTabs.map(({ value }) => (
                                <Tabs.Trigger
                                    key={value}
                                    label={t(
                                        `app.plugins.gaugeVoter.gaugeVoterGaugesPage.asideLocks.tabs.${value}`,
                                    )}
                                    value={value}
                                />
                            ))}
                        </Tabs.List>
                        <Tabs.Content value={GaugeVoterLocksPanelTab.LOCK}>
                            <GaugeVoterLockForm
                                daoId={dao.id}
                                plugin={plugin.meta}
                            />
                        </Tabs.Content>
                        <Tabs.Content value={GaugeVoterLocksPanelTab.DELEGATE}>
                            <TokenDelegationForm
                                daoId={dao.id}
                                tokenAddress={token.address}
                            />
                        </Tabs.Content>
                    </Tabs.Root>
                </Page.AsideCard>
            </Page.Aside>
        </Page.Content>
    );
};
