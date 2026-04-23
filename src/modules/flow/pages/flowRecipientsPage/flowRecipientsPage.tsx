import type { IDaoPageParams } from '@/shared/types';
import { FlowRecipientsPageClient } from './flowRecipientsPageClient';

export interface IFlowRecipientsPageProps {
    params: Promise<IDaoPageParams>;
}

export const FlowRecipientsPage: React.FC<IFlowRecipientsPageProps> = async (
    props,
) => {
    const { params } = props;
    const { network, addressOrEns } = await params;

    return (
        <FlowRecipientsPageClient
            addressOrEns={addressOrEns}
            network={network}
        />
    );
};
