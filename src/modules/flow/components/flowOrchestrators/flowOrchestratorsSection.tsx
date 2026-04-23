'use client';

import type { IFlowOrchestrator } from '../../types';
import { FlowMultiDispatchCard } from './flowMultiDispatchCard';

export interface IFlowOrchestratorsSectionProps {
    orchestrators: readonly IFlowOrchestrator[];
    network: string;
    addressOrEns: string;
}

/**
 * Lifted "Orchestrators" section shown above the Policies section on the Flow overview.
 * Only rendered when the DAO has at least one `multiDispatch`/`multiRouter`/`multiClaimer`
 * policy — otherwise the Policies section takes the whole vertical space.
 */
export const FlowOrchestratorsSection: React.FC<
    IFlowOrchestratorsSectionProps
> = (props) => {
    const { orchestrators, network, addressOrEns } = props;

    if (orchestrators.length === 0) {
        return null;
    }

    return (
        <section className="flex flex-col gap-3">
            <div className="flex items-end justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                    <h2 className="font-semibold text-lg text-neutral-800 leading-tight">
                        Orchestrators
                    </h2>
                    <p className="font-normal text-neutral-500 text-sm leading-tight">
                        Multi-dispatch policies chaining other routers — a
                        single run fans out into the legs below.
                    </p>
                </div>
                <span className="font-semibold text-neutral-500 text-xs uppercase leading-tight tracking-wide">
                    {orchestrators.length}
                </span>
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {orchestrators.map((orchestrator) => (
                    <FlowMultiDispatchCard
                        addressOrEns={addressOrEns}
                        key={orchestrator.id}
                        network={network}
                        orchestrator={orchestrator}
                    />
                ))}
            </div>
        </section>
    );
};
