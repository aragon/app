'use client';

import { DaoPluginInfo } from '@/modules/settings/components/daoPluginInfo';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { useState } from 'react';
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

    const bodyPlugins = useDaoPlugins({
        daoId: initialParams.queryParams.daoId,
        type: PluginType.BODY,
        includeSubPlugins: true,
    })!;
    const [selectedPlugin, setSelectedPlugin] = useState(bodyPlugins[0]);

    const bodyName = selectedPlugin.meta.name ?? selectedPlugin.label ?? selectedPlugin.id;

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
                <Page.Section title={bodyName} inset={true}>
                    <DaoPluginInfo
                        plugin={selectedPlugin.meta}
                        daoId={initialParams.queryParams.daoId}
                        isMembersPage={true}
                    />
                </Page.Section>
            </Page.Aside>
        </>
    );
};
