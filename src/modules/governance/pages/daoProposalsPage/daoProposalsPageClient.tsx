'use client';

import { Page } from '@/shared/components/page';
import { PluginComponent } from '@/shared/components/pluginComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import type { IGetProposalListParams } from '../../api/governanceService';
import { DaoProposalList } from '../../components/daoProposalList';
import { GovernanceSlotId } from '../../constants/moduleSlots';

export interface IDaoProposalsPageClientProps {
    /**
     * Initial parameters to use to fetch the DAO proposal list.
     */
    initialParams: IGetProposalListParams;
}

export const DaoProposalsPageClient: React.FC<IDaoProposalsPageClientProps> = (props) => {
    const { initialParams } = props;

    const { t } = useTranslations();
    const pluginIds = useDaoPluginIds(initialParams.queryParams.daoId);

    return (
        <>
            <Page.Main title={t('app.governance.daoProposalsPage.main.title')}>
                <DaoProposalList initialParams={initialParams} />
            </Page.Main>
            <Page.Aside>
                <Page.Section title={t('app.governance.daoProposalsPage.aside.details.title')} inset={false}>
                    <PluginComponent
                        slotId={GovernanceSlotId.GOVERNANCE_PROPOSALS_PAGE_DETAILS}
                        pluginIds={pluginIds}
                        daoId={initialParams.queryParams.daoId}
                    />
                </Page.Section>
            </Page.Aside>
        </>
    );
};
