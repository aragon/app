import type { IDaoPageParams } from '@/shared/types';
import { FlowActivityPageClient } from './flowActivityPageClient';

export interface IFlowActivityPageProps {
    params: Promise<IDaoPageParams>;
}

export const FlowActivityPage: React.FC<IFlowActivityPageProps> = async (
    props,
) => {
    const { params } = props;
    const { network, addressOrEns } = await params;

    return (
        <FlowActivityPageClient addressOrEns={addressOrEns} network={network} />
    );
};
