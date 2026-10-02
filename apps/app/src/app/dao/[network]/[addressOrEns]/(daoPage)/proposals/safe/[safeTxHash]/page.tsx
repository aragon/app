import { SafeDaoProposalDetails } from '@/plugins/safeMultisigPlugin/components/safeDaoProposalDetails';
import type { Network } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { daoUtils } from '@/shared/utils/daoUtils';
import { notFoundUtils } from '@/shared/utils/notFoundUtils';

interface ISafeDaoProposalRouteParams {
    addressOrEns: string;
    network: Network;
    safeTxHash: string;
}

interface ISafeDaoProposalRouteSearchParams {
    safeAddress?: string | string[];
}

interface ISafeDaoProposalRouteProps {
    params: Promise<ISafeDaoProposalRouteParams>;
    searchParams?: Promise<ISafeDaoProposalRouteSearchParams>;
}

export default async function SafeDaoProposalRoute({
    params,
    searchParams,
}: ISafeDaoProposalRouteProps) {
    const { addressOrEns, network, safeTxHash } = await params;
    const resolvedSearchParams =
        searchParams == null ? undefined : await searchParams;
    const safeAddress = Array.isArray(resolvedSearchParams?.safeAddress)
        ? resolvedSearchParams.safeAddress[0]
        : resolvedSearchParams?.safeAddress;
    const daoId = await notFoundUtils.fetchOrNotFound(() =>
        daoUtils.resolveDaoId({ addressOrEns, network }),
    );

    return (
        <Page.Container>
            <SafeDaoProposalDetails
                daoId={daoId}
                safeAddress={safeAddress}
                safeTxHash={safeTxHash}
            />
        </Page.Container>
    );
}
