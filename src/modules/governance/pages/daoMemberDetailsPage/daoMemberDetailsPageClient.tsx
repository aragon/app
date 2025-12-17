'use client';

import { addressUtils, ChainEntityType, DateFormat, DefinitionList, formatterUtils, MemberAvatar } from '@aragon/gov-ui-kit';
import { useBlock } from 'wagmi';
import { DaoList } from '@/modules/explore/components/daoList';
import { useEfpStats } from '@/modules/governance/api/efpService';
import { EfpCard } from '@/modules/governance/components/efpCard';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import type { IPageHeaderStat } from '@/shared/components/page/pageHeader/pageHeaderStat';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { networkUtils } from '@/shared/utils/networkUtils';
import EfpLogo from '../../../../assets/images/efp-logo.svg';
import { daoUtils } from '../../../../shared/utils/daoUtils';
import { useMember } from '../../api/governanceService';
import { DaoProposalList } from '../../components/daoProposalList';
import { VoteList } from '../../components/voteList';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import type { IUsePluginMemberStatsParams } from '../../types';

export interface IDaoMemberDetailsPageClientProps {
    /**
     * The DAO ID.
     */
    daoId: string;
    /**
     * Address of the DAO member.
     */
    address: string;
}

const memberProposalsCount = 3;
const memberVotesCount = 5;
const memberDaosCount = 3;

const buildMemberStats = (
    pluginStats: IPageHeaderStat[] | undefined,
    formattedLatestActivity: string | undefined,
    t: ReturnType<typeof useTranslations>['t']
) => {
    const [value, unit] = formattedLatestActivity?.split(' ') ?? [undefined, undefined];
    const suffix = unit ? t('app.governance.daoMemberDetailsPage.header.stat.latestActivityUnit', { unit }) : undefined;

    return [
        ...(pluginStats ?? []),
        {
            label: t('app.governance.daoMemberDetailsPage.header.stat.latestActivity'),
            value: value ?? '-',
            suffix,
        },
    ];
};

const formatMemberActivity = (firstBlock?: { timestamp?: bigint }, lastBlock?: { timestamp?: bigint }) => {
    const parsedFirstActivity = firstBlock?.timestamp != null ? Number(firstBlock.timestamp) * 1000 : undefined;
    const parsedLatestActivity = lastBlock?.timestamp != null ? Number(lastBlock.timestamp) * 1000 : undefined;

    return {
        formattedFirstActivity: formatterUtils.formatDate(parsedFirstActivity, {
            format: DateFormat.YEAR_MONTH_DAY,
        }),
        formattedLatestActivity: formatterUtils.formatDate(parsedLatestActivity, {
            format: DateFormat.DURATION,
        }),
    };
};

