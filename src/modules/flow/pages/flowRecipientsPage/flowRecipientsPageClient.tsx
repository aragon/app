'use client';

import { FlowRecipientsTable } from '../../components/flowRecipientsTable/flowRecipientsTable';
import { useFlowData } from '../../hooks';

export interface IFlowRecipientsPageClientProps {
    network: string;
    addressOrEns: string;
}

export const FlowRecipientsPageClient: React.FC<
    IFlowRecipientsPageClientProps
> = (props) => {
    const { network, addressOrEns } = props;
    const data = useFlowData({ network, addressOrEns });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h1 className="font-semibold text-2xl text-neutral-800 leading-tight md:text-3xl">
                    Recipients
                </h1>
                <p className="font-normal text-base text-neutral-500 leading-relaxed">
                    Addresses receiving value from any active automation.
                </p>
            </div>
            <FlowRecipientsTable data={data} variant="full" />
        </div>
    );
};
