/**
 * Contracts of the policy engine (the `mpc-poc` backend: catalog, formal check and evaluation of decision-tree
 * policies). These mirror the engine's `rules-engine/catalog` flow format and `@ai-tx/sim` types; the app never
 * embeds the engine logic, it only renders the catalog and forwards flows / contexts to the engine API.
 */

/**
 * User-facing text of the engine catalog: plain string or bilingual `{ es, en }` object.
 */
export type MpcLocalizedText = string | { es: string; en: string };

export type MpcPolicyFlowNodeType = 'trigger' | 'condition' | 'action';

export type MpcPolicyFlowBranch = 'true' | 'false';

export interface IMpcPolicyFlowNode {
    /**
     * Unique id of the node inside the flow.
     */
    id: string;
    /**
     * Node type (exactly one trigger per flow; conditions branch, actions are leaves).
     */
    type: MpcPolicyFlowNodeType;
    /**
     * Catalog template id (conditions and actions only).
     */
    template?: string;
    /**
     * User-filled block parameters (amounts are decimal strings, never numbers).
     */
    params?: Record<string, unknown>;
}

export interface IMpcPolicyFlowEdge {
    /**
     * Source node id.
     */
    from: string;
    /**
     * Target node id.
     */
    to: string;
    /**
     * Branch of a condition; absent for the trigger edge.
     */
    branch?: MpcPolicyFlowBranch;
}

/**
 * A policy flow as exported by the editor and understood by the engine (decision tree).
 */
export interface IMpcPolicyFlow {
    /**
     * Flow format version (1).
     */
    flowVersion: number;
    /**
     * Optional name (plain or bilingual).
     */
    name?: MpcLocalizedText;
    nodes: IMpcPolicyFlowNode[];
    edges: IMpcPolicyFlowEdge[];
}

export interface IMpcPolicyCatalogParam {
    name: string;
    /**
     * Parameter type: enum | bool | int | duration | decimal | biguint | multiselect | whitelist_ref | ...
     */
    type: string;
    label?: MpcLocalizedText;
    help?: MpcLocalizedText;
    /**
     * Enum values are grouped by `kindFamilies` in the inspector when true.
     */
    grouped?: boolean;
    values?: Array<string | number>;
    min?: number;
    max?: number;
    default?: unknown;
    [key: string]: unknown;
}

export interface IMpcPolicyCatalogTemplate {
    id: string;
    version: number;
    label: MpcLocalizedText;
    description?: MpcLocalizedText;
    kind: 'condition' | 'action';
    class: 'deterministic' | 'effectful';
    /**
     * Conditions only: "proposal" (derived from the transaction) or "offchain" (external signed fact).
     */
    group?: 'proposal' | 'offchain';
    factSource?: string;
    factSourceNote?: MpcLocalizedText;
    techNote?: MpcLocalizedText;
    params: IMpcPolicyCatalogParam[];
    reads?: string[];
    [key: string]: unknown;
}

export interface IMpcPolicyCatalogGroup {
    label: MpcLocalizedText;
    description: MpcLocalizedText;
}

export interface IMpcPolicyKindFamilies {
    order: string[];
    families: Record<
        string,
        {
            label: MpcLocalizedText;
            description: MpcLocalizedText;
            risk?: string;
        }
    >;
    kinds: Record<
        string,
        {
            family: string;
            label: MpcLocalizedText;
            description: MpcLocalizedText;
        }
    >;
}

/**
 * Effective catalog served by the engine (disabled blocks already excluded).
 */
export interface IMpcPolicyCatalog {
    catalogVersion: number;
    groups: Record<string, IMpcPolicyCatalogGroup>;
    kindFamilies?: IMpcPolicyKindFamilies;
    conditions: IMpcPolicyCatalogTemplate[];
    actions: IMpcPolicyCatalogTemplate[];
    /**
     * Transparency map: every catalog id -> enabled on the engine.
     */
    blocksConfig: Record<string, boolean>;
}

