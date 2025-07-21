'use client';

import type { ICreateDaoFormData } from '@/modules/createDao/components/createDaoForm';
import { GovernanceType } from '@/modules/createDao/components/createProcessForm';
import { GovernanceBodyField } from '@/modules/createDao/components/createProcessForm/createProcessFormGovernance/fields/governanceBodyField';
import { GovernanceStagesField } from '@/modules/createDao/components/createProcessForm/createProcessFormGovernance/fields/governanceStagesField';
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
import { Card, DateFormat, DefinitionList, formatterUtils } from '@aragon/gov-ui-kit';
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
        proposalList?.[0].blockTimestamp != null ? proposalList[0].blockTimestamp * 1000 : undefined;
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

    const checkPermissions = useSlotSingleFunction<IPermissionCheckGuardParams, IPermissionCheckGuardResult>({
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        pluginId: plugin.interfaceType,
        params: { plugin, daoId, readOnly: true },
    }) ?? { hasPermission: true, isLoading: false, settings: [] };

    const { isLoading, settings } = checkPermissions;

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
                    <Page.MainSection title="Proposal creation eligibility ">
                        <Card className="p-6">
                            {!isLoading &&
                                settings.map((settingsGroup, groupIndex) => (
                                    <div key={groupIndex} className="flex flex-col gap-y-1">
                                        <DefinitionList.Container>
                                            {settingsGroup.map(
                                                ({ term, definition, link, description, copyValue }, settingIndex) => (
                                                    <DefinitionList.Item
                                                        key={settingIndex}
                                                        term={term}
                                                        link={link}
                                                        description={description}
                                                        copyValue={copyValue}
                                                    >
                                                        {definition}
                                                    </DefinitionList.Item>
                                                ),
                                            )}
                                        </DefinitionList.Container>
                                        {settings.length > 1 && groupIndex < settings.length - 1 && (
                                            <div className="my-2 flex items-center">
                                                <div className="grow border-t border-neutral-100" />
                                                <span className="mx-2 text-neutral-500">
                                                    {t('app.governance.permissionCheckDialog.or')}
                                                </span>
                                                <div className="grow border-t border-neutral-100" />
                                            </div>
                                        )}
                                    </div>
                                ))}
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
