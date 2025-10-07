'use client';

import { type IDao, PluginInterfaceType } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { Link } from '@aragon/gov-ui-kit';
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

    const plugin = useDaoPlugins({ daoId: dao.id, interfaceType: PluginInterfaceType.GAUGE_VOTER })![0];
    const { description, links } = plugin.meta;

    const { data: gaugeListData } = useGaugeList(initialParams);

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

    return (
        <Page.Content>
            <Page.Main title={t('app.plugins.gaugeVoter.gaugeVoterGaugesPage.main.title')}>
                <GaugeVoterGaugeList
                    gauges={gauges}
                    initialParams={initialParams}
                    onVote={address ? handleVoteClick : undefined}
                />
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
