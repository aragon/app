import type { ISafeConfirmation } from './safeConfirmation';
import { isSafeConfirmation } from './safeConfirmation';
import { isRecord, isUnsignedIntegerString } from './safeDomainUtils';

/**
 * One Aragon proposal a queued Safe transaction's calldata reports to.
 */
export interface IAragonProposalReport {
    /**
     * Composite `${network}-${daoAddress}`, the form `useDao` is keyed by.
     */
    daoId: string;
    /**
     * Address of the reporting plugin the call targets, not the Safe.
     */
    bodyId: string;
    /**
     * Backend `incrementalId` of the proposal, not the contract's uint256 proposal id.
     */
    proposalId: number;
    /**
     * Stage the report addresses, as encoded in the calldata. The backend sends the on-chain
     * `uint16` stage index as a number, not a string.
     */
    stageId: number;
    /**
     * Result the call would write if executed. Never a governance outcome: the transaction may
     * never execute, or land after the stage advanced.
     */
    resultType: number;
}

export const isAragonProposalReport = (
    value: unknown,
): value is IAragonProposalReport =>
    isRecord(value) &&
    typeof value.daoId === 'string' &&
    typeof value.bodyId === 'string' &&
    typeof value.proposalId === 'number' &&
    Number.isInteger(value.proposalId) &&
    typeof value.stageId === 'number' &&
    Number.isInteger(value.stageId) &&
    typeof value.resultType === 'number';

export interface ISafeMultisigTransaction {
    /**
     * Decimal-string nonce the transaction will consume. Safe nonces are strictly sequential, so
     * a transaction is only live while `BigInt(nonce) >= BigInt(ISafeInfo.nonce)`.
     */
    nonce: string;
    /**
     * Hash identifying the transaction within the Safe.
     */
    safeTxHash: string;
    /**
     * Address that proposed the transaction.
     */
    from: string | null;
    /**
     * Target address of the transaction.
     */
    to: string;
    /**
     * Native value transferred by the transaction, as a decimal string.
     */
    value: string;
    /**
     * Calldata of the transaction, or null for a plain value transfer.
     */
    data: string | null;
    /**
     * Call type: 0 for `CALL`, 1 for `DELEGATECALL`.
     */
    operation: 0 | 1;
    safeTxGas: string;
    baseGas: string;
    gasPrice: string;
    gasToken: string;
    refundReceiver: string;
    /**
     * Owner confirmations collected so far.
     */
    confirmations: ISafeConfirmation[];
    /**
     * Confirmations the service reports as required for this transaction. Not bound at proposal
     * time: upstream derives it from the Safe status at `(safe, nonce)` — the threshold when the
     * transaction was mined — falling back to the Safe's latest status and finally to the number
     * of indexed confirmations. So it is the best available record of the threshold that applied,
     * but it is service-derived rather than immutable, and the last fallback can equal the
     * confirmation count rather than a real threshold.
     */
    confirmationsRequired: number;
    /**
     * Packed signature blob. Null until the transaction is executed — pending transactions expose
     * `confirmations` instead.
     */
    signatures: string | null;
    /**
     * Whether the transaction has been executed onchain.
     */
    isExecuted: boolean;
    /**
     * Whether execution succeeded, or null while the transaction has not executed. A failed
     * execution still consumes the nonce.
     */
    isSuccessful: boolean | null;
    /**
     * ISO date the transaction was submitted.
     */
    submissionDate: string;
    /**
     * ISO date the transaction executed. Absent while it is queued - the backend omits both
     * executed-only fields rather than sending them null.
     */
    executionDate?: string;
    /**
     * Hash of the onchain transaction that executed this Safe transaction. Absent while queued.
     *
     * This is the only durable handle on a settled report: the indexed body result carries no
     * transaction hash, so provenance is unrecoverable without it.
     */
    transactionHash?: string;
    /**
     * Aragon proposals this transaction's calldata reports to, when the backend recognised and
     * correlated them. One entry per decoded `reportProposalResult` call, in calldata order, so a
     * MultiSend reporting to several proposals carries several entries and duplicates are kept.
     *
     * States what the calldata *says*, never provenance: the backend gates each entry on the Safe
     * being a body of that plugin's active setting, which blocks cross-DAO spoofing but not a body
     * naming any proposal under that same plugin.
     *
     * Three states, not two (app-backend#1574):
     *
     * - **absent** — the calldata is not a recognised report;
     * - **`[]`** — reports decoded but none resolved: not yet indexed, refused by the body check,
     *   or the correlation read failed. A failed read degrades to `[]`, never to silence;
     * - **populated** — resolved.
     *
     * So absence is no information, while `[]` is information: this *is* a governance report whose
     * target could not be identified. Collapsing the two renders a report as an anonymous payload.
     *
     * Backend-pinned guarantees this app relies on: entries arrive in calldata (MultiSend) order,
     * duplicates are preserved rather than collapsed — a batch reporting the same proposal twice
     * with conflicting `resultType` stays visible — and `daoId` is resolved per entry, so no DAO
     * context may be hoisted to the row or the page.
     *
     * Entries can span different DAOs: a Safe reused as a body in two processes produces one row
     * whose links point into two DAOs, so each entry resolves its own DAO.
     */
    aragonReports?: IAragonProposalReport[];
}

export const isSafeMultisigTransaction = (
    value: unknown,
): value is ISafeMultisigTransaction =>
    isRecord(value) &&
    isUnsignedIntegerString(value.nonce) &&
    typeof value.safeTxHash === 'string' &&
    (typeof value.from === 'string' || value.from === null) &&
    typeof value.to === 'string' &&
    // Every field below that reaches `BigInt(...)` while hashing the EIP-712 envelope is validated
    // as an unsigned integer string here, not at each parse site: a non-numeric one would
    // otherwise throw out of hashing and surface as a generic failure instead of a refusal.
    isUnsignedIntegerString(value.value) &&
    (typeof value.data === 'string' || value.data === null) &&
    (value.operation === 0 || value.operation === 1) &&
    isUnsignedIntegerString(value.safeTxGas) &&
    isUnsignedIntegerString(value.baseGas) &&
    isUnsignedIntegerString(value.gasPrice) &&
    typeof value.gasToken === 'string' &&
    typeof value.refundReceiver === 'string' &&
    Array.isArray(value.confirmations) &&
    value.confirmations.every(isSafeConfirmation) &&
    typeof value.confirmationsRequired === 'number' &&
    Number.isInteger(value.confirmationsRequired) &&
    value.confirmationsRequired > 0 &&
    (typeof value.signatures === 'string' || value.signatures === null) &&
    typeof value.isExecuted === 'boolean' &&
    (typeof value.isSuccessful === 'boolean' || value.isSuccessful === null) &&
    typeof value.submissionDate === 'string' &&
    (value.executionDate === undefined ||
        typeof value.executionDate === 'string') &&
    (value.transactionHash === undefined ||
        typeof value.transactionHash === 'string');
// `aragonReports` is deliberately NOT asserted here. This guard gates the whole queue response
// through `isSafePaginatedResponse`, so rejecting a malformed correlation would take every row
// down with it - losing the signing surface to protect a link. Entries are validated where they
// are rendered instead, so a bad one costs only itself.
