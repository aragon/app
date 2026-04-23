'use client';

import classNames from 'classnames';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { IFlowGroupedPolicies, IFlowPolicy } from '../../types';
import { FlowPolicyCard } from '../flowPolicyCard/flowPolicyCard';

export interface IFlowPoliciesSectionProps {
    groupedPolicies: IFlowGroupedPolicies;
    network: string;
    addressOrEns: string;
}

type PillId = 'active' | 'neverRun' | 'archived';

interface IPill {
    id: PillId;
    label: string;
    count: number;
    policies: readonly IFlowPolicy[];
    variant: 'default' | 'compact';
}

/**
 * Policies overview with a pill filter. The pills only render when their bucket has at
 * least one policy — e.g. a DAO with no archived automations never sees the "Archived"
 * pill. Default selection = first non-empty bucket (Active → Not yet dispatched → Archived).
 */
export const FlowPoliciesSection: React.FC<IFlowPoliciesSectionProps> = (
    props,
) => {
    const { groupedPolicies, network, addressOrEns } = props;

    const pills = useMemo<IPill[]>(
        () =>
            [
                {
                    id: 'active' as const,
                    label: 'Active',
                    count: groupedPolicies.active.length,
                    policies: groupedPolicies.active,
                    variant: 'default' as const,
                },
                {
                    id: 'neverRun' as const,
                    label: 'Not yet dispatched',
                    count: groupedPolicies.neverRun.length,
                    policies: groupedPolicies.neverRun,
                    variant: 'compact' as const,
                },
                {
                    id: 'archived' as const,
                    label: 'Archived',
                    count: groupedPolicies.archived.length,
                    policies: groupedPolicies.archived,
                    variant: 'compact' as const,
                },
            ].filter((pill) => pill.count > 0),
        [groupedPolicies],
    );

    const defaultPill = pills[0]?.id ?? 'active';
    const [selected, setSelected] = useState<PillId>(defaultPill);

    // If the bucket the user is currently on becomes empty (e.g. dispatch moved a policy
    // out of "Not yet dispatched"), fall back to the first available pill.
    useEffect(() => {
        if (!pills.some((p) => p.id === selected)) {
            setSelected(pills[0]?.id ?? 'active');
        }
    }, [pills, selected]);

    const active = pills.find((p) => p.id === selected) ?? pills[0];
    const addAutomationHref = `/dao/${network}/${addressOrEns}/settings/automations`;

    return (
        <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-lg text-neutral-800 leading-tight">
                        Policies
                    </h2>
                    {pills.length > 1 && (
                        <div className="flex flex-wrap items-center gap-1">
                            {pills.map((pill) => (
                                <button
                                    className={classNames(
                                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-semibold text-xs leading-tight transition-colors',
                                        selected === pill.id
                                            ? 'border-primary-400 bg-primary-50 text-primary-700'
                                            : 'border-neutral-100 bg-neutral-0 text-neutral-600 hover:border-primary-200 hover:text-primary-500',
                                    )}
                                    key={pill.id}
                                    onClick={() => setSelected(pill.id)}
                                    type="button"
                                >
                                    {pill.label}
                                    <span
                                        className={classNames(
                                            'rounded-full px-1.5 font-semibold text-[10px] leading-tight',
                                            selected === pill.id
                                                ? 'bg-primary-100 text-primary-700'
                                                : 'bg-neutral-100 text-neutral-600',
                                        )}
                                    >
                                        {pill.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <Link
                    className="inline-flex items-center gap-1 rounded-full border border-neutral-100 bg-neutral-0 px-3 py-1.5 font-semibold text-neutral-700 text-sm leading-tight hover:border-primary-200 hover:text-primary-400"
                    href={addAutomationHref}
                    rel="noopener"
                    target="_blank"
                >
                    + Add automation ↗
                </Link>
            </div>

            {active && active.policies.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {active.policies.map((policy) => (
                        <FlowPolicyCard
                            addressOrEns={addressOrEns}
                            key={policy.id}
                            network={network}
                            policy={policy}
                            variant={active.variant}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-lg border border-neutral-100 border-dashed px-3 py-6 text-center font-normal text-neutral-500 text-sm">
                    No policies in this bucket yet.
                </div>
            )}
        </section>
    );
};
