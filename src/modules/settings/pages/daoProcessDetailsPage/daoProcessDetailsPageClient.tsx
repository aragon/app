'use client';

import { GovernanceStagesField } from '@/modules/createDao/components/createProcessForm/createProcessFormGovernance/fields/governanceStagesField/governanceStagesField';
import { useProposalListData } from '@/modules/governance/hooks/useProposalListData';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { FormWrapper } from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import { DateFormat, formatterUtils } from '@aragon/gov-ui-kit';

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

// const memberProposalsCount = 3;
// const memberVotesCount = 5;
// const memberDaosCount = 3;

export const DaoProcessDetailsPageClient: React.FC<IDaoProcessDetailsPageClientProps> = (props) => {
    const { slug, daoId } = props;

    const { t } = useTranslations();
    // const { buildEntityUrl } = useBlockExplorer();

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const plugin = daoUtils.getDaoPlugins(dao, { slug: slug.toLowerCase() })?.[0];
    console.log('plugin', plugin?.settings.stages);

    const proposals = useProposalListData({ queryParams: { daoId, pluginAddress: plugin?.address } });

    const pageBreadcrumbs = [
        {
            href: daoUtils.getDaoUrl(dao, 'settings'),
            label: 'Settings',
        },
        { label: slug },
    ];

    const formattedLatestActivity = formatterUtils.formatDate(
        (proposals.proposalList?.[0].blockTimestamp ?? 0) * 1000,
        {
            format: DateFormat.RELATIVE,
        },
    );
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
                title={plugin?.name ?? slug}
                description={plugin?.description}
                stats={stats}
            />
            <Page.Content>
                <Page.Main>
                    <Page.MainSection title="Governance process">
                        <FormWrapper>
                            <GovernanceStagesField daoId={daoId} readOnly={true} stages={plugin?.settings.stages} />
                        </FormWrapper>
                    </Page.MainSection>
                </Page.Main>
                <Page.Aside>
                    <Page.AsideCard title="Details">wefw</Page.AsideCard>
                </Page.Aside>
            </Page.Content>
        </>
    );
};
