'use client';

import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { Page } from '@/shared/components/page';
import { PluginComponent } from '@/shared/components/pluginComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import type { IGetMemberListParams } from '../../api/governanceService';
import { DaoMemberList } from '../../components/daoMemberList';

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
                    <PluginComponent
                        slotId={SettingsSlotId.SETTINGS_MEMBERS_INFO}
                        pluginIds={pluginIds}
                        daoId={initialParams.queryParams.daoId}
                    />
                </Page.Section>
            </Page.Aside>
        </>
    );
};
