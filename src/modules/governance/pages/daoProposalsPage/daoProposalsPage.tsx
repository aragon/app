import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { QueryClient } from '@tanstack/react-query';
import { proposalListOptions } from '../../api/governanceService';
import { DaoProposalsPageClient } from './daoProposalsPageClient';

export interface IDaoProposalsPageProps {
    /**
     * DAO page parameters.
     */
    params: IDaoPageParams;
}

export const daoProposalsCount = 9;

export const DaoProposalsPage: React.FC<IDaoProposalsPageProps> = async (props) => {
    const { params } = props;

    const queryClient = new QueryClient();
    console.log('params', params);
    const proposalListQueryParams = { daoId: params.id, pageSize: daoProposalsCount };
    const proposalListParams = { queryParams: proposalListQueryParams };
    await queryClient.prefetchInfiniteQuery(proposalListOptions(proposalListParams));

    return (
        <Page.Container queryClient={queryClient}>
            <Page.Content>
                <DaoProposalsPageClient initialParams={proposalListParams} />
            </Page.Content>
        </Page.Container>
    );
};
