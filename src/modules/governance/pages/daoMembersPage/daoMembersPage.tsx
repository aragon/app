import { Page } from '@/shared/components/page';
import { DaoMemberList } from '../../components/daoMemberList';

export interface IDaoMembersPageProps {
    /**
     * DAO page parameters.
     */
    params: { slug: string };
}

export const DaoMembersPage: React.FC<IDaoMembersPageProps> = (props) => {
    const { params } = props;

    return (
        <Page>
            <div>DAO Members Page</div>
            <DaoMemberList daoSlug={params.slug} />
        </Page>
    );
};
