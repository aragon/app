'use client';

import { Card, DateFormat, formatterUtils } from '@aragon/gov-ui-kit';
import { FormProvider, useForm } from 'react-hook-form';
import type { ICreateDaoFormData } from '@/modules/createDao/components/createDaoForm';
import {
    GovernanceBodyField,
    GovernanceStagesField,
    GovernanceType,
} from '@/modules/createDao/components/createProcessForm';
import { PermissionsDefinitionList } from '@/modules/governance/components/permissionsDefinitionList';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { useProposalListData } from '@/modules/governance/hooks/useProposalListData';
import type {
    IPermissionCheckGuardParams,
    IPermissionCheckGuardResult,
} from '@/modules/governance/types';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useIsMounted } from '@/shared/hooks/useIsMounted';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { DaoProcessAllowedActions } from '../../components/daoProccessAllowedActions';
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

export const DaoProcessDetailsPageClient: React.FC<
    IDaoProcessDetailsPageClientProps
> = (props) => {
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

    const pluginFormData = daoProcessDetailsClientUtils.pluginToProcessFormData(
        plugin,
        dao?.plugins ?? [],
    );

    const formMethods = useForm<ICreateDaoFormData>({
        defaultValues: pluginFormData,
    });

    const { proposalList, itemsCount } = useProposalListData({
        queryParams: { daoId, pluginAddress: plugin.address },
    });

    const pageBreadcrumbs = [
        {
            href: daoUtils.getDaoUrl(dao, 'settings'),
            label: t(
                'app.settings.daoProcessDetailsPage.header.breadcrumb.settings',
            ),
        },
        { label: slug.toUpperCase() },
    ];

    const parsedLatestActivity =
        proposalList?.[0]?.blockTimestamp != null
            ? proposalList[0].blockTimestamp * 1000
            : undefined;
    const formattedLatestActivity = formatterUtils.formatDate(
        parsedLatestActivity,
        { format: DateFormat.RELATIVE },
    );

    const [value, unit] = formattedLatestActivity?.split(' ') ?? [
        undefined,
        undefined,
    ];
    const suffixLabel = t(
        'app.settings.daoProcessDetailsPage.header.stats.latestActivityUnit',
        { unit },
    );

    const stats = [
        {
            label: t(
                'app.settings.daoProcessDetailsPage.header.stats.proposals',
            ),
            value: itemsCount ?? '-',
        },
        {
            label: t(
                'app.settings.daoProcessDetailsPage.header.stats.lastProposal',
            ),
            value: value ?? '-',
            suffix: unit ? suffixLabel : undefined,
        },
    ];

    // Track client-side mounting to avoid hydration mismatch.
    // Plugin registry is only available on client, so slot function returns
    // different results on server (undefined -> fallback) vs client (actual result).
    const isMounted = useIsMounted();

    const slotResult = useSlotSingleFunction<
        IPermissionCheckGuardParams,
        IPermissionCheckGuardResult
    >({
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        pluginId: plugin.interfaceType,
        params: { plugin, daoId, useConnectedUserInfo: false },
    });

    // Use fallback on server and first client render to ensure hydration match.
    // After mount, use actual slot result if available.
    const fallback = { hasPermission: true, isLoading: false, settings: [] };
    const { isLoading, settings } = isMounted
        ? (slotResult ?? fallback)
        : fallback;

    return (
        <>
            <Page.Header
                breadcrumbs={pageBreadcrumbs}
                description={plugin.description}
                stats={stats}
                title={plugin.name}
            />
            <Page.Content>
                <Page.Main>
                    <Page.MainSection
                        title={t(
                            'app.settings.daoProcessDetailsPage.section.governanceProcess',
                        )}
                    >
                        <FormProvider {...formMethods}>
                            {pluginFormData.governanceType ===
                            GovernanceType.BASIC ? (
                                <GovernanceBodyField
                                    body={pluginFormData.body}
                                    daoId={daoId}
                                    fieldName="body"
                                    readOnly={true}
                                />
                            ) : (
                                <GovernanceStagesField
                                    daoId={daoId}
                                    readOnly={true}
                                />
                            )}
                        </FormProvider>
                    </Page.MainSection>
                    <Page.MainSection
                        title={t(
                            'app.settings.daoProcessDetailsPage.section.creationEligibility',
                        )}
                    >
                        <Card className="px-6 py-3">
                            <PermissionsDefinitionList
                                isLoading={isLoading}
                                settings={settings}
                            />
                        </Card>
                    </Page.MainSection>
                    <Page.MainSection
                        title={t(
                            'app.settings.daoProcessDetailsPage.section.actions',
                        )}
                    >
                        <DaoProcessAllowedActions
                            network={dao!.network}
                            plugin={plugin}
                        />
                    </Page.MainSection>
                </Page.Main>
                <Page.Aside>
                    <Page.AsideCard
                        title={t(
                            'app.settings.daoProcessDetailsPage.section.details',
                        )}
                    >
                        <DaoProcessDetailsInfo dao={dao!} plugin={plugin} />
                    </Page.AsideCard>
                </Page.Aside>
            </Page.Content>
        </>
    );
};
