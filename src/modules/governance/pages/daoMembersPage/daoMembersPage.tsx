import type { IDaoPageParams } from '@/shared/types';

export interface IDaoMembersPageProps {
    /**
     * DAO page parameters.
     */
    params: IDaoPageParams;
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
