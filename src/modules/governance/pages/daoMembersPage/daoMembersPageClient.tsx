'use client';

import { DaoPluginInfo } from '@/modules/settings/components/daoPluginInfo';
import { Page } from '@/shared/components/page';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { useState } from 'react';
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
    const { daoId } = initialParams.queryParams;

    const { t } = useTranslations();

    const bodyPlugins = useDaoPlugins({ daoId, type: PluginType.BODY, includeSubPlugins: true })!;
    const [selectedPlugin, setSelectedPlugin] = useState(bodyPlugins[0]);

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
