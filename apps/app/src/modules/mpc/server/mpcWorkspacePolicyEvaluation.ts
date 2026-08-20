import 'server-only';
import type {
    IMpcPolicy,
    IMpcPolicySimContext,
    IMpcPolicySimResult,
    IMpcSignRequest,
    IMpcTransactionPayload,
    IMpcWorkspacePolicy,
    IMpcWorkspacePolicyVerdict,
    MpcSignRequestPayload,
} from '@/modules/mpc/api/mpcService/domain';
import { computeDailySpentWei } from './mpcPolicy';
import { mpcPolicyEngine } from './mpcPolicyEngine';
import { expandPolicyReferences } from './mpcPolicyReferences';
import type { IMpcStoreData, IMpcStoreSystem } from './mpcStore';
import { listEnabledPoliciesForSystem } from './mpcWorkspaces';

/**
 * Enforcement of the workspace policies (decision-tree flows) on transaction requests: builds the transaction
 * context the engine understands, asks the policy engine for the verdict of every enabled policy of the system
 * workspace and merges the verdicts into one decision.
 *
 * Merge rules (fail-closed): any `deny` denies the request; `escalate` requires approvals (the largest
 * extra_approvals wins); `notify` and `approve` allow it. Message / typed-data requests are not covered by the
 * flows (they describe transactions) and are left to the system policy.
 */

export interface IMpcWorkspacePolicyEvaluation {
    /**
     * Verdict of every enabled policy, in evaluation order.
     */
    verdicts: IMpcWorkspacePolicyVerdict[];
    /**
     * Whether every policy allows the request (approve / escalate / notify).
     */
    allowed: boolean;
    /**
     * Whether any policy escalated the request (approvals required).
     */
    requiresApproval: boolean;
    /**
     * Largest number of extra approvals requested by an escalating policy (0 when none).
     */
    extraApprovals: number;
    /**
     * Human readable deny reasons (one per denying policy).
     */
    denyReasons: string[];
    /**
     * Human readable approval reasons (one per escalating policy).
     */
    approvalReasons: string[];
}

const SEEN_STATUSES: IMpcSignRequest['status'][] = ['signed', 'broadcast'];

const isSameAddress = (a: string, b: string): boolean =>
    a.toLowerCase() === b.toLowerCase();

/**
 * Materializes the facts a flow can read for a transaction of the system:
 * - dest_whitelisted: the destination is on the system recipient allowlist (the "trusted list" of the flows);
 * - dest_seen_before: the system already signed / broadcast a transaction to the destination;
 * - scanner: no scanner is integrated in the POC, the fact is materialized as "safe";
 * - timestamp: now (the flows are evaluated at request creation time);
 * - chain_id: the chain declared by the transaction;
 * - daily_spent_wei: the system spend in the rolling 24 h window (same reservation rules as the system daily
 *   limit: pending, approved and signed requests count) plus this transaction.
 */
export const buildWorkspacePolicyContext = (
    transaction: IMpcTransactionPayload,
    systemPolicy: IMpcPolicy,
    history: IMpcSignRequest[],
    now = Date.now(),
): IMpcPolicySimContext => {
    const whitelisted =
        systemPolicy.recipientAllowlist?.some((address) =>
            isSameAddress(address, transaction.to),
        ) ?? false;
    const seenBefore = history.some(
        (request) =>
            request.type === 'transaction' &&
            SEEN_STATUSES.includes(request.status) &&
            request.summary.to != null &&
            isSameAddress(request.summary.to, transaction.to),
    );

    const dailySpentWei = (
        computeDailySpentWei(history, now) + BigInt(transaction.valueWei)
    ).toString();

    return {
        amount_wei: transaction.valueWei,
        dest_whitelisted: whitelisted,
        dest_seen_before: seenBefore,
        timestamp: Math.floor(now / 1000),
        scanner: 'safe',
        action_to: transaction.to,
        action_value_wei: transaction.valueWei,
        action_data: transaction.data ?? '0x',
        action_operation: 'call',
        chain_id: transaction.chainId,
        daily_spent_wei: dailySpentWei,
    };
};

const formatDelay = (seconds: number): string => {
    if (seconds % 86_400 === 0) {
        return `${(seconds / 86_400).toString()} d`;
    }

    if (seconds % 3600 === 0) {
        return `${(seconds / 3600).toString()} h`;
    }

    if (seconds % 60 === 0) {
        return `${(seconds / 60).toString()} min`;
    }

    return `${seconds.toString()} s`;
};

