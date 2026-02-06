import { QueryClient } from '@tanstack/react-query';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import type { IDao, IDaoPolicy } from '@/shared/api/daoService';
import { daoOptions, daoPoliciesOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { daoUtils } from '@/shared/utils/daoUtils';
import { errorUtils } from '@/shared/utils/errorUtils';
import type { IDaoPolicyDetailsPageParams } from '../../types';
import { DaoPolicyDetailsPageClient } from './daoPolicyDetailsPageClient';

export interface IDaoPolicyDetailsPageProps {
    /**
     * DAO policy details page parameters.
     */
    params: Promise<IDaoPolicyDetailsPageParams>;
}

export const DaoPolicyDetailsPage: React.FC<
    IDaoPolicyDetailsPageProps
> = async (props) => {
    const { params } = props;
    const { id, addressOrEns, network } = await params;

    const daoId = await daoUtils.resolveDaoId({ addressOrEns, network });
    const queryClient = new QueryClient();

    let dao: IDao;
    let policies: IDaoPolicy[];

    try {
        dao = await queryClient.fetchQuery(
            daoOptions({ urlParams: { id: daoId } }),
        );
        policies = await queryClient.fetchQuery(
            daoPoliciesOptions({
                urlParams: {
                    network: dao.network,
                    daoAddress: dao.address,
                },
            }),
        );
    } catch (error: unknown) {
        const parsedError = errorUtils.serialize(error);
        const errorNamespace = 'app.settings.daoPolicyDetailsPage.error';
        const actionLink = `/dao/${network}/${addressOrEns}/settings`;

        return (
            <Page.Error
                actionLink={actionLink}
                error={parsedError}
                errorNamespace={errorNamespace}
            />
        );
    }

    const policy = policies.find(
        (p) => p.address.toLowerCase() === id.toLowerCase(),
    );

    if (!policy) {
        const error = new AragonBackendServiceError(
            AragonBackendServiceError.notFoundCode,
            'Policy not found',
            404,
        );
        const parsedError = errorUtils.serialize(error);
        const errorNamespace = 'app.settings.daoPolicyDetailsPage.error';
        const actionLink = `/dao/${network}/${addressOrEns}/settings`;

        return (
            <Page.Error
                actionLink={actionLink}
                error={parsedError}
                errorNamespace={errorNamespace}
            />
        );
    }

    // id is the policy address
    const policyAddress = id;

    return (
        <Page.Container queryClient={queryClient}>
            <DaoPolicyDetailsPageClient address={policyAddress} daoId={daoId} />
        </Page.Container>
    );
};
