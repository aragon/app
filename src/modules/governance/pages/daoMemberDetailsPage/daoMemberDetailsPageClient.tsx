'use client';

import { useDao } from '@/shared/api/daoService';

import { useDaoListByMemberAddress } from '@/shared/api/daoService/queries/useDaoListByMemberAddress';
import { useProposalListByMember } from '@/shared/api/daoService/queries/useProposalListByMemberAddress/useProposalListByMemberAddress';
import { Page } from '@/shared/components/page';
import { type IPageHeaderStat } from '@/shared/components/page/pageHeader/pageHeaderStat';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useCurrentUrl } from '@/shared/hooks/useCurrentUrl';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import { useSlotFunction } from '@/shared/hooks/useSlotFunction';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import {
    addressUtils,
    ChainEntityType,
    clipboardUtils,
    DaoDataListItem,
    DataListContainer,
    DataListRoot,
    DefinitionList,
    Dropdown,
    IconType,
    Link,
    MemberAvatar,
    ProposalDataListItem,
    ProposalStatus,
    useBlockExplorer,
} from '@aragon/ods';
import { useMemo } from 'react';
import { useMember } from '../../api/governanceService';
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

export const DaoMemberDetailsPageClient: React.FC<IDaoMemberDetailsPageClientProps> = (props) => {
    const { address, daoId } = props;

    const { t } = useTranslations();
    const { getBlockExplorer, buildEntityUrl } = useBlockExplorer();
    const pageUrl = useCurrentUrl();

    const memberAddressParams = { address };
    const daoIdParams = { daoId };

    const useMemberUrlQueryParams = { urlParams: memberAddressParams, queryParams: daoIdParams };

    const useDaoListByMemberUrlParams = { urlParams: memberAddressParams };

    const useProposalsByMemberParams = { daoId, creatorAddress: address };
    const useProposalsByMemberQueryParams = { queryParams: useProposalsByMemberParams };

    const { data: member } = useMember(useMemberUrlQueryParams);
    const { data: membersDaos } = useDaoListByMemberAddress(useDaoListByMemberUrlParams);

    const daoListByMember = membersDaos?.pages.flatMap((page) => page.data);
    const otherDaosOfMember = useMemo(() => {
        return daoListByMember?.filter((memberDao) => memberDao.id !== daoId);
    }, [daoListByMember, daoId]);

    const { data: createdProposals } = useProposalListByMember(useProposalsByMemberQueryParams);

    const proposalListByMember = createdProposals?.pages.flatMap((page) => page.data);

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const pluginIds = useDaoPluginIds(daoId);
    const memberStatsParams = { daoId, address };
    const pluginStats = useSlotFunction<IPageHeaderStat[]>({
        params: memberStatsParams,
        slotId: GovernanceSlotId.GOVERNANCE_MEMBER_STATS,
        pluginIds,
    });

    // TODO: Display real last activity date (APP-3405)
    const stats = [
        ...(pluginStats ?? []),
        { label: t('app.governance.daoMemberDetailsPage.header.stat.latestActivity'), value: 3, suffix: 'days ago' },
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
                        {/* <DataListRoot entityLabel="MOCK">
                            {member.metrics.delegateReceivedCount > 0 && (
                                <DataListContainer SkeletonElement={MemberDataListItem.Skeleton}>
                                    {delegators?.map((delegator) => {
                                        <MemberDataListItem.Structure
                                            address={address}
                                            ensName={delegator.ens}
                                            avatarSrc={delegator.avatar}
                                        />;
                                    })}
                                </DataListContainer>
                            )}
                        </DataListRoot> */}
                    </Page.Section>
                    {proposalListByMember && (
                        <Page.Section title={t('app.governance.daoMemberDetailsPage.main.proposalsCreation.title')}>
                            <DataListRoot entityLabel="MOCK ENTITY">
                                <DataListContainer SkeletonElement={ProposalDataListItem.Skeleton}>
                                    {proposalListByMember?.map((proposal) => (
                                        <ProposalDataListItem.Structure
                                            className="min-w-0"
                                            key={proposal.id}
                                            title={proposal.title}
                                            summary={proposal.summary}
                                            date={proposal.endDate * 1000}
                                            href={`/dao/${daoId}/proposals/${proposal.id}`}
                                            status={ProposalStatus.ACTIVE}
                                            type="majorityVoting"
                                            publisher={{
                                                address: proposal.creatorAddress,
                                                link: `members/${proposal.creatorAddress}`,
                                            }}
                                        />
                                    ))}
                                </DataListContainer>
                            </DataListRoot>
                        </Page.Section>
                    )}
                    {otherDaosOfMember && (
                        <Page.Section title={t('app.governance.daoMemberDetailsPage.main.otherDaos.title')}>
                            <DataListRoot entityLabel="Daos">
                                <DataListContainer SkeletonElement={DaoDataListItem.Skeleton}>
                                    {otherDaosOfMember.map((dao) => (
                                        <DaoDataListItem.Structure
                                            key={dao.id}
                                            href={`/dao/${dao.id}/dashboard`}
                                            ens={daoUtils.getDaoEns(dao)}
                                            address={dao.address}
                                            name={dao.name}
                                            description={dao.description}
                                            network={networkDefinitions[dao.network].name}
                                            logoSrc={ipfsUtils.cidToSrc(dao.avatar)}
                                            plugin={dao.plugins.map((plugin) => plugin.subdomain).join(',')}
                                        />
                                    ))}
                                </DataListContainer>
                            </DataListRoot>
                        </Page.Section>
                    )}
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
                                {/* TODO: Display real first activity date (APP-3405) */}
                                <Link iconRight={IconType.LINK_EXTERNAL} href={addressUrl} target="_blank">
                                    October 23, 2024
                                </Link>
                            </DefinitionList.Item>
                        </DefinitionList.Container>
                    </Page.Section>
                </Page.Aside>
            </Page.Content>
        </>
    );
};
