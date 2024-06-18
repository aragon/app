import { Page } from '@/shared/components/page';
import { DefinitionListContainer, DefinitionListItem } from '@aragon/ods';
import { DaoMemberList } from '../../components/daoMemberList';

export interface IDaoMembersPageClientProps {
    /**
     * ID of the DAO to display the members for.
     */
    daoId: string;
}

export const DaoMembersPageClient: React.FC<IDaoMembersPageClientProps> = (props) => {
    const { daoId } = props;

    return (
        <>
            <Page.Main title="Members">
                <DaoMemberList daoId={daoId} />
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
        </>
    );
};
