'use client';

import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { type IPageHeaderStat } from '@/shared/components/page/pageHeader/pageHeaderStat';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import { useSlotFunction } from '@/shared/hooks/useSlotFunction';
import {
    addressUtils,
    ChainEntityType,
    clipboardUtils,
    DefinitionList,
    Dropdown,
    IconType,
    Link,
    MemberAvatar,
    ssrUtils,
    useBlockExplorer,
} from '@aragon/ods';
import { useChains } from 'wagmi';
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
    const { getChainEntityUrl } = useBlockExplorer();
    const chains = useChains();

    const memberUrlParams = { address };
    const memberQueryParams = { daoId };
    const memberParams = { urlParams: memberUrlParams, queryParams: memberQueryParams };
    const { data: member } = useMember(memberParams);

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const pageUrl = ssrUtils.isServer() ? '' : window.location.href.replace(/(http(s?)):\/\//, '');

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
        { label: t('app.governance.daoMemberPage.header.stat.latestActivity'), value: 3, suffix: 'days ago' },
    ];

    if (member == null || dao == null) {
        return null;
    }

    const { chainId } = networkDefinitions[dao.network];
    const chain = chains.find((chain) => chain.id === chainId);
    const blockExplorerName = chain?.blockExplorers?.default.name;

    const { ens } = member;
    const truncatedAddress = addressUtils.truncateAddress(address);
    const memberName = ens ?? truncatedAddress;

    const addressUrl = getChainEntityUrl({
        type: ChainEntityType.ADDRESS,
        chainId: networkDefinitions[dao.network].chainId,
        id: address,
    });

    const pageBreadcrumbs = [
        { href: `/dao/${daoId}/members`, label: t('app.governance.daoMemberPage.header.breadcrumb.members') },
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
                        {addressUrl && blockExplorerName && (
                            <Dropdown.Item icon={IconType.LINK_EXTERNAL} href={addressUrl} target="_blank">
                                {blockExplorerName}
                            </Dropdown.Item>
                        )}
                    </Dropdown.Container>
                </div>
            </Page.Header>
            <Page.Content>
                <Page.Main />
                <Page.Aside>
                    <Page.Section title={t('app.governance.daoMemberPage.aside.details.title')} inset={false}>
                        <DefinitionList.Container>
                            <DefinitionList.Item term={t('app.governance.daoMemberPage.aside.details.address')}>
                                {addressUrl && (
                                    <Link iconRight={IconType.LINK_EXTERNAL} href={addressUrl} target="_blank">
                                        {truncatedAddress}
                                    </Link>
                                )}
                            </DefinitionList.Item>
                            {ens && addressUrl && (
                                <DefinitionList.Item term={t('app.governance.daoMemberPage.aside.details.ens')}>
                                    <Link iconRight={IconType.LINK_EXTERNAL} href={addressUrl} target="_blank">
                                        {ens}
                                    </Link>
                                </DefinitionList.Item>
                            )}
                            <DefinitionList.Item term={t('app.governance.daoMemberPage.aside.details.firstActivity')}>
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