export const DaoMemberDetailsPageClient: React.FC<IDaoMemberDetailsPageClientProps> = (props) => {
    const { address, daoId } = props;

    const { t } = useTranslations();

    const efpParams = { urlParams: { address } };
    const { data: efpStats } = useEfpStats(efpParams);

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const memberUrlParams = { address };
    const pluginAddress = dao?.plugins[0]?.address;
    const memberParams = {
        urlParams: memberUrlParams,
        queryParams: pluginAddress ? { daoId, pluginAddress } : undefined,
    };
    const { data: member } = useMember(memberParams);

    const memberStatsParams = dao?.plugins[0] ? { daoId, address, plugin: dao.plugins[0] } : undefined;
    const pluginStats = useSlotSingleFunction<IUsePluginMemberStatsParams, IPageHeaderStat[]>({
        params: memberStatsParams,
        slotId: GovernanceSlotId.GOVERNANCE_MEMBER_STATS,
        pluginId: dao?.plugins[0]?.interfaceType ?? '',
    });

    const { lastActivity, firstActivity } = member?.metrics ?? {};

    const { chainId, buildEntityUrl } = useDaoChain({ daoId });

    const firstBlockNumber = firstActivity != null ? BigInt(firstActivity) : undefined;
    const lastBlockNumber = lastActivity != null ? BigInt(lastActivity) : undefined;

    const { data: firstBlock } = useBlock({
        chainId,
        blockNumber: firstBlockNumber,
        query: { enabled: !!firstBlockNumber },
    });
    const { data: lastBlock } = useBlock({
        chainId,
        blockNumber: lastBlockNumber,
        query: { enabled: !!lastBlockNumber },
    });

    const { formattedFirstActivity, formattedLatestActivity } = formatMemberActivity(firstBlock, lastBlock);

    const stats = buildMemberStats(pluginStats, formattedLatestActivity, t);

    if (member == null || dao == null) {
        return null;
    }

    const { ens } = member;
    const truncatedAddress = addressUtils.truncateAddress(address);
    const memberName = ens ?? truncatedAddress;

    const addressUrl = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: address,
    });

    const pageBreadcrumbs = [
        {
            href: daoUtils.getDaoUrl(dao, 'members'),
            label: t('app.governance.daoMemberDetailsPage.header.breadcrumb.members'),
        },
        { label: memberName },
    ];

    const proposalsByMemberParams = {
        queryParams: {
            daoId,
            creatorAddress: address,
            pageSize: memberProposalsCount,
            sort: 'blockTimestamp',
        },
    };

    const votesByMemberParams = {
        queryParams: {
            daoId,
            address,
            includeInfo: true,
            pageSize: memberVotesCount,
            network: dao.network,
        },
    };

    const daosByMemberParams = {
        urlParams: { address },
        queryParams: {
            pageSize: memberDaosCount,
            excludeDaoId: daoId,
            sort: 'blockTimestamp',
            networks: networkUtils.getSupportedNetworks(),
        },
    };

    return (
        <>
            <Page.Header
                avatar={<MemberAvatar address={address} ensName={ens ?? undefined} size="2xl" />}
                breadcrumbs={pageBreadcrumbs}
                stats={stats}
                title={memberName}
            />
            <Page.Content>
                <Page.Main>
                    <Page.MainSection title={t('app.governance.daoMemberDetailsPage.main.votingActivity.title')}>
                        <VoteList daoId={daoId} initialParams={votesByMemberParams} />
                    </Page.MainSection>
                    <Page.MainSection title={t('app.governance.daoMemberDetailsPage.main.proposalCreation.title')}>
                        <DaoProposalList initialParams={proposalsByMemberParams} />
                    </Page.MainSection>
                    <Page.MainSection title={t('app.governance.daoMemberDetailsPage.main.daoMemberships.title')}>
                        <DaoList layoutClassNames="grid grid-cols-1" memberParams={daosByMemberParams} />
                    </Page.MainSection>
                </Page.Main>
                <Page.Aside>
                    <Page.AsideCard title={t('app.governance.daoMemberDetailsPage.aside.details.title')}>
                        <DefinitionList.Container>
                            <DefinitionList.Item
                                copyValue={address}
                                link={{ href: addressUrl }}
                                term={t('app.governance.daoMemberDetailsPage.aside.details.address')}
                            >
                                {truncatedAddress}
                            </DefinitionList.Item>
                            {ens && addressUrl && (
                                <DefinitionList.Item
                                    copyValue={ens}
                                    link={{ href: addressUrl }}
                                    term={t('app.governance.daoMemberDetailsPage.aside.details.ens')}
                                >
                                    {ens}
                                </DefinitionList.Item>
                            )}
                            <DefinitionList.Item term={t('app.governance.daoMemberDetailsPage.aside.details.firstActivity')}>
                                {formattedFirstActivity ?? '-'}
                            </DefinitionList.Item>
                        </DefinitionList.Container>
                    </Page.AsideCard>
                    {efpStats && (
                        <Page.AsideCard icon={EfpLogo as string} title={t('app.governance.daoMemberDetailsPage.aside.efpCard.title')}>
                            <EfpCard address={address} efpStats={efpStats} />
                        </Page.AsideCard>
                    )}
                </Page.Aside>
            </Page.Content>
        </>
    );
};
