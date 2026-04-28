'use client';

import {
    addressUtils,
    ChainEntityType,
    DateFormat,
    DefinitionList,
    formatterUtils,
    MemberAvatar,
} from '@aragon/gov-ui-kit';
import { useBlock } from 'wagmi';
import {
    ENS_RECORD_KEYS,
    useEnsAvatar,
    useEnsName,
    useEnsRecords,
} from '@/modules/ens';
import { DaoList } from '@/modules/explore/components/daoList';
import { useEfpStats } from '@/modules/governance/api/efpService';
import { EfpCard } from '@/modules/governance/components/efpCard';
import { MemberLinksCard } from '@/modules/governance/components/memberLinksCard';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import type { IPageHeaderStat } from '@/shared/components/page/pageHeader/pageHeaderStat';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { bigIntUtils } from '@/shared/utils/bigIntUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import { networkUtils } from '@/shared/utils/networkUtils';
import EfpLogo from '../../../../assets/images/efp-logo.svg';
import { useMember } from '../../api/governanceService';
import { DaoProposalList } from '../../components/daoProposalList';
import { DelegationSection } from '../../components/delegationSection';
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
    /**
     * Address of the body plugin resolved by the server component.
     */
    pluginAddress: string;
    /**
     * Address of the governance token. Required to include voting power in the response.
     */
    tokenAddress?: string;
    /**
     * Network of the DAO.
     */
    network?: string;
}

const memberProposalsCount = 3;
const memberVotesCount = 5;
const memberDaosCount = 3;

export const DaoMemberDetailsPageClient: React.FC<
    IDaoMemberDetailsPageClientProps
