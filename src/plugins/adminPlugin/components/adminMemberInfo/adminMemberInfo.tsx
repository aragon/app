'use client';

import type { IDaoPlugin } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DefinitionList } from '@aragon/gov-ui-kit';
import { useMemberList } from '../../../../modules/governance/api/governanceService';

export interface IAdminMemberInfoProps {
    /**
     * ID of the DAO
     */
    daoId: string;
    /**
     * DAO plugin to display the members info for.
     */
    plugin: IDaoPlugin;
}

export const AdminMemberInfo: React.FC<IAdminMemberInfoProps> = (props) => {
    const { daoId, plugin } = props;
    const { t } = useTranslations();

    const memberParams = { daoId, pluginAddress: plugin.address };
    const { data: memberList } = useMemberList({ queryParams: memberParams });

    const memberCount = memberList?.pages[0].metadata.totalRecords;

    return (
        <Page.Section title={t('app.governance.daoMembersPage.aside.settings.title')} inset={false}>
            <DefinitionList.Container>
                <DefinitionList.Item term={t('app.plugins.admin.adminMemberInfo.admins')}>
                    <p className="text-neutral-500">
                        {t('app.plugins.admin.adminMemberInfo.membersCount', { count: memberCount })}
                    </p>
                </DefinitionList.Item>
            </DefinitionList.Container>
        </Page.Section>
    );
};
