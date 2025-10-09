'use client';

import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { type IDao, PluginInterfaceType } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { Link } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useTranslations } from '../../../../shared/components/translationsProvider';
import { useDaoPlugins } from '../../../../shared/hooks/useDaoPlugins';
import type { IGetGaugeListParams } from '../../api/gaugeVoterService';
import type { IGauge } from '../../api/gaugeVoterService/domain';
import { useGaugeList } from '../../api/gaugeVoterService/queries';
import { GaugeVoterGaugeList } from '../../components/gaugeVoterGaugeList';
import { GaugeVoterVotingStats } from '../../components/gaugeVoterVotingStats';
import { GaugeVoterVotingTerminal } from '../../components/gaugeVoterVotingTerminal';
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
    const { t } = useTranslations();
    const { check: checkWalletConnection } = useConnectedWalletGuard();

    const isUserConnected = !!address;

    const [selectedGauges, setSelectedGauges] = useState<string[]>([]);

    const plugin = useDaoPlugins({ daoId: dao.id, interfaceType: PluginInterfaceType.GAUGE_VOTER })![0];
    const { description, links } = plugin.meta;

    const { data: gaugeListData } = useGaugeList(initialParams);

    const result = gaugeListData?.pages[0]?.data[0]; // Get the first result from pagination
    const gauges = result?.gauges ?? [];
    const metrics = result?.metrics;

    const votedGauges = [gauges[0]?.address].filter(Boolean) as string[];

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

    const handleVoteClick = () => {
        checkWalletConnection({
            onSuccess: () => {
                const selectedGaugeList = gauges
                    .filter((gauge) => selectedGauges.includes(gauge.address))
                    .filter((gauge) => !votedGauges.includes(gauge.address));

                if (selectedGaugeList.length === 0) {
                    return; // No gauges selected
                }

                open(GaugeVoterPluginDialogId.VOTE_GAUGES, {
                    params: {
                        gauges: selectedGaugeList,
                        plugin,
                        network: dao.network,
                        close,
                    },
                });
            },
        });
    };

    const handleViewDetails = (gauge: IGauge) => {
        const selectedIndex = gauges.findIndex((g) => g.address === gauge.address);

        open(GaugeVoterPluginDialogId.GAUGE_DETAILS, {
            params: {
                gauges,
                selectedIndex,
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
                    />
                    <GaugeVoterVotingTerminal
                        totalVotingPower={votingStats.totalVotingPower}
                        usedVotingPower={votingStats.allocatedVotingPower}
                        selectedCount={selectedGauges.length}
                        tokenSymbol="PDT"
                        onVote={handleVoteClick}
                    />
                </div>
            </Page.Main>
            <Page.Aside>
                <Page.AsideCard
                    title={t('app.plugins.gaugeVoter.gaugeVoterGaugesPage.aside.title', { epochId: metrics?.epochId })}
                >
                    {description && <p className="text-base text-gray-500">{description}</p>}
                    <GaugeVoterVotingStats
                        daysLeftToVote={7}
                        totalVotingPower={votingStats.totalVotingPower}
                        allocatedVotingPower={votingStats.allocatedVotingPower}
                        activeVotes={votingStats.activeVotes}
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
