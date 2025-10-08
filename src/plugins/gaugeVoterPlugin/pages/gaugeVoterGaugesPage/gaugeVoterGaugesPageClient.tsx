'use client';

import { type IDao, PluginInterfaceType } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { Button, Link } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useTranslations } from '../../../../shared/components/translationsProvider';
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
    const { t } = useTranslations();

    // State for selected gauges for voting (using array instead of Set)
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
        // Filter out any voted gauges from selection (additional safety)
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
                    {address && selectedGauges.length > 0 && (
                        <div className="flex justify-end">
                            <Button variant="primary" onClick={handleVoteClick}>
                                {t('app.plugins.gaugeVoter.gaugeVoterGaugesPage.main.voteOnSelected', {
                                    count: selectedGauges.length,
                                })}
                            </Button>
                        </div>
                    )}
                    <GaugeVoterGaugeList
                        initialParams={initialParams}
                        selectedGauges={selectedGauges}
                        votedGauges={votedGauges}
                        onSelect={address ? handleSelectGauge : undefined}
                    />
                </div>
            </Page.Main>

            <Page.Aside>
                <Page.AsideCard
                    title={t('app.plugins.gaugeVoter.gaugeVoterGaugesPage.aside.title', { epochId: metrics?.epochId })}
                >
                    {description && <p className="text-base text-gray-500">{description}</p>}
                    {address && (
                        <GaugeVoterVotingStats
                            totalVotingPower={votingStats.totalVotingPower}
                            allocatedVotingPower={votingStats.allocatedVotingPower}
                            activeVotes={votingStats.activeVotes}
                        />
                    )}
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