> = (props) => {
    const { address, daoId, network, pluginAddress, tokenAddress } = props;

    const { t } = useTranslations();

    const efpParams = { urlParams: { address } };
    const { data: efpStats } = useEfpStats(efpParams);

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const bodyPlugins = useDaoPlugins({
        daoId,
        pluginAddress,
        includeLinkedAccounts: true,
        includeSubPlugins: true,
    });
    const bodyPlugin = bodyPlugins?.[0]?.meta;

    const memberUrlParams = { address };
    const memberQueryParams = { daoId, pluginAddress, tokenAddress, network };
    const memberParams = {
        urlParams: memberUrlParams,
        queryParams: memberQueryParams,
    };
    const { data: member } = useMember(memberParams);

    const memberStatsParams = {
        daoId,
        address,
        plugin: bodyPlugin!,
    };
    const pluginStats = useSlotSingleFunction<
        IUsePluginMemberStatsParams,
        IPageHeaderStat[]
    >({
        params: memberStatsParams,
        slotId: GovernanceSlotId.GOVERNANCE_MEMBER_STATS,
        pluginId: bodyPlugin?.interfaceType ?? '',
    });

    const { lastActive } = member ?? {};
    const { firstActivity } = member?.metrics ?? {};

    const { chainId, buildEntityUrl } = useDaoChain({ daoId });

    const firstBlockNumber =
        firstActivity != null
            ? bigIntUtils.safeParse(firstActivity)
            : undefined;
    const lastBlockNumber =
        lastActive != null ? bigIntUtils.safeParse(lastActive) : undefined;

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

    const parsedFirstActivity =
        firstBlock?.timestamp != null
            ? Number(firstBlock.timestamp) * 1000
            : undefined;
    const parsedLatestActivity =
        lastBlock?.timestamp != null
            ? Number(lastBlock.timestamp) * 1000
            : undefined;

    const formattedFirstActivity = formatterUtils.formatDate(
        parsedFirstActivity,
        {
            format: DateFormat.YEAR_MONTH_DAY,
        },
    );
    const formattedLatestActivity = formatterUtils.formatDate(
        parsedLatestActivity,
        {
            format: DateFormat.DURATION,
        },
    );

    const [value, unit] = formattedLatestActivity?.split(' ') ?? [
        undefined,
        undefined,
    ];

    const suffixLabel = t(
        'app.governance.daoMemberDetailsPage.aside.details.latestActivityUnit',
        { unit },
    );

    const stats = pluginStats ?? [];

    const { data: ensName } = useEnsName(address);
    const { data: ensAvatar } = useEnsAvatar(ensName);
    const { data: ensRecords } = useEnsRecords(ensName);
    const memberLinks = {
        github: ensRecords?.[ENS_RECORD_KEYS.github],
        twitter: ensRecords?.[ENS_RECORD_KEYS.twitter],
        url: ensRecords?.[ENS_RECORD_KEYS.url],
    };

    if (member == null || dao == null || bodyPlugin == null) {
        return null;
    }

    const truncatedAddress = addressUtils.truncateAddress(address);
    const memberName = ensName ?? truncatedAddress;

    const addressUrl = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: address,
    });

    const pageBreadcrumbs = [
        {
            href: daoUtils.getDaoUrl(dao, 'members'),
            label: t(
                'app.governance.daoMemberDetailsPage.header.breadcrumb.members',
            ),
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
                avatar={
                    <MemberAvatar
                        address={address}
                        avatarSrc={ensAvatar ?? undefined}
                        ensName={ensName ?? undefined}
                        size="2xl"
                    />
                }
                breadcrumbs={pageBreadcrumbs}
                description={ensRecords?.description ?? undefined}
                stats={stats}
                title={memberName}
            />
            <Page.Content>
                <Page.Main>
                    <DelegationSection
                        daoId={daoId}
                        member={member}
                        title={t(
                            'app.governance.daoMemberDetailsPage.main.delegation.title',
                        )}
                    />

                    <Page.MainSection
                        title={t(
                            'app.governance.daoMemberDetailsPage.main.votingActivity.title',
                        )}
                    >
                        <VoteList
                            daoId={daoId}
                            initialParams={votesByMemberParams}
                        />
                    </Page.MainSection>
                    <Page.MainSection
                        title={t(
                            'app.governance.daoMemberDetailsPage.main.proposalCreation.title',
                        )}
                    >
                        <DaoProposalList
                            initialParams={proposalsByMemberParams}
                        />
                    </Page.MainSection>
                    <Page.MainSection
                        title={t(
                            'app.governance.daoMemberDetailsPage.main.daoMemberships.title',
                        )}
                    >
                        <DaoList
                            layoutClassNames="grid grid-cols-1"
                            memberParams={daosByMemberParams}
                        />
                    </Page.MainSection>
                </Page.Main>
                <Page.Aside>
                    <Page.AsideCard
                        title={t(
                            'app.governance.daoMemberDetailsPage.aside.details.title',
                        )}
                    >
                        <DefinitionList.Container>
                            <DefinitionList.Item
                                copyValue={address}
                                link={{ href: addressUrl }}
                                term={t(
                                    'app.governance.daoMemberDetailsPage.aside.details.address',
                                )}
                            >
                                {truncatedAddress}
                            </DefinitionList.Item>
                            {ensName && addressUrl && (
                                <DefinitionList.Item
                                    copyValue={ensName}
                                    link={{ href: addressUrl }}
                                    term={t(
                                        'app.governance.daoMemberDetailsPage.aside.details.ens',
                                    )}
                                >
                                    {ensName}
                                </DefinitionList.Item>
                            )}
                            <DefinitionList.Item
                                term={t(
                                    'app.governance.daoMemberDetailsPage.aside.details.firstActivity',
                                )}
                            >
                                {formattedFirstActivity ?? '-'}
                            </DefinitionList.Item>
                            <DefinitionList.Item
                                term={t(
                                    'app.governance.daoMemberDetailsPage.aside.details.latestActivity',
                                )}
                            >
                                {value && unit
                                    ? `${value} ${suffixLabel}`
                                    : '-'}
                            </DefinitionList.Item>
                        </DefinitionList.Container>
                    </Page.AsideCard>
                    {(memberLinks.url ||
                        memberLinks.twitter ||
                        memberLinks.github) && (
                        <Page.AsideCard
                            title={t(
                                'app.governance.daoMemberDetailsPage.aside.links.title',
                            )}
                        >
                            <MemberLinksCard
                                github={memberLinks.github}
                                twitter={memberLinks.twitter}
                                url={memberLinks.url}
                            />
                        </Page.AsideCard>
                    )}
                    {efpStats && (
                        <Page.AsideCard
                            icon={EfpLogo as string}
                            title={t(
                                'app.governance.daoMemberDetailsPage.aside.efpCard.title',
                            )}
                        >
                            <EfpCard address={address} efpStats={efpStats} />
                        </Page.AsideCard>
                    )}
                </Page.Aside>
            </Page.Content>
        </>
    );
};
