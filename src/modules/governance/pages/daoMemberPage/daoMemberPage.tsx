import { Page } from '@/shared/components/page';
import { QueryClient } from '@tanstack/react-query';
import { memberOptions } from '../../api/governanceService';
import { type IDaoMemberPageParams } from '../../types';
import { DaoMemberPageClient } from './daoMemberPageClient';

export interface IDaoMemberPageProps {
    /**
     * DAO member page parameters.
     */
    params: IDaoMemberPageParams;
}

export const DaoMemberPage: React.FC<IDaoMemberPageProps> = async (props) => {
    const { params } = props;
    const { address, id: daoId } = params;

    const queryClient = new QueryClient();

    const memberUrlParams = { address };
    const memberQueryParams = { daoId };
    const memberParams = {
        urlParams: memberUrlParams,
        queryParams: memberQueryParams,
    };
    await queryClient.prefetchQuery(memberOptions(memberParams));

    return (
        <Page.Container>
            <DaoMemberPageClient address={address} daoId={daoId} />
        </Page.Container>
    );
};
