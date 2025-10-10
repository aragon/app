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
import type { IGaugeVoterGaugeDetailsDialogParams } from '../../dialogs/gaugeVoterGaugeDetailsDialog';
import type { IGaugeVoterVoteDialogParams } from '../../dialogs/gaugeVoterVoteDialog';

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
    const isVotingActive = true;
    const { data: gaugeListData } = useGaugeList(initialParams);

    const result = gaugeListData?.pages[0]?.data[0]; // Get the first result from pagination
    const gauges = result?.gauges ?? [];
    const metrics = result?.metrics;
    const tokenSymbol = 'PDT';

    // Mark gauges as voted if they have user votes
    const votedGauges = gauges.filter((gauge) => gauge.userVotes > 0).map((gauge) => gauge.address);

    const [selectedGauges, setSelectedGauges] = useState<string[]>([]);

    const plugin = useDaoPlugins({ daoId: dao.id, interfaceType: PluginInterfaceType.GAUGE_VOTER })![0];
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
        };
        open(GaugeVoterPluginDialogId.GAUGE_DETAILS, {
            params: gaugeDetailsParams,
        });
    };

    const userVotingPower = metrics?.votingPower ?? 0;
    const userTotalVotes = metrics?.usedVotingPower ?? 0;

    const hasVoted = userTotalVotes === userVotingPower && userTotalVotes > 0;

    const votingStats = {
        epochVotingPower: metrics?.totalVotes.toString(),
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
                        isVotingActive={isVotingActive}
                    />
                    {address && (
                        <GaugeVoterVotingTerminal
                            daysLeftToVote={7}
                            hasVoted={hasVoted}
                            totalVotingPower={votingStats.userVotingPower}
                            usedVotingPower={votingStats.userUsedVotingPower}
                            selectedCount={selectedCount}
                            tokenSymbol={tokenSymbol}
                            onVote={handleVoteClick}
                            isVotingActive={isVotingActive}
                        />
                    )}
                </div>
            </Page.Main>
            <Page.Aside>
                <Page.AsideCard
                    title={t('app.plugins.gaugeVoter.gaugeVoterGaugesPage.aside.title', { epochId: metrics?.epochId })}
                >
                    {description && <p className="text-base text-gray-500">{description}</p>}
                    <GaugeVoterVotingStats
                        daysLeftToVote={7}
                        epochVotingPower={votingStats.epochVotingPower ?? '0'}
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
