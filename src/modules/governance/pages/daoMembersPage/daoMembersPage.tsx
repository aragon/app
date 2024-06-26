import type { IDaoPageParams } from '@/shared/types';

export interface IDaoMembersPageProps {
    /**
     * DAO page parameters.
     */
    params: IDaoPageParams;
}

export const DaoMembersPage: React.FC<IDaoMembersPageProps> = () => {
    return <div>DAO Members</div>;
};
