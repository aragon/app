import type { IDaoPageParams } from '@/shared/types';
import { FlowPolicyDetailPageClient } from './flowPolicyDetailPageClient';

export interface IFlowPolicyDetailPageParams extends IDaoPageParams {
    id: string;
}

export interface IFlowPolicyDetailPageProps {
    params: Promise<IFlowPolicyDetailPageParams>;
}

export const FlowPolicyDetailPage: React.FC<
    IFlowPolicyDetailPageProps
> = async (props) => {
    const { params } = props;
    const { network, addressOrEns, id } = await params;

    return (
        <FlowPolicyDetailPageClient
            addressOrEns={addressOrEns}
            network={network}
            policyId={id}
        />
    );
};
