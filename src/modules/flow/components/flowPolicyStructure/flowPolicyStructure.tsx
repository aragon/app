import classNames from 'classnames';
import type { IFlowPolicy, IFlowPolicySubRouter } from '../../types';
import {
    FlowAddressLabel,
    FlowBlockieAvatar,
    FlowTokenChip,
} from '../flowPrimitives';
import { FlowPolicyTree } from './flowPolicyTree';

export interface IFlowPolicyStructureProps {
    policy: IFlowPolicy;
    className?: string;
}

export const FlowPolicyStructure: React.FC<IFlowPolicyStructureProps> = (
    props,
) => {
    const { policy, className } = props;

    if (
        policy.strategy !== 'Multi-dispatch' ||
        policy.schema.subRouters == null
    ) {
        return null;
    }

    return (
        <section className={classNames('flex flex-col gap-4', className)}>
            <FlowPolicyTree policy={policy} />

            <div className="flex flex-col gap-4 rounded-xl border border-neutral-100 bg-neutral-0 p-4 md:p-6">
                <div className="flex flex-col gap-1">
                    <h2 className="font-semibold text-lg text-neutral-800 leading-tight">
                        Structure breakdown
                    </h2>
                    <p className="font-normal text-neutral-500 text-sm leading-snug">
                        Source → Allowance → Model → Recipients. Nested routers
                        shown indented.
                    </p>
                </div>

                <FlowStructureStep
                    header="Source vault"
                    hint="On-chain contract that holds the funds this policy can move."
                    value={policy.schema.source}
                />
                <FlowStructureStep
                    header="Allowance"
                    hint={policy.schema.allowance.detail}
                    value={
                        <span className="flex items-center gap-2">
                            {policy.schema.allowance.type}
                            <FlowTokenChip token={policy.token} />
                        </span>
                    }
                />
                <FlowStructureStep
                    header="Model / splitter"
                    hint={policy.schema.model.detail}
                    value={policy.schema.model.type}
                />

                <div className="flex flex-col gap-3">
                    <span className="font-semibold text-neutral-800 text-sm uppercase leading-tight tracking-wide">
                        Sub-routers
                    </span>
                    <div className="flex flex-col gap-3">
                        {policy.schema.subRouters.map((router) => (
                            <FlowSubRouterNode
                                depth={0}
                                key={router.id}
                                router={router}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

interface IFlowStructureStepProps {
    header: string;
    value: React.ReactNode;
    hint?: string;
}

const FlowStructureStep: React.FC<IFlowStructureStepProps> = (props) => {
    const { header, value, hint } = props;
    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center">
                <span className="size-2.5 rounded-full bg-primary-400" />
                <span className="w-px flex-1 bg-neutral-200" />
            </div>
            <div className="flex flex-1 flex-col gap-0.5 pb-2">
                <span className="font-normal text-neutral-500 text-xs uppercase leading-tight tracking-wide">
                    {header}
                </span>
                <span className="font-normal text-base text-neutral-800 leading-tight">
                    {value}
                </span>
                {hint != null && (
                    <span className="font-normal text-neutral-500 text-sm leading-snug">
                        {hint}
                    </span>
                )}
            </div>
        </div>
    );
};

interface IFlowSubRouterNodeProps {
    router: IFlowPolicySubRouter;
    depth: number;
}

const FlowSubRouterNode: React.FC<IFlowSubRouterNodeProps> = (props) => {
    const { router, depth } = props;
    const indent = depth === 0 ? 'ml-0' : 'ml-4 md:ml-8';
    return (
        <div
            className={classNames(
                'flex flex-col gap-2 rounded-lg border border-neutral-100 bg-neutral-50/60 p-3',
                indent,
            )}
        >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold text-base text-neutral-800 leading-tight">
                    {router.title}
                </span>
                {router.subtitle != null && (
                    <span className="font-normal text-neutral-500 text-sm leading-tight">
                        {router.subtitle}
                    </span>
                )}
            </div>
            {router.allowance != null && (
                <div className="flex flex-col gap-0.5">
                    <span className="font-normal text-neutral-500 text-xs uppercase leading-tight tracking-wide">
                        Allowance
                    </span>
                    <span className="font-normal text-neutral-700 text-sm leading-snug">
                        {router.allowance.type} · {router.allowance.detail}
                    </span>
                </div>
            )}
            {router.model != null && (
                <div className="flex flex-col gap-0.5">
                    <span className="font-normal text-neutral-500 text-xs uppercase leading-tight tracking-wide">
                        Model
                    </span>
                    <span className="font-normal text-neutral-700 text-sm leading-snug">
                        {router.model.type} · {router.model.detail}
                    </span>
                </div>
            )}
            {router.recipients != null && router.recipients.length > 0 && (
                <div className="flex flex-col gap-1">
                    <span className="font-normal text-neutral-500 text-xs uppercase leading-tight tracking-wide">
                        Recipients
                    </span>
                    <ul className="flex flex-col gap-1">
                        {router.recipients.map((recipient) => (
                            <li
                                className="flex items-center gap-2"
                                key={recipient.address}
                            >
                                <FlowBlockieAvatar
                                    address={recipient.address}
                                    size={18}
                                />
                                <FlowAddressLabel
                                    address={recipient.address}
                                    className="min-w-0 flex-1"
                                    knownEns={recipient.ens}
                                    knownLabel={
                                        recipient.role != null
                                            ? recipient.name
                                            : undefined
                                    }
                                    knownRole={recipient.role}
                                    showSubtitle={false}
                                />
                                {recipient.ratio != null && (
                                    <span className="font-normal text-neutral-500 text-sm tabular-nums leading-tight">
                                        {recipient.ratio}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {router.subRouters != null && router.subRouters.length > 0 && (
                <div className="flex flex-col gap-2 pt-1">
                    {router.subRouters.map((child) => (
                        <FlowSubRouterNode
                            depth={depth + 1}
                            key={child.id}
                            router={child}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
