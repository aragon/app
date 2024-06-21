'use client';

import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DefinitionListContainer, DefinitionListItem } from '@aragon/ods';
import type { IGetMemberListParams } from '../../api/governanceService';
import { DaoMemberList } from '../../components/daoMemberList';

export interface IDaoMembersPageClientProps {
    /**
     * ID of the DAO to display the members for.
     */
    daoId: string;
    /**
     * Initial parameters to use to fetch the DAO member list.
     */
    initialParams: IGetMemberListParams;
}

export const DaoMembersPageClient: React.FC<IDaoMembersPageClientProps> = (props) => {
    const { daoId, initialParams } = props;

    const { t } = useTranslations();

    return (
        <>
            <Page.Main title={t('app.governance.daoMembersPage.main.title')}>
                <DaoMemberList initialParams={initialParams} daoId={daoId} />
            </Page.Main>
            <Page.Aside>
                <Page.Section title={t('app.governance.daoMembersPage.aside.details.title')}>
                    <DefinitionListContainer>
                        <DefinitionListItem term={t('app.governance.daoMembersPage.aside.details.blockchain')}>
                            <p className="text-neutral-500">Ethereum Mainnet</p>
                        </DefinitionListItem>
                    </DefinitionListContainer>
                </Page.Section>
            </Page.Aside>
        </>
    );
};
