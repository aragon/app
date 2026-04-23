import type { IDaoPageParams } from '@/shared/types';
import { FlowOverviewPageClient } from './flowOverviewPageClient';

export interface IFlowOverviewPageProps {
    params: Promise<IDaoPageParams>;
}

export const FlowOverviewPage: React.FC<IFlowOverviewPageProps> = async (
    props,
) => {
    const { params } = props;
    const { network, addressOrEns } = await params;

    return (
        <FlowOverviewPageClient addressOrEns={addressOrEns} network={network} />
    );
};
