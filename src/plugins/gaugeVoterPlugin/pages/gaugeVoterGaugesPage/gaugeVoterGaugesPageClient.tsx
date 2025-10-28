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
import { useGaugeVoterUserData } from '../../hooks/useGaugeVoterUserData';

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

    // Use backend epoch metrics with fallbacks
    const epochId = epochMetrics?.epochId ?? gauges[0]?.metrics?.epochId;
    const totalVotes = gauges.reduce((sum, gauge) => sum + gauge.metrics.totalMemberVoteCount, 0);

    // Determine if currently in voting period by comparing current time with vote start/end
    const now = Math.floor(Date.now() / 1000); // Convert to seconds
    const isVotingPeriod = epochMetrics ? now >= epochMetrics.epochVoteStart && now <= epochMetrics.epochVoteEnd : true; // Fallback to true if no epoch metrics

    const tokenSymbol = 'PDT';

    // Fetch user voting data from blockchain
    const gaugeAddresses = gauges.map((g) => g.address);
    const {
        votingPower: userVotingPowerBigInt,
        usedVotingPower: userUsedVotingPowerBigInt,
        gaugeVotes,
        // isLoading: isUserDataLoading,
    } = useGaugeVoterUserData({
        pluginAddress: plugin?.meta.address as Address,
        network: dao.network,
        gaugeAddresses,
        enabled: isUserConnected && !!plugin?.meta.address,
    });

    // Convert BigInt to number for display
    const userVotingPower = Number(userVotingPowerBigInt);
    const userTotalVotes = Number(userUsedVotingPowerBigInt);

    // Mark gauges as voted if they have user votes from blockchain
    const votedGauges = gaugeVotes.filter((v) => v.userVotes > 0).map((v) => v.gaugeAddress);

    const [selectedGauges, setSelectedGauges] = useState<string[]>([]);

    if (plugin == null) {
        return null;
    }

    const { description, links } = plugin.meta;

    const selectedCount = selectedGauges.length + votedGauges.length;

    const handleSelectGauge = (gauge: IGauge) => {
        // Don't allow selection of already voted gauges
        if (votedGauges.includes(gauge.address)) {
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
                    .filter((gauge) => !votedGauges.includes(gauge.address));

                const votedGaugeList = gauges.filter((gauge) => votedGauges.includes(gauge.address));

                const allGaugesToVote = [...votedGaugeList, ...selectedGaugeList];

                const voteParams: IGaugeVoterVoteDialogParams = {
                    gauges: allGaugesToVote,
                    pluginAddress: plugin.meta.address,
                    network: dao.network,
                    onRemoveGauge: handleRemoveGauge,
                    totalVotingPower: userVotingPower,
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
            totalVotingPower: userVotingPower,
            tokenSymbol: tokenSymbol,
            gaugeVotes: gaugeVotes.map((v) => ({
                gaugeAddress: v.gaugeAddress,
                userVotes: Number(v.userVotes),
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

    const hasVoted = userTotalVotes === userVotingPower && userTotalVotes > 0;

    const votingStats = {
        epochVotingPower: epochMetrics?.totalVotingPower ?? totalVotes.toString(),
        userVotingPower: userVotingPower.toString(),
        userUsedVotingPower: userTotalVotes.toString(),
    };

    return (
        <Page.Content>
            <Page.Main title={t('app.plugins.gaugeVoter.gaugeVoterGaugesPage.main.title')}>
                <div className="flex flex-col gap-6">
                    <GaugeVoterGaugeList
                        initialParams={initialParams}
                        selectedGauges={selectedGauges}
                        votedGauges={votedGauges}
                        onSelect={handleSelectGauge}
                        onViewDetails={handleViewDetails}
                        isUserConnected={isUserConnected}
                        isVotingPeriod={isVotingPeriod}
                        tokenSymbol={tokenSymbol}
                        gaugeVotes={gaugeVotes.map((v) => ({
                            gaugeAddress: v.gaugeAddress,
                            userVotes: Number(v.userVotes),
                        }))}
                    />
                    <GaugeVoterVotingTerminal
                        daysLeftToVote={daysLeftToVote}
                        hasVoted={hasVoted}
                        totalVotingPower={votingStats.userVotingPower}
                        usedVotingPower={votingStats.userUsedVotingPower}
                        selectedCount={selectedCount}
                        tokenSymbol={tokenSymbol}
                        onVote={handleVoteClick}
                        isVotingPeriod={isVotingPeriod}
                    />
                </div>
            </Page.Main>
            <Page.Aside>
                <Page.AsideCard title={t('app.plugins.gaugeVoter.gaugeVoterGaugesPage.aside.title', { epochId })}>
                    {description && <p className="text-base text-gray-500">{description}</p>}
                    <GaugeVoterVotingStats
                        daysLeftToVote={daysLeftToVote}
                        epochVotingPower={votingStats.epochVotingPower}
                        userVotingPower={votingStats.userVotingPower}
                        userUsedVotingPower={votingStats.userUsedVotingPower}
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
