import type { IDaoPageParams } from '@/shared/types';
import { FlowWorkbenchPageClient } from './flowWorkbenchPageClient';

export interface IFlowWorkbenchPageProps {
    params: Promise<IDaoPageParams>;
}

export const FlowWorkbenchPage: React.FC<IFlowWorkbenchPageProps> = async (
    props,
) => {
    const { params } = props;
    const { network, addressOrEns } = await params;

    return (
        <FlowWorkbenchPageClient
            addressOrEns={addressOrEns}
            network={network}
        />
    );
};
