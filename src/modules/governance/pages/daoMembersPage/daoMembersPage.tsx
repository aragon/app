import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { QueryClient } from '@tanstack/react-query';
import { memberListOptions } from '../../api/governanceService';
import { DaoMembersPageClient } from './daoMembersPageClient';

export interface IDaoMembersPageProps {
    /**
     * DAO page parameters.
     */
    params: IDaoPageParams;
}

const daoMembersCount = 9;

export const DaoMembersPage: React.FC<IDaoMembersPageProps> = async (props) => {
    const { params } = props;

    const queryClient = new QueryClient();

    const memberListQueryParams = { daoId: params.id, pageSize: daoMembersCount };
    const memberListParams = { queryParams: memberListQueryParams };
    await queryClient.prefetchInfiniteQuery(memberListOptions(memberListParams));

    return (
        <Page.Container queryClient={queryClient}>
            <Page.Content>
                <DaoMembersPageClient initialParams={memberListParams} />
            </Page.Content>
        </Page.Container>
    );
};
