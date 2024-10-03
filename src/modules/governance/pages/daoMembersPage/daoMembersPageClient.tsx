'use client';

import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { useState } from 'react';
import { DaoMembersInfo } from '../../../settings/components/daoMembersInfo';
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

    const bodyPlugins = useDaoPlugins({ daoId: initialParams.queryParams.daoId, type: PluginType.BODY })!;
    const [selectedPlugin, setSelectedPlugin] = useState(bodyPlugins[0]);

    return (
        <>
            <Page.Main title={t('app.governance.daoMembersPage.main.title')}>
                <DaoMemberList initialParams={initialParams} onValueChange={setSelectedPlugin} value={selectedPlugin} />
            </Page.Main>
            <Page.Aside>
                <Page.Section title={t('app.governance.daoMembersPage.aside.details.title')} inset={false}>
                    <DaoMembersInfo daoId={initialParams.queryParams.daoId} plugin={selectedPlugin.meta} />
                </Page.Section>
            </Page.Aside>
        </>
    );
};
