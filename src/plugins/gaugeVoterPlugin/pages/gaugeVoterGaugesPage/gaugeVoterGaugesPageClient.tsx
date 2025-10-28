'use client';

import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { type IDao, PluginInterfaceType } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { Link } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { Address } from 'viem';
import { useAccount } from 'wagmi';
import { useTranslations } from '../../../../shared/components/translationsProvider';
import { useDaoPlugins } from '../../../../shared/hooks/useDaoPlugins';
import type { IGetGaugeListParams } from '../../api/gaugeVoterService';
import type { IGauge } from '../../api/gaugeVoterService/domain';
import { useEpochMetrics, useGaugeList } from '../../api/gaugeVoterService/queries';
import { GaugeVoterGaugeList } from '../../components/gaugeVoterGaugeList';
import { GaugeVoterVotingStats } from '../../components/gaugeVoterVotingStats';
import { GaugeVoterVotingTerminal } from '../../components/gaugeVoterVotingTerminal';
import { GaugeVoterPluginDialogId } from '../../constants/gaugeVoterPluginDialogId';
import type { IGaugeVoterGaugeDetailsDialogParams } from '../../dialogs/gaugeVoterGaugeDetailsDialog';
import type { IGaugeVoterVoteDialogParams } from '../../dialogs/gaugeVoterVoteDialog';
import { useGaugeVoterPageData } from '../../hooks/useGaugeVoterPageData';

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

export const GaugeVoterGaugesPageClient: React.FC<IGaugeVoterGaugesPageClientProps> = (props) => {
    const { dao, initialParams } = props;

    const { address } = useAccount();
    const { open } = useDialogContext();
    const { t } = useTranslations();
    const { check: checkWalletConnection } = useConnectedWalletGuard();

    const isUserConnected = !!address;
    const { data: gaugeListData } = useGaugeList(initialParams);

    const plugins = useDaoPlugins({ daoId: dao.id, interfaceType: PluginInterfaceType.GAUGE });
    const plugin = plugins?.[0];

    // Fetch epoch metrics from backend
    const { data: epochMetrics } = useEpochMetrics({
        queryParams: {
            pluginAddress: plugin?.meta.address ?? '',
            network: dao.network,
        },
        enabled: !!plugin?.meta.address,
    });

    const gauges = gaugeListData?.pages.flatMap((page) => page.data) ?? [];
    const gaugeAddresses = gauges.map((g) => g.address);

    // Use backend epoch metrics with fallbacks
    const epochId = epochMetrics?.epochId ?? gauges[0]?.metrics?.epochId;
    const totalVotes = gauges.reduce((sum, gauge) => sum + gauge.metrics.totalMemberVoteCount, 0);
    const epochTotalVotingPower = BigInt(epochMetrics?.totalVotingPower ?? totalVotes.toString());

    // Determine if currently in voting period by comparing current time with vote start/end
    const now = Math.floor(Date.now() / 1000); // Convert to seconds
    const isVotingPeriod = epochMetrics ? now >= epochMetrics.epochVoteStart && now <= epochMetrics.epochVoteEnd : true; // Fallback to true if no epoch metrics

    const tokenSymbol = 'PDT';

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
        pluginAddress: plugin?.meta.address as Address,
        network: dao.network,
        gaugeAddresses,
        gauges,
        epochTotalVotingPower,
        enabled: isUserConnected && !!plugin?.meta.address,
    });

    const [selectedGauges, setSelectedGauges] = useState<string[]>([]);

    if (plugin == null) {
        return null;
    }

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
            } else {
                return [...prev, gauge.address];
            }
        });
    };

    const handleRemoveGauge = (gaugeAddress: string) => {
        setSelectedGauges((prev) => prev.filter((address) => address !== gaugeAddress));
    };

    const handleVoteClick = () => {
        checkWalletConnection({
            onSuccess: () => {
                if (selectedCount === 0) {
                    return;
                }

                const selectedGaugeList = gauges
                    .filter((gauge) => selectedGauges.includes(gauge.address))
                    .filter((gauge) => !votedGaugeAddresses.includes(gauge.address));

                const votedGaugeList = gauges.filter((gauge) => votedGaugeAddresses.includes(gauge.address));

                const allGaugesToVote = [...votedGaugeList, ...selectedGaugeList];

                const voteParams: IGaugeVoterVoteDialogParams = {
                    gauges: allGaugesToVote,
                    pluginAddress: plugin.meta.address,
                    network: dao.network,
                    onRemoveGauge: handleRemoveGauge,
                    totalVotingPower: votingPower.value,
                    tokenSymbol: tokenSymbol,
                };
                open(GaugeVoterPluginDialogId.VOTE_GAUGES, { params: voteParams });
            },
        });
    };

    const handleViewDetails = (gauge: IGauge) => {
        const selectedIndex = gauges.findIndex((g) => g.address === gauge.address);

        const gaugeDetailsParams: IGaugeVoterGaugeDetailsDialogParams = {
            gauges,
            selectedIndex,
            network: dao.network,
            totalVotingPower: votingPower.value,
            tokenSymbol: tokenSymbol,
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
        ? Math.max(0, Math.ceil((epochMetrics.epochVoteEnd * 1000 - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;

    return (
        <Page.Content>
            <Page.Main title={t('app.plugins.gaugeVoter.gaugeVoterGaugesPage.main.title')}>
                <div className="flex flex-col gap-6">
                    <GaugeVoterGaugeList
                        initialParams={initialParams}
                        selectedGauges={selectedGauges}
                        votedGauges={votedGaugeAddresses}
                        onSelect={handleSelectGauge}
                        onViewDetails={handleViewDetails}
                        isUserConnected={isUserConnected}
                        isVotingPeriod={isVotingPeriod}
                        tokenSymbol={tokenSymbol}
                        gaugeVotes={gaugeVotes.map((v) => ({
                            gaugeAddress: v.gaugeAddress,
                            formattedVotes: v.formattedVotes,
                            formattedTotalVotes: v.formattedTotalVotes,
                            totalVotesValue: v.totalVotesValue,
                        }))}
                        totalEpochVotingPower={epochVotingPower.value}
                    />
                    <GaugeVoterVotingTerminal
                        daysLeftToVote={daysLeftToVote}
                        hasVoted={hasVoted}
                        formattedVotingPower={votingPower.formatted}
                        usagePercentage={usagePercentage}
                        selectedCount={selectedCount}
                        tokenSymbol={tokenSymbol}
                        onVote={handleVoteClick}
                        isVotingPeriod={isVotingPeriod}
                        isLoading={isUserDataLoading}
                    />
                </div>
            </Page.Main>
            <Page.Aside>
                <Page.AsideCard title={t('app.plugins.gaugeVoter.gaugeVoterGaugesPage.aside.title', { epochId })}>
                    {description && <p className="text-base text-gray-500">{description}</p>}
                    <GaugeVoterVotingStats
                        daysLeftToVote={daysLeftToVote}
                        formattedEpochVotingPower={epochVotingPower.formatted}
                        formattedUserVotingPower={votingPower.formatted}
                        usagePercentage={usagePercentage}
                        isUserConnected={isUserConnected}
                    />
                    {links?.map(({ url, name }) => (
                        <Link key={url} href={url} isExternal={true} showUrl={true}>
                            {name}
                        </Link>
                    ))}
                </Page.AsideCard>
            </Page.Aside>
        </Page.Content>
    );
};