export interface IMpcPolicyExample {
    index: number;
    name: MpcLocalizedText | null;
    /**
     * False when the example uses blocks disabled on the engine (not loadable).
     */
    available: boolean;
    missingBlocks: string[];
    /**
     * The flow, present only when available.
     */
    flow: IMpcPolicyFlow | null;
}

export type MpcPolicyScannerResult = 'safe' | 'suspicious' | 'malicious';

export type MpcPolicyActionOperation = 'call' | 'delegatecall';

/**
 * Materialized transaction context evaluated by the engine (mirrors `SimContext` of `@ai-tx/sim`).
 */
export interface IMpcPolicySimContext {
    /**
     * Native amount in wei (decimal string).
     */
    amount_wei: string;
    /**
     * Whether the destination is on the trusted list (the system recipient allowlist in this app).
     */
    dest_whitelisted: boolean;
    /**
     * Whether the system already sent a signed transaction to this destination.
     */
    dest_seen_before: boolean;
    /**
     * Unix seconds (UTC).
     */
    timestamp: number;
    /**
     * Security scanner verdict (stub in this POC: always "safe" at enforcement time).
     */
    scanner: MpcPolicyScannerResult;
    action_to?: string;
    action_value_wei?: string;
    action_data?: string;
    action_operation?: MpcPolicyActionOperation;
    /**
     * EIP-155 chain id of the transaction (chain_id block).
     */
    chain_id?: number;
    /**
     * ETH spent by the account in the rolling last 24 h INCLUDING this transaction, in wei (decimal string).
     * Must be >= amount_wei (daily_spent_threshold block).
     */
    daily_spent_wei?: string;
    /**
     * Whether the transaction carries calldata; derived from action_data when the action is present.
     */
    has_calldata?: boolean;
}

export type MpcPolicyDecisionTemplate =
    | 'approve'
    | 'escalate'
    | 'deny'
    | 'notify';

export interface IMpcPolicySimDecision {
    /**
     * Action template reached: approve | escalate | deny | notify.
     */
    template: MpcPolicyDecisionTemplate | string;
    params: Record<string, unknown>;
}

export interface IMpcPolicySimNodeResult {
    evaluated: true;
    result: boolean;
    took: MpcPolicyFlowBranch;
    note?: string;
}

/**
 * Result of evaluating one flow against one context (mirrors `SimResult` of `@ai-tx/sim`).
 */
export interface IMpcPolicySimResult {
    decision: IMpcPolicySimDecision;
    /**
     * Id of the action node reached, null when the flow fell into the default deny.
     */
    actionNodeId: string | null;
    /**
     * Node ids traversed, in order.
     */
    path: string[];
    nodeResults: Record<string, IMpcPolicySimNodeResult>;
    derived: {
        amount_gwei: string;
        weekday: number;
        hour: number;
        proposal_kind: string | null;
        selector: string | null;
        is_delegatecall: boolean | null;
        is_token_approval: boolean | null;
        approval_is_unlimited: boolean | null;
        erc20_amount: string | null;
        erc20_recipient: string | null;
        chain_id: number | null;
        daily_spent_gwei: string | null;
        has_calldata: boolean | null;
    };
}

export type MpcPolicyCheckIssueType = 'dead_branch' | 'collision' | 'gap';

export interface IMpcPolicyCheckIssue {
    type: MpcPolicyCheckIssueType;
    /**
     * Subtype (gap: "unconnected").
     */
    subtype?: string;
    severity: 'error' | 'warning';
    /**
     * Engine message (fallback; the UI generates its own wording from type / subtype).
     */
    message: string;
    nodes: string[];
    counterexample?: Record<string, unknown> | null;
}

/**
 * Result of the formal check (dead branches, collisions, gaps).
 */
export interface IMpcPolicyCheckResult {
    consistent: boolean;
    issues: IMpcPolicyCheckIssue[];
}
