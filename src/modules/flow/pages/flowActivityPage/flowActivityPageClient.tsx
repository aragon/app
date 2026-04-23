'use client';

import { FlowActivityFeed } from '../../components/flowActivityFeed/flowActivityFeed';
import { useFlowData } from '../../hooks';

export interface IFlowActivityPageClientProps {
    network: string;
    addressOrEns: string;
}

export const FlowActivityPageClient: React.FC<IFlowActivityPageClientProps> = (
    props,
) => {
    const { network, addressOrEns } = props;
    const data = useFlowData({ network, addressOrEns });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h1 className="font-semibold text-2xl text-neutral-800 leading-tight md:text-3xl">
                    Activity
                </h1>
                <p className="font-normal text-base text-neutral-500 leading-relaxed">
                    Every dispatch and lifecycle event across all policies.
                </p>
            </div>
            <FlowActivityFeed
                addressOrEns={addressOrEns}
                data={data}
                network={network}
                variant="full"
            />
        </div>
    );
};
