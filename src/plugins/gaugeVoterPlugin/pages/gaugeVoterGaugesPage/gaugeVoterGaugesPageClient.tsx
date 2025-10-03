'use client';

import { type IDao, PluginInterfaceType } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useAccount } from 'wagmi';
import { useDaoPlugins } from '../../../../shared/hooks/useDaoPlugins';
import type { IGetGaugeListParams } from '../../api/gaugeVoterService';
import type { IGauge } from '../../api/gaugeVoterService/domain';
import { useGaugeList } from '../../api/gaugeVoterService/queries';
import { GaugeVoterGaugeList } from '../../components/gaugeVoterGaugeList';
import { GaugeVoterVotingStats } from '../../components/gaugeVoterVotingStats';
import { GaugeVoterPluginDialogId } from '../../constants/gaugeVoterPluginDialogId';

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
    const { open, close } = useDialogContext();

    const plugin = useDaoPlugins({ daoId: dao.id, interfaceType: PluginInterfaceType.GAUGE_VOTER })![0];

    const { data: gaugeListData, isLoading, error } = useGaugeList(initialParams);

    const result = gaugeListData?.pages[0]?.data[0]; // Get the first result from pagination
    const gauges = result?.gauges ?? [];
    const metrics = result?.metrics;

    const handleVoteClick = (gauge: IGauge) => {
        open(GaugeVoterPluginDialogId.VOTE_GAUGES, {
            params: {
                gauge,
                plugin,
                network: dao.network,
                close,
            },
        });
    };

    // Calculate stats from metrics or provide defaults
    const votingStats = {
        totalVotingPower: metrics?.votingPower.toString() ?? '0',
        allocatedVotingPower: metrics?.usedVotingPower.toString() ?? '0',
        activeVotes: gauges.filter((g) => g.userVotes > 0).length,
    };

    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-critical-600">Failed to load gauges</p>
                <p className="mt-2 text-sm text-neutral-500">
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
                <h2 className="mb-4 text-xl font-semibold">Available Gauges</h2>
                <GaugeVoterGaugeList
                    gauges={gauges}
                    isLoading={isLoading}
                    onVote={address ? handleVoteClick : undefined}
                />
            </div>

            {!address && (
                <div className="rounded-lg bg-neutral-50 py-8 text-center">
                    <p className="text-neutral-600">Connect your wallet to participate in gauge voting</p>
                </div>
            )}
        </div>
    );
};
