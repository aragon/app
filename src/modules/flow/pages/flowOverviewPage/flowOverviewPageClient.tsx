'use client';

import { FlowActivityFeed } from '../../components/flowActivityFeed/flowActivityFeed';
import { FlowKpiRow } from '../../components/flowKpiRow/flowKpiRow';
import { FlowLede } from '../../components/flowLede/flowLede';
import { FlowOrchestratorsSection } from '../../components/flowOrchestrators';
import { FlowPoliciesSection } from '../../components/flowPoliciesSection';
import { useFlowData } from '../../hooks';

export interface IFlowOverviewPageClientProps {
    network: string;
    addressOrEns: string;
}

export const FlowOverviewPageClient: React.FC<IFlowOverviewPageClientProps> = (
    props,
) => {
    const { network, addressOrEns } = props;
    const data = useFlowData({ network, addressOrEns });

    return (
        <div className="flex flex-col gap-8">
            <FlowLede data={data} />
            <FlowKpiRow data={data} />

            <FlowOrchestratorsSection
                addressOrEns={addressOrEns}
                network={network}
                orchestrators={data.orchestrators}
            />

            <FlowPoliciesSection
                addressOrEns={addressOrEns}
                groupedPolicies={data.groupedPolicies}
                network={network}
            />

            <FlowActivityFeed
                addressOrEns={addressOrEns}
                data={data}
                limit={6}
                network={network}
                variant="preview"
            />
        </div>
    );
};