const toInteger = (value: unknown, fallback = 0): number => {
    const parsed = Number(value);

    return Number.isFinite(parsed) && parsed >= 0
        ? Math.floor(parsed)
        : fallback;
};

/**
 * Builds the verdict record (decision + human readable reason) of one policy from the engine result.
 */
export const toWorkspacePolicyVerdict = (
    policy: Pick<IMpcWorkspacePolicy, 'id' | 'name'>,
    result: IMpcPolicySimResult,
): IMpcWorkspacePolicyVerdict => {
    const { template, params } = result.decision;
    const isDefaultDeny = template === 'deny' && result.actionNodeId == null;
    let reason: string;

    if (template === 'approve') {
        reason = `Policy "${policy.name}" approves the transaction.`;
    } else if (template === 'escalate') {
        const approvals = toInteger(params.extra_approvals, 1);
        const delay = toInteger(params.delay_seconds);
        reason = `Policy "${policy.name}" requires ${approvals.toString()} additional approval(s)${
            delay > 0 ? ` and a waiting period of ${formatDelay(delay)}` : ''
        }.`;
    } else if (template === 'notify') {
        reason = `Policy "${policy.name}" allows the transaction and notifies (${String(params.channel ?? 'webhook')}).`;
    } else if (isDefaultDeny) {
        reason = `Policy "${policy.name}" denies the transaction: no rule matched it (default deny).`;
    } else {
        reason = `Policy "${policy.name}" denies the transaction.`;
    }

    return {
        policyId: policy.id,
        policyName: policy.name,
        decision: template,
        params,
        isDefaultDeny,
        path: result.path,
        reason,
    };
};

/**
 * Merges the verdicts of every evaluated policy into one decision.
 */
export const mergeWorkspacePolicyVerdicts = (
    verdicts: IMpcWorkspacePolicyVerdict[],
): IMpcWorkspacePolicyEvaluation => {
    const denyReasons: string[] = [];
    const approvalReasons: string[] = [];
    let extraApprovals = 0;

    for (const verdict of verdicts) {
        if (verdict.decision === 'escalate') {
            approvalReasons.push(verdict.reason);
            extraApprovals = Math.max(
                extraApprovals,
                toInteger(verdict.params.extra_approvals, 1),
            );
        } else if (
            verdict.decision !== 'approve' &&
            verdict.decision !== 'notify'
        ) {
            // deny, and fail-closed for any unknown decision template.
            denyReasons.push(verdict.reason);
        }
    }

    return {
        verdicts,
        allowed: denyReasons.length === 0,
        requiresApproval: approvalReasons.length > 0,
        extraApprovals,
        denyReasons,
        approvalReasons,
    };
};

const emptyEvaluation = (): IMpcWorkspacePolicyEvaluation => ({
    verdicts: [],
    allowed: true,
    requiresApproval: false,
    extraApprovals: 0,
    denyReasons: [],
    approvalReasons: [],
});

/**
 * Evaluates every enabled workspace policy of the system against the request payload. Only transaction
 * requests are evaluated; other request types return an empty (allowing) evaluation.
 */
export const evaluateWorkspacePolicies = async (
    data: IMpcStoreData,
    system: IMpcStoreSystem,
    payload: MpcSignRequestPayload,
    history: IMpcSignRequest[],
    now = Date.now(),
): Promise<IMpcWorkspacePolicyEvaluation> => {
    if (payload.type !== 'transaction') {
        return emptyEvaluation();
    }

    const policies = listEnabledPoliciesForSystem(data, system);

    if (policies.length === 0) {
        return emptyEvaluation();
    }

    const context = buildWorkspacePolicyContext(
        payload.transaction,
        system.policy,
        history,
        now,
    );

    const verdicts = await Promise.all(
        policies.map(async (policy) => {
            // Policy blocks are inlined before the engine evaluates the flow.
            const expanded = expandPolicyReferences(
                data,
                system.workspaceId,
                policy.flow,
                policy.id,
            );

            return toWorkspacePolicyVerdict(
                policy,
                expanded.mapSimResult(
                    await mpcPolicyEngine.evaluate(expanded.flow, context),
                ),
            );
        }),
    );

    return mergeWorkspacePolicyVerdicts(verdicts);
};
