'use client';

import { DaoPluginInfo } from '@/modules/settings/components/daoPluginInfo';
import { Page } from '@/shared/components/page';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginTabParam } from '@/shared/hooks/useDaoPluginTabParam';
import { PluginType } from '@/shared/types';
import type { IGetMemberListParams } from '../../api/governanceService';
import { DaoMemberList } from '../../components/daoMemberList';
import { GovernanceSlotId } from '../../constants/moduleSlots';

export interface IDaoMembersPageClientProps {
    /**
     * Initial parameters to use to fetch the DAO member list.
     */
    initialParams: IGetMemberListParams;
}

export const membersTabParam = 'membersTab';

export const DaoMembersPageClient: React.FC<IDaoMembersPageClientProps> = (props) => {
    const { initialParams } = props;
    const { daoId } = initialParams.queryParams;

    const { t } = useTranslations();

    const { selectedPlugin, setSelectedPlugin } = useDaoPluginTabParam({
        daoId,
        type: PluginType.BODY,
        includeSubPlugins: true,
        name: membersTabParam,
    });

    return (
        <>
            <Page.Main title={t('app.governance.daoMembersPage.main.title')}>
                <DaoMemberList.Container
                    initialParams={initialParams}
                    onValueChange={setSelectedPlugin}
                    value={selectedPlugin}
                />
            </Page.Main>
            <Page.Aside>
                <Page.AsideCard title={selectedPlugin.label}>
                    <DaoPluginInfo plugin={selectedPlugin.meta} daoId={daoId} type={PluginType.BODY} />
                </Page.AsideCard>
                <PluginSingleComponent
                    pluginId={selectedPlugin.id}
                    slotId={GovernanceSlotId.GOVERNANCE_MEMBER_PANEL}
                    plugin={selectedPlugin.meta}
                    daoId={daoId}
                />
            </Page.Aside>
        </>
    );
};
