import { Page } from '@/shared/components/page';
import { IDaoPageParams } from '@/shared/types';
import { DefinitionListContainer, DefinitionListItem } from '@aragon/ods';
import { DaoMemberList } from '../../components/daoMemberList';

export interface IDaoMembersPageProps {
    /**
     * DAO page parameters.
     */
    params: IDaoPageParams;
}

export const DaoMembersPage: React.FC<IDaoMembersPageProps> = (props) => {
    const { params } = props;

    return (
        <Page.Container>
            <Page.Content>
                <Page.Main title="Members">
                    <DaoMemberList slug={params.slug} />
                </Page.Main>
                <Page.Aside>
                    <Page.Section title="Details">
                        <DefinitionListContainer>
                            <DefinitionListItem term="Blockchain">
                                <p className="text-neutral-500">Ethereum Mainnet</p>
                            </DefinitionListItem>
                        </DefinitionListContainer>
                    </Page.Section>
                </Page.Aside>
            </Page.Content>
        </Page.Container>
    );
};
