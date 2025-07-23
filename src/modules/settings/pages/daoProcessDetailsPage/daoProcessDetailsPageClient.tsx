'use client';

import type { ICreateDaoFormData } from '@/modules/createDao/components/createDaoForm';
import {
    GovernanceBodyField,
    GovernanceStagesField,
    GovernanceType,
} from '@/modules/createDao/components/createProcessForm';
import { PermissionsDefinitionList } from '@/modules/governance/components/permissionsDefinitionList';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { useProposalListData } from '@/modules/governance/hooks/useProposalListData';
import type { IPermissionCheckGuardParams, IPermissionCheckGuardResult } from '@/modules/governance/types';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { Card, DateFormat, formatterUtils } from '@aragon/gov-ui-kit';
import { FormProvider, useForm } from 'react-hook-form';
import { DaoProcessDetailsInfo } from '../../components/daoProcessDetailsInfo';
import { daoProcessDetailsClientUtils } from './daoProcessDetailsClientUtils';

export interface IDaoProcessDetailsPageClientProps {
    /**
     * Slug of the process.
     */
    slug: string;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const DaoProcessDetailsPageClient: React.FC<IDaoProcessDetailsPageClientProps> = (props) => {
    const { slug, daoId } = props;

    const { t } = useTranslations();

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const { meta: plugin } = useDaoPlugins({
        daoId,
        slug: slug.toLowerCase(),
        type: PluginType.PROCESS,
        includeSubPlugins: true,
    })![0];

    const pluginFormData = daoProcessDetailsClientUtils.pluginToProcessFormData(plugin, dao?.plugins ?? []);

    const formMethods = useForm<ICreateDaoFormData>({ defaultValues: pluginFormData });

    const { proposalList, itemsCount } = useProposalListData({ queryParams: { daoId, pluginAddress: plugin.address } });

    const pageBreadcrumbs = [
        {
            href: daoUtils.getDaoUrl(dao, 'settings'),
            label: t('app.settings.daoProcessDetailsPage.header.breadcrumb.settings'),
        },
        { label: slug.toUpperCase() },
    ];

    const parsedLatestActivity =
        proposalList?.[0]?.blockTimestamp != null ? proposalList[0].blockTimestamp * 1000 : undefined;
    const formattedLatestActivity = formatterUtils.formatDate(parsedLatestActivity, { format: DateFormat.RELATIVE });

    const [value, unit] = formattedLatestActivity?.split(' ') ?? [undefined, undefined];
    const suffixLabel = t('app.settings.daoProcessDetailsPage.header.stats.latestActivityUnit', { unit });

    const stats = [
        {
            label: t('app.settings.daoProcessDetailsPage.header.stats.proposals'),
            value: itemsCount ?? '-',
        },
        {
            label: t('app.settings.daoProcessDetailsPage.header.stats.lastProposal'),
            value: value ?? '-',
            suffix: unit ? suffixLabel : undefined,
        },
    ];

    const { isLoading, settings } = useSlotSingleFunction<IPermissionCheckGuardParams, IPermissionCheckGuardResult>({
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        pluginId: plugin.interfaceType,
        params: { plugin, daoId, useConnectedUserInfo: false },
    }) ?? { hasPermission: true, isLoading: false, settings: [] };

    // const authorizedActions = useAllowedActions(queryParams: { conditionAddress: plugin.conditionAddress }, enabled: plugin.conditionAddress != null)

    return (
        <>
            <Page.Header
                breadcrumbs={pageBreadcrumbs}
                title={plugin.name}
                description={plugin.description}
                stats={stats}
            />
            <Page.Content>
                <Page.Main>
                    <Page.MainSection title={t('app.settings.daoProcessDetailsPage.section.governanceProcess')}>
                        <FormProvider {...formMethods}>
                            {pluginFormData.governanceType === GovernanceType.BASIC ? (
                                <GovernanceBodyField
                                    daoId={daoId}
                                    body={pluginFormData.body}
                                    fieldName="body"
                                    readOnly={true}
                                />
                            ) : (
                                <GovernanceStagesField daoId={daoId} readOnly={true} />
                            )}
                        </FormProvider>
                    </Page.MainSection>
                    <Page.MainSection title={t('app.settings.daoProcessDetailsPage.section.creationEligibility')}>
                        <Card className="px-6 py-3">
                            <PermissionsDefinitionList isLoading={isLoading} settings={settings} />
                        </Card>
                    </Page.MainSection>
                    <Page.MainSection title={t('app.settings.daoProcessDetailsPage.section.actions')}>
                        <Card className="p-6">
                            {/* {authorizedActions == null && (
                                <EmptyState
                                    isStacked={false}
                                    heading={t('app.settings.daoProcessDetailsPage.emptyState.heading')}
                                    description={t('app.settings.daoProcessDetailsPage.emptyState.description')}
                                    objectIllustration={{ object: 'SETTINGS' }}
                                />
                            )}
                            {authorizedActions != null && (
                                <DataList.Root entityLabel="">
                                    <DataList.Container SkeletonElement={SmartContractFunctionDataListItem.Skeleton}>
                                        {authorizedActions.map((action, index) => (
                                            <SmartContractFunctionDataListItem.Structure
                                                key={index}
                                                contractAddress={action.to}
                                                contractName={action.id}
                                                functionName={action.from}
                                                onRemove={() => alert('Function removed')}
                                            />
                                        ))}
                                    </DataList.Container>
                                </DataList.Root>
                            )} */}
                        </Card>
                    </Page.MainSection>
                </Page.Main>
                <Page.Aside>
                    <Page.AsideCard title={t('app.settings.daoProcessDetailsPage.section.details')}>
                        <DaoProcessDetailsInfo dao={dao!} plugin={plugin} />
                    </Page.AsideCard>
                </Page.Aside>
            </Page.Content>
        </>
    );
};
