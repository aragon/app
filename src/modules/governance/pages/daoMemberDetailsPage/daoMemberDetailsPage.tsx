import { daoService } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { daoUtils } from '@/shared/utils/daoUtils';
import { QueryClient } from '@tanstack/react-query';
import { memberOptions } from '../../api/governanceService';
import { type IDaoMemberPageParams } from '../../types';
import { DaoMemberDetailsPageClient } from './daoMemberDetailsPageClient';

export interface IDaoMemberDetailsPageProps {
    /**
     * DAO member page parameters.
     */
    params: Promise<IDaoMemberPageParams>;
}

export const DaoMemberDetailsPage: React.FC<IDaoMemberDetailsPageProps> = async (props) => {
    const { params } = props;
    const { address, addressOrEns, network } = await params;
    const daoId = await daoUtils.resolveDaoId({ addressOrEns, network });
    const dao = await daoService.getDao({ urlParams: { id: daoId } });

    const queryClient = new QueryClient();

    const memberUrlParams = { address };
    const memberQueryParams = { daoId, pluginAddress: dao.plugins[0].address };
    const memberParams = { urlParams: memberUrlParams, queryParams: memberQueryParams };

    try {
        await queryClient.fetchQuery(memberOptions(memberParams));
    } catch (error: unknown) {
        return (
            <Page.Error
                error={JSON.parse(JSON.stringify(error)) as unknown}
                actionLink={`/dao/${network}/${addressOrEns}/members`}
                notFoundNamespace="app.governance.daoMemberDetailsPage"
            />
        );
    }

    return (
        <Page.Container queryClient={queryClient}>
            <DaoMemberDetailsPageClient address={address} daoId={daoId} />
        </Page.Container>
    );
};
