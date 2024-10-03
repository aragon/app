'use client';

import { DaoList } from '@/modules/explore/components/daoList';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { type IPageHeaderStat } from '@/shared/components/page/pageHeader/pageHeaderStat';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useCurrentUrl } from '@/shared/hooks/useCurrentUrl';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import {
    addressUtils,
    ChainEntityType,
    clipboardUtils,
    DateFormat,
    DefinitionList,
    Dropdown,
    formatterUtils,
    IconType,
    Link,
    MemberAvatar,
    useBlockExplorer,
} from '@aragon/ods';
import { useMember } from '../../api/governanceService';
import { DaoProposalList } from '../../components/daoProposalList';
import { VoteList } from '../../components/voteList';
import { GovernanceSlotId } from '../../constants/moduleSlots';

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

export const DaoMemberDetailsPageClient: React.FC<IDaoMemberDetailsPageClientProps> = (props) => {
    const { address, daoId } = props;

    const { t } = useTranslations();
    const { getBlockExplorer, buildEntityUrl } = useBlockExplorer();
    const pageUrl = useCurrentUrl();

    const memberUrlParams = { address };
    const memberQueryParams = { daoId };
    const memberParams = { urlParams: memberUrlParams, queryParams: memberQueryParams };
    const { data: member } = useMember(memberParams);

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const memberStatsParams = { daoId, address, plugin: dao?.plugins[0] };
    const pluginStats = useSlotSingleFunction<IPageHeaderStat[]>({
        params: memberStatsParams,
        slotId: GovernanceSlotId.GOVERNANCE_MEMBER_STATS,
        pluginId: dao?.plugins[0]?.subdomain ?? '',
    });

    const { lastActivity, firstActivity } = member?.metrics ?? {};

    const parsedLatestActivity = lastActivity != null ? lastActivity * 1000 : undefined;
    const formattedLatestActivity = formatterUtils.formatDate(parsedLatestActivity, { format: DateFormat.DURATION });

    const parsedFirstActivity = firstActivity != null ? firstActivity * 1000 : undefined;
    const formattedFirstActivity = formatterUtils.formatDate(parsedFirstActivity, {
        format: DateFormat.YEAR_MONTH_DAY,
    });

    const [value, unit] = formattedLatestActivity?.split(' ') ?? [];

    const suffixLabel = t('app.governance.daoMemberDetailsPage.header.stat.latestActivityUnit', { unit: unit });

    const stats = [
        ...(pluginStats ?? []),
        {
            label: t('app.governance.daoMemberDetailsPage.header.stat.latestActivity'),
            value: value ?? '-',
            suffix: unit ? suffixLabel : undefined,
        },
    ];

    if (member == null || dao == null) {
        return null;
    }

    const { ens } = member;
    const truncatedAddress = addressUtils.truncateAddress(address);
    const memberName = ens ?? truncatedAddress;

    const { chainId } = networkDefinitions[dao.network];
    const addressUrl = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: address, chainId });
    const blockExplorer = getBlockExplorer(chainId);

    const pageBreadcrumbs = [
        { href: `/dao/${daoId}/members`, label: t('app.governance.daoMemberDetailsPage.header.breadcrumb.members') },
        { label: memberName },
    ];

    const proposalsByMemberParams = { queryParams: { daoId, creatorAddress: address, pageSize: memberProposalsCount } };

    const votesByMemberParams = { queryParams: { daoId, address, includeInfo: true, pageSize: memberVotesCount } };

    const daoListByMemberParams = {
        urlParams: { address },
        queryParams: { pageSize: memberDaosCount, excludeDaoId: daoId },
    };

    return (
        <>
            <Page.Header
                breadcrumbs={pageBreadcrumbs}
                stats={stats}
                title={memberName}
                avatar={<MemberAvatar size="2xl" ensName={ens ?? undefined} address={address} />}
            >
                <div className="flex flex-row gap-4">
                    <Dropdown.Container
                        contentClassNames="max-w-52"
                        constrainContentWidth={false}
                        size="md"
                        label={memberName}
                    >
                        {ens && (
                            <Dropdown.Item icon={IconType.COPY} onClick={() => clipboardUtils.copy(ens)}>
                                {ens}
                            </Dropdown.Item>
                        )}
                        <Dropdown.Item icon={IconType.COPY} onClick={() => clipboardUtils.copy(address)}>
                            {truncatedAddress}
                        </Dropdown.Item>
                        <Dropdown.Item icon={IconType.COPY} onClick={() => clipboardUtils.copy(pageUrl)}>
                            {pageUrl}
                        </Dropdown.Item>
                        {addressUrl && blockExplorer && (
                            <Dropdown.Item icon={IconType.LINK_EXTERNAL} href={addressUrl} target="_blank">
                                {blockExplorer.name}
                            </Dropdown.Item>
                        )}
                    </Dropdown.Container>
                </div>
            </Page.Header>
            <Page.Content>
                <Page.Main>
                    <Page.Section title={t('app.governance.daoMemberDetailsPage.main.votingActivity.title')}>
                        <VoteList initialParams={votesByMemberParams} daoId={daoId} />
                    </Page.Section>
                    <Page.Section title={t('app.governance.daoMemberDetailsPage.main.proposalCreation.title')}>
                        <DaoProposalList initialParams={proposalsByMemberParams} />
                    </Page.Section>
                    <Page.Section title={t('app.governance.daoMemberDetailsPage.main.daoMemberships.title')}>
                        <DaoList daoListByMemberParams={daoListByMemberParams} layoutClassNames="grid grid-cols-1" />
                    </Page.Section>
                </Page.Main>
                <Page.Aside>
                    <Page.Section title={t('app.governance.daoMemberDetailsPage.aside.details.title')} inset={false}>
                        <DefinitionList.Container>
                            <DefinitionList.Item term={t('app.governance.daoMemberDetailsPage.aside.details.address')}>
                                {addressUrl && (
                                    <Link iconRight={IconType.LINK_EXTERNAL} href={addressUrl} target="_blank">
                                        {truncatedAddress}
                                    </Link>
                                )}
                            </DefinitionList.Item>
                            {ens && addressUrl && (
                                <DefinitionList.Item term={t('app.governance.daoMemberDetailsPage.aside.details.ens')}>
                                    <Link iconRight={IconType.LINK_EXTERNAL} href={addressUrl} target="_blank">
                                        {ens}
                                    </Link>
                                </DefinitionList.Item>
                            )}
                            <DefinitionList.Item
                                term={t('app.governance.daoMemberDetailsPage.aside.details.firstActivity')}
                            >
                                {formattedFirstActivity ?? '-'}
                            </DefinitionList.Item>
                        </DefinitionList.Container>
                    </Page.Section>
                </Page.Aside>
            </Page.Content>
        </>
    );
};
