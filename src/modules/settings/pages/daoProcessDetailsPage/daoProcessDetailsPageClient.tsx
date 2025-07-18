'use client';

import type { ICreateDaoFormData } from '@/modules/createDao/components/createDaoForm';
import { GovernanceType } from '@/modules/createDao/components/createProcessForm';
import { GovernanceBodyField } from '@/modules/createDao/components/createProcessForm/createProcessFormGovernance/fields/governanceBodyField';
import { GovernanceStagesField } from '@/modules/createDao/components/createProcessForm/createProcessFormGovernance/fields/governanceStagesField';
import { useProposalListData } from '@/modules/governance/hooks/useProposalListData';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { DateFormat, formatterUtils } from '@aragon/gov-ui-kit';
import { FormProvider, useForm } from 'react-hook-form';
import { DaoProcessDetailsInfo } from '../../components/daoProcessDetailsInfo';
import { processDetailsClientUtils } from '../../utils/processDetailsClientUtils';

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

    const plugin = daoUtils.getDaoPlugins(dao, {
        slug: slug.toLowerCase(),
        type: PluginType.PROCESS,
        includeSubPlugins: true,
    })![0];

    const hydratedPlugin = dao?.plugins.find((p) => p.address === plugin.address) ?? plugin;

    const pluginFormData = processDetailsClientUtils.pluginToProcessFormData(hydratedPlugin, dao?.plugins ?? []);

    const formMethods = useForm<ICreateDaoFormData>({ defaultValues: pluginFormData });

    const proposals = useProposalListData({ queryParams: { daoId, pluginAddress: plugin.address } });

    const pageBreadcrumbs = [
        {
            href: daoUtils.getDaoUrl(dao, 'settings'),
            label: 'Settings',
        },
        { label: slug },
    ];

    const parsedLatestActivity =
        proposals.proposalList?.[0].blockTimestamp != null
            ? proposals.proposalList[0].blockTimestamp * 1000
            : undefined;
    const formattedLatestActivity = formatterUtils.formatDate(parsedLatestActivity, { format: DateFormat.RELATIVE });

    const [value, unit] = formattedLatestActivity?.split(' ') ?? [undefined, undefined];
    const suffixLabel = t('app.governance.daoMemberDetailsPage.header.stat.latestActivityUnit', { unit: unit });

    const stats = [
        {
            label: 'Proposals',
            value: proposals.itemsCount ?? '-',
        },
        {
            label: 'Last proposal',
            value: value ?? '-',
            suffix: unit ? suffixLabel : undefined,
        },
    ];

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
                    <Page.MainSection title="Governance process">
                        <FormProvider {...formMethods}>
                            {pluginFormData.governanceType === GovernanceType.BASIC ? (
                                <GovernanceBodyField daoId={daoId} fieldName="body" readOnly={true} />
                            ) : (
                                <GovernanceStagesField daoId={daoId} readOnly={true} />
                            )}
                        </FormProvider>
                    </Page.MainSection>
                </Page.Main>
                <Page.Aside>
                    <Page.AsideCard title="Details">
                        <DaoProcessDetailsInfo dao={dao!} plugin={plugin} />
                    </Page.AsideCard>
                </Page.Aside>
            </Page.Content>
        </>
    );
};
