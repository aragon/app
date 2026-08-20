'use client';

import { Tag, type TagVariant } from '@aragon/gov-ui-kit';
import type { IMpcWorkspacePolicyVerdict } from '@/modules/mpc/api/mpcService/domain';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IMpcWorkspacePolicyVerdictsProps {
    /**
     * Verdicts of the workspace policies for a request.
     */
    verdicts: IMpcWorkspacePolicyVerdict[];
    /**
     * Additional classes for the list.
     */
    className?: string;
}

const decisionVariant: Record<string, TagVariant> = {
    approve: 'success',
    notify: 'success',
    escalate: 'warning',
    deny: 'critical',
};

/**
 * Renders the decision of every workspace policy evaluated for a transaction request (one row per policy).
 */
export const MpcWorkspacePolicyVerdicts: React.FC<
    IMpcWorkspacePolicyVerdictsProps
> = (props) => {
    const { verdicts, className } = props;
    const { t } = useTranslations();

    if (verdicts.length === 0) {
        return null;
    }

    return (
        <ul className={className}>
            {verdicts.map((verdict) => {
                const knownDecision = decisionVariant[verdict.decision] != null;

                return (
                    <li
                        className="flex flex-col gap-1 border-neutral-100 border-b py-2 last:border-b-0"
                        key={verdict.policyId}
                    >
                        <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-neutral-800">
                                {verdict.policyName}
                            </span>
                            <Tag
                                label={
                                    knownDecision
                                        ? t(
                                              `app.mpc.mpcWorkspacePolicyVerdicts.decision.${verdict.decision}`,
                                          )
                                        : verdict.decision
                                }
                                variant={
                                    decisionVariant[verdict.decision] ??
                                    'critical'
                                }
                            />
                        </div>
                        <span className="text-neutral-500 text-sm">
                            {verdict.reason}
                        </span>
                    </li>
                );
            })}
        </ul>
    );
};
