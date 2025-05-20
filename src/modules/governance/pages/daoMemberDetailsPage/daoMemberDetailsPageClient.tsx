'use client';

import { DaoList } from '@/modules/explore/components/daoList';
import { useEfpStats } from '@/modules/governance/api/efpService';
import { EfpCard } from '@/modules/governance/components/efpCard';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { type IPageHeaderStat } from '@/shared/components/page/pageHeader/pageHeaderStat';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import {
    addressUtils,
    ChainEntityType,
    Clipboard,
    DateFormat,
    DefinitionList,
    formatterUtils,
    Link,
    MemberAvatar,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
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

export const DaoMemberDetailsPageClient: React.FC<IDaoMemberDetailsPageClientProps> = (props) => {
    const { address, daoId } = props;

    const { t } = useTranslations();
    const { buildEntityUrl } = useBlockExplorer();

    const memberUrlParams = { address };
    const memberQueryParams = { daoId };
    const memberParams = { urlParams: memberUrlParams, queryParams: memberQueryParams };
    const { data: member } = useMember(memberParams);

    const efpParams = { urlParams: { address } };
    const { data: efpStats } = useEfpStats(efpParams);

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const memberStatsParams = { daoId, address, plugin: dao!.plugins[0] };
    const pluginStats = useSlotSingleFunction<IUsePluginMemberStatsParams, IPageHeaderStat[]>({
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

    const [value, unit] = formattedLatestActivity?.split(' ') ?? [undefined, undefined];

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

    const { id: chainId } = networkDefinitions[dao.network];
    const addressUrl = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: address, chainId });

    const pageBreadcrumbs = [
        {
            href: daoUtils.getDaoUrl(dao, 'members'),
            label: t('app.governance.daoMemberDetailsPage.header.breadcrumb.members'),
        },
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
            />
            <Page.Content>
                <Page.Main>
                    <Page.MainSection title={t('app.governance.daoMemberDetailsPage.main.votingActivity.title')}>
                        <VoteList initialParams={votesByMemberParams} daoId={daoId} />
                    </Page.MainSection>
                    <Page.MainSection title={t('app.governance.daoMemberDetailsPage.main.proposalCreation.title')}>
                        <DaoProposalList.Container initialParams={proposalsByMemberParams} />
                    </Page.MainSection>
                    <Page.MainSection title={t('app.governance.daoMemberDetailsPage.main.daoMemberships.title')}>
                        <DaoList daoListByMemberParams={daoListByMemberParams} layoutClassNames="grid grid-cols-1" />
                    </Page.MainSection>
                </Page.Main>
                <Page.Aside>
                    <Page.AsideCard title={t('app.governance.daoMemberDetailsPage.aside.details.title')}>
                        <DefinitionList.Container>
                            <DefinitionList.Item term={t('app.governance.daoMemberDetailsPage.aside.details.address')}>
                                <Clipboard copyValue={address}>
                                    <Link href={addressUrl} isExternal={true}>
                                        {truncatedAddress}
                                    </Link>
                                </Clipboard>
                            </DefinitionList.Item>
                            {ens && addressUrl && (
                                <DefinitionList.Item term={t('app.governance.daoMemberDetailsPage.aside.details.ens')}>
                                    <Clipboard copyValue={ens}>
                                        <Link href={addressUrl} isExternal={true}>
                                            {ens}
                                        </Link>
                                    </Clipboard>
                                </DefinitionList.Item>
                            )}
                            <DefinitionList.Item
                                term={t('app.governance.daoMemberDetailsPage.aside.details.firstActivity')}
                            >
                                {formattedFirstActivity ?? '-'}
                            </DefinitionList.Item>
                        </DefinitionList.Container>
                    </Page.AsideCard>
                    {efpStats && (
                        <Page.AsideCard
                            title={t('app.governance.daoMemberDetailsPage.aside.efpCard.title')}
                            icon={EfpLogo as string}
                        >
                            <EfpCard efpStats={efpStats} address={address} />
                        </Page.AsideCard>
                    )}
                </Page.Aside>
            </Page.Content>
        </>
    );
};
