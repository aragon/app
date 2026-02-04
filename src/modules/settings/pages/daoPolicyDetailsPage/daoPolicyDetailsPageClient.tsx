'use client';

import {
    AvatarIcon,
    Card,
    ChainEntityType,
    DataList,
    DefinitionList,
    IconType,
} from '@aragon/gov-ui-kit';
import {
    type IDaoPolicy,
    type Network,
    PolicyStrategyType,
    useDao,
    useDaoPolicies,
} from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { daoUtils } from '@/shared/utils/daoUtils';
import { DaoPluginInfoMetadata } from '../../components/daoPluginInfo/daoPluginInfoMetadata';
import { DaoPolicyDetailsInfo } from '../../components/daoPolicyDetailsInfo';
import { daoPolicyDetailsClientUtils } from './daoPolicyDetailsClientUtils';

export interface IDaoPolicyDetailsPageClientProps {
    /**
     * Address of the policy.
     */
    address: string;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const DaoPolicyDetailsPageClient: React.FC<
    IDaoPolicyDetailsPageClientProps
> = (props) => {
    const { address, daoId } = props;

    const { t } = useTranslations();

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const { buildEntityUrl } = useDaoChain({ network: dao?.network });

    const { data: policies = [] } = useDaoPolicies(
        {
            urlParams: {
                network: dao?.network as Network,
                daoAddress: dao?.address as string,
            },
        },
        { enabled: dao != null },
    );

    const policy = policies.find(
        (p) => p.address.toLowerCase() === address.toLowerCase(),
    );

    if (!policy || !dao) {
        return null;
    }

    const policyName = daoPolicyDetailsClientUtils.getPolicyName(policy, t);
    const policyKey = policy.policyKey?.toUpperCase();

    const pageBreadcrumbs = [
        {
            href: daoUtils.getDaoUrl(dao, 'settings'),
            label: t(
                'app.settings.daoPolicyDetailsPage.header.breadcrumb.settings',
            ),
        },
        { label: policyKey ?? policyName },
    ];

    const isMultiDispatch =
        policy.strategy.type === PolicyStrategyType.MULTI_DISPATCH;
    const subRouters = policy.strategy.subRouters ?? [];

    // Find sub-router policies
    const subRouterPolicies = subRouters
        .map((routerAddress) =>
            policies.find(
                (p) => p.address.toLowerCase() === routerAddress.toLowerCase(),
            ),
        )
        .filter((p): p is IDaoPolicy => p != null);

    const policySettings = daoPolicyDetailsClientUtils.getPolicySettingsForCard(
        {
            policy,
            dao,
            t,
        },
    );

    const getAddressLink = (addressValue: string) =>
        buildEntityUrl({
            type: ChainEntityType.ADDRESS,
            id: addressValue,
        });

    return (
        <>
            <Page.Header
                breadcrumbs={pageBreadcrumbs}
                description={policy.description}
                title={policyName}
            />
            <Page.Content>
                <Page.Main>
                    <Page.MainSection
                        title={t(
                            'app.settings.daoPolicyDetailsPage.section.policySettings',
                        )}
                    >
                        <Card className="px-6 py-3">
                            <DefinitionList.Container>
                                {policySettings.map((setting) => (
                                    <DefinitionList.Item
                                        copyValue={setting.copyValue}
                                        description={setting.description}
                                        key={setting.term}
                                        link={
                                            setting.address
                                                ? {
                                                      href: getAddressLink(
                                                          setting.address,
                                                      ),
                                                      isExternal: true,
                                                  }
                                                : undefined
                                        }
                                        term={setting.term}
                                    >
                                        {setting.value}
                                    </DefinitionList.Item>
                                ))}
                            </DefinitionList.Container>
                        </Card>
                        {isMultiDispatch && subRouterPolicies.length > 0 && (
                            <DataList.Root entityLabel="sub-routers">
                                <DataList.Container>
                                    {subRouterPolicies.map(
                                        (subPolicy, index) => (
                                            <SubRouterCard
                                                dao={dao}
                                                index={index + 1}
                                                key={subPolicy.address}
                                                policy={subPolicy}
                                                total={subRouterPolicies.length}
                                            />
                                        ),
                                    )}
                                </DataList.Container>
                            </DataList.Root>
                        )}
                    </Page.MainSection>
                </Page.Main>
                <Page.Aside>
                    <Page.AsideCard
                        title={t(
                            'app.settings.daoPolicyDetailsPage.section.details',
                        )}
                    >
                        <DaoPolicyDetailsInfo dao={dao} policy={policy} />
                    </Page.AsideCard>
                    {policy.links && policy.links.length > 0 && (
                        <Page.AsideCard
                            title={t(
                                'app.settings.daoPolicyDetailsPage.section.resources',
                            )}
                        >
                            <DaoPluginInfoMetadata links={policy.links} />
                        </Page.AsideCard>
                    )}
                </Page.Aside>
            </Page.Content>
        </>
    );
};

interface ISubRouterCardProps {
    policy: IDaoPolicy;
    index: number;
    total: number;
    dao: ReturnType<typeof useDao>['data'];
}

const SubRouterCard: React.FC<ISubRouterCardProps> = (props) => {
    const { policy, index, total, dao } = props;

    const { t } = useTranslations();
    const policyName = daoPolicyDetailsClientUtils.getPolicyName(policy, t);
    const policyKey = policy.policyKey?.toUpperCase();

    const href = daoUtils.getDaoUrl(
        dao,
        `settings/automations/${policy.address}`,
    );

    return (
        <DataList.Item
            className="px-4 py-3 md:px-6 md:py-4"
            href={href}
            target="_blank"
        >
            <div className="flex w-full items-center justify-between">
                <div className="flex items-baseline gap-2">
                    <span className="font-normal text-base text-neutral-800 md:text-lg">
                        {policyName}
                    </span>
                    {policyKey && (
                        <span className="font-normal text-base text-neutral-500 md:text-lg">
                            {policyKey}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-neutral-500 text-sm md:text-base">
                        {index} of {total}
                    </span>
                    <AvatarIcon
                        icon={IconType.LINK_EXTERNAL}
                        size="sm"
                        variant="primary"
                    />
                </div>
            </div>
        </DataList.Item>
    );
};
