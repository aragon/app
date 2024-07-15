'use client';

import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { type IPageHeaderStat } from '@/shared/components/page/pageHeader/pageHeaderStat';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
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

export interface IDaoMemberPageClientProps {
    /**
     * The DAO ID.
     */
    daoId: string;
    /**
     * Address of the DAO member.
     */
    address: string;
}

export const DaoMemberPageClient: React.FC<IDaoMemberPageClientProps> = (props) => {
    const { address, daoId } = props;

    const { t } = useTranslations();

    const memberUrlParams = { address };
    const memberQueryParams = { daoId };
    const memberParams = {
        urlParams: memberUrlParams,
        queryParams: memberQueryParams,
    };
    const { data: member } = useMember(memberParams);

    const { getChainEntityUrl } = useBlockExplorer();

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const pageUrl = ssrUtils.isServer() ? '' : window.location.href.replace(/(http(s?)):\/\//, '');

    const pluginIds = useDaoPluginIds(daoId);
    const memberStatsParams = {
        daoId,
        address,
    };
    const pluginSpecificStats: IPageHeaderStat[] =
        pluginRegistryUtils.getSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_MEMBER_STATS,
            pluginId: pluginIds[0],
        })?.(memberStatsParams) ?? [];

    const chains = useChains();

    const stats = [
        ...pluginSpecificStats,
        {
            // TODO: Display real last activity date (APP-3405)
            label: t('app.governance.daoMemberPage.header.stat.latestActivity'),
            value: 3,
            suffix: 'days ago',
        },
    ];

    if (member == null || dao == null) {
        return null;
    }

    const { chainId } = networkDefinitions[dao.network];
    const chain = chains.find((chain) => chain.id === chainId);
    const blockExplorerName = chain?.blockExplorers?.default.name;

    const truncatedAddress = addressUtils.truncateAddress(address);
    const { ens } = member;
    const memberName = ens ?? truncatedAddress;

    const addressUrl = getChainEntityUrl({
        type: ChainEntityType.ADDRESS,
        chainId: networkDefinitions[dao.network].chainId,
        id: address,
    });

    return (
        <>
            <Page.Header
                breadcrumbs={[
                    {
                        href: `/dao/${daoId}/members`,
                        label: 'Members',
                    },
                    {
                        label: memberName,
                    },
                ]}
                stats={stats}
                title={memberName}
                avatar={ens && <MemberAvatar size="2xl" ensName={ens} address={address} />}
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
                                {
                                    // TODO: Display real first activity date (APP-3405)
                                }
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
