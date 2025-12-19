'use client';

import { invariant } from '@aragon/gov-ui-kit';
import { DaoPluginInfo } from '@/modules/settings/components/daoPluginInfo';
import { Page } from '@/shared/components/page';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginFilterUrlParam } from '@/shared/hooks/useDaoPluginFilterUrlParam';
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

export const daoMembersPageFilterParam = 'members';

export const DaoMembersPageClient: React.FC<IDaoMembersPageClientProps> = (
    props,
) => {
    const { initialParams } = props;
    const { daoId } = initialParams.queryParams;

    const { t } = useTranslations();

    const { activePlugin, setActivePlugin } = useDaoPluginFilterUrlParam({
        daoId,
        type: PluginType.BODY,
        includeSubPlugins: true,
        name: daoMembersPageFilterParam,
    });

    invariant(
        activePlugin != null,
        'DaoMembersPageClient: no valid plugin found.',
    );

    return (
        <>
            <Page.Main title={t('app.governance.daoMembersPage.main.title')}>
                <DaoMemberList.Container
                    initialParams={initialParams}
                    onValueChange={setActivePlugin}
                    value={activePlugin}
                />
            </Page.Main>
            <Page.Aside>
                <Page.AsideCard title={activePlugin.label}>
                    <DaoPluginInfo
                        daoId={daoId}
                        plugin={activePlugin.meta}
                        type={PluginType.BODY}
                    />
                </Page.AsideCard>
                <PluginSingleComponent
                    daoId={daoId}
                    plugin={activePlugin.meta}
                    pluginId={activePlugin.id}
                    slotId={GovernanceSlotId.GOVERNANCE_MEMBER_PANEL}
                />
            </Page.Aside>
        </>
    );
};
