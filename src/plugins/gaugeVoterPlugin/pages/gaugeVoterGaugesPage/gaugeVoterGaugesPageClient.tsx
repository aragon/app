'use client';

import { useAccount } from 'wagmi';
import type { Network } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { GaugeVoterGaugeList } from '../../components/gaugeVoterGaugeList';
import { GaugeVoterVotingStats } from '../../components/gaugeVoterVotingStats';
import { useGaugeList } from '../../api/gaugeVoterService/queries';
import { GaugeVoterPluginDialogId } from '../../constants/gaugeVoterPluginDialogId';
import type { IGauge } from '../../api/gaugeVoterService/domain';
import type { IGaugeVoterPlugin } from '../../types';

export interface IGaugeVoterGaugesPageClientProps {
    /**
     * Gauge voter plugin instance.
     */
    plugin: IGaugeVoterPlugin;
    /**
     * Network of the plugin.
     */
    network: Network;
}

export const GaugeVoterGaugesPageClient: React.FC<IGaugeVoterGaugesPageClientProps> = (props) => {
    const { plugin, network } = props;
    const { address } = useAccount();
    const { open, close } = useDialogContext();

    const {
        data: gaugeListData,
        isLoading,
        error,
    } = useGaugeList({
        urlParams: {
            userAddress: address ?? '',
        },
        queryParams: {
            pluginAddress: plugin.address,
            network,
        },
    });

    const result = gaugeListData?.pages[0]?.data[0]; // Get the first result from pagination
    const gauges = result?.gauges ?? [];
    const metrics = result?.metrics;

    const handleVoteClick = (gauge: IGauge) => {
        open(GaugeVoterPluginDialogId.VOTE_GAUGES, {
            params: {
                gauge,
                plugin,
                network,
                close,
            },
        });
    };

    // Calculate stats from metrics or provide defaults
    const votingStats = {
        totalVotingPower: metrics?.votingPower.toString() ?? '0',
        allocatedVotingPower: metrics?.usedVotingPower.toString() ?? '0',
        activeVotes: gauges.filter(g => g.userVotes > 0).length,
    };

    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-critical-600">Failed to load gauges</p>
                <p className="text-sm text-neutral-500 mt-2">
                    {error instanceof Error ? error.message : 'Unknown error occurred'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Gauge Voting</h1>
                {address && (
                    <div className="text-sm text-neutral-600">
                        Connected: {address.slice(0, 6)}...{address.slice(-4)}
                    </div>
                )}
            </div>

            {address && (
                <GaugeVoterVotingStats
                    totalVotingPower={votingStats.totalVotingPower}
                    allocatedVotingPower={votingStats.allocatedVotingPower}
                    activeVotes={votingStats.activeVotes}
                />
            )}

            <div>
                <h2 className="text-xl font-semibold mb-4">Available Gauges</h2>
                <GaugeVoterGaugeList
                    gauges={gauges}
                    isLoading={isLoading}
                    onVote={address ? handleVoteClick : undefined}
                />
            </div>

            {!address && (
                <div className="text-center py-8 bg-neutral-50 rounded-lg">
                    <p className="text-neutral-600">Connect your wallet to participate in gauge voting</p>
                </div>
            )}
        </div>
    );
};