'use client';

import { Page } from '@/shared/components/page';
import { PluginComponent } from '@/shared/components/pluginComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import type { IGetMemberListParams } from '../../api/governanceService';
import { DaoMemberList } from '../../components/daoMemberList';
import { GovernanceSlotId } from '../../constants/moduleSlots';

export interface IDaoMembersPageClientProps {
    /**
     * Initial parameters to use to fetch the DAO member list.
     */
    initialParams: IGetMemberListParams;
}

export const DaoMembersPageClient: React.FC<IDaoMembersPageClientProps> = (props) => {
    const { initialParams } = props;

    const { t } = useTranslations();
    const pluginIds = useDaoPluginIds(initialParams.queryParams.daoId);

    return (
        <>
            <Page.Main title={t('app.governance.daoMembersPage.main.title')}>
                <DaoMemberList initialParams={initialParams} />
            </Page.Main>
            <Page.Aside>
                <Page.Section title={t('app.governance.daoMembersPage.aside.details.title')} inset={false}>
                    <PluginComponent slotId={GovernanceSlotId.GOVERNANCE_MEMBERS_PAGE_DETAILS} pluginIds={pluginIds} />
                </Page.Section>
            </Page.Aside>
        </>
    );
};
