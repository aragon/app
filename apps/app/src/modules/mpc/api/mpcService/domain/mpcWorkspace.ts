import type { IMpcPolicyCheckResult, IMpcPolicyFlow } from './mpcPolicyFlow';

export type MpcWorkspaceMemberRole = 'owner' | 'member';

export interface IMpcWorkspaceMember {
    /**
     * User id of the member.
     */
    userId: string;
    /**
     * Username of the member.
     */
    username: string;
    /**
     * Role in the workspace: the owner manages policies and members; members see the workspace, its systems
     * (as implicit viewers) and its policies.
     */
    role: MpcWorkspaceMemberRole;
    /**
     * Timestamp the member was added (ISO 8601).
     */
    addedAt: string;
}

/**
 * A workspace groups MPC systems and holds the transaction policies enforced on all of them. Accounts create
 * workspaces explicitly (an account with no workspace only sees the "create workspace" option) and invite
 * other accounts as members.
 */
export interface IMpcWorkspace {
    /**
     * Unique identifier of the workspace.
     */
    id: string;
    /**
     * Human readable name.
     */
    name: string;
    /**
     * User id of the owner (the only member who can edit policies).
     */
    ownerId: string;
    /**
     * Whether this workspace was created automatically for legacy data (systems that predate workspaces).
     */
    isDefault: boolean;
    /**
     * Members (the owner included).
     */
    members: IMpcWorkspaceMember[];
    /**
     * Creation timestamp (ISO 8601).
     */
    createdAt: string;
    /**
     * Last update timestamp (ISO 8601).
     */
    updatedAt: string;
}

/**
 * Last formal check stored with a workspace policy.
 */
export interface IMpcWorkspacePolicyCheck extends IMpcPolicyCheckResult {
    /**
     * Timestamp of the check (ISO 8601).
     */
    at: string;
}

/**
 * A workspace-level transaction policy: a decision-tree flow authored in the policy editor, verified by the
 * policy engine and enforced by the co-signer on every transaction request of the workspace systems.
 */
export interface IMpcWorkspacePolicy {
    /**
     * Unique identifier of the policy.
     */
    id: string;
    /**
     * Workspace the policy belongs to.
     */
    workspaceId: string;
    /**
     * Human readable name.
     */
    name: string;
    /**
     * The flow (decision tree) as exported by the editor.
     */
    flow: IMpcPolicyFlow;
    /**
     * Whether the policy is enforced on transaction requests. Only verified policies can be enabled.
     */
    enabled: boolean;
    /**
     * Result of the formal check run when the flow was saved (policies are only saved when the check passes).
     */
    lastCheck: IMpcWorkspacePolicyCheck;
    /**
     * User id of the creator.
     */
    createdBy: string;
    /**
     * Creation timestamp (ISO 8601).
     */
    createdAt: string;
    /**
     * Last update timestamp (ISO 8601).
     */
    updatedAt: string;
}

/**
 * Verdict of one workspace policy for one transaction request (recorded in the request policy decision).
 */
export interface IMpcWorkspacePolicyVerdict {
    /**
     * Id of the policy.
     */
    policyId: string;
    /**
     * Name of the policy at evaluation time.
     */
    policyName: string;
    /**
     * Decision template reached by the flow: approve | escalate | deny | notify.
     */
    decision: string;
    /**
     * Parameters of the decision (e.g. extra_approvals / delay_seconds for escalate).
     */
    params: Record<string, unknown>;
    /**
     * Whether the flow fell into the default deny (no action reached).
     */
    isDefaultDeny: boolean;
    /**
     * Node ids traversed by the evaluation, in order (for display / debugging).
     */
    path: string[];
    /**
     * Human readable explanation.
     */
    reason: string;
}
