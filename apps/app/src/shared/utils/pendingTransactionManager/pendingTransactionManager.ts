import { type Hex, isHex, keccak256, stringToHex } from 'viem';
import { getTransactionReceipt, sendTransaction } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { isRecord } from '@/shared/api/safeService/domain/safeDomainUtils';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import {
    type IPendingTransactionFilter,
    type IPendingTransactionMeta,
    type IPendingTransactionState,
    type PendingTransactionListener,
    PendingTransactionStatus,
} from './pendingTransactionManager.api';

const STORAGE_KEY = 'aragon.pendingTransactions';

// Persisted records older than this are dropped on hydrate: a transaction unconfirmed for this long
// will realistically never confirm, and keeping its record would feed resume flows and duplicate
// warnings forever. Records without a broadcast timestamp (persisted before it existed) are treated
// as expired for the same reason — their age is unknown.
const submittedRecordTtl = 24 * 60 * 60 * 1000;

// Guard each stored entry's shape so one corrupt record can't throw and drop the whole hydrate pass.
// Recovery records are stricter because they are caller-managed and must retain enough chain identity
// to reconcile without ever falling back to a blind resend.
const isStoredState = (value: unknown): value is IPendingTransactionState => {
    if (
        value == null ||
        typeof value !== 'object' ||
        Array.isArray(value) ||
        !('status' in value)
    ) {
        return false;
    }

    const state = value as Record<string, unknown>;
    const status = state.status;
    if (
        typeof status !== 'string' ||
        !(Object.values(PendingTransactionStatus) as string[]).includes(status)
    ) {
        return false;
    }

    if (!('recovery' in state)) {
        return true;
    }

    const recovery = state.recovery;
    if (
        recovery == null ||
        typeof recovery !== 'object' ||
        Array.isArray(recovery)
    ) {
        return false;
    }

    const hasRecoverySubmissionCore =
        typeof state.chainId === 'number' &&
        Number.isSafeInteger(state.chainId) &&
        state.chainId > 0 &&
        typeof state.submittedAt === 'number' &&
        Number.isFinite(state.submittedAt) &&
        state.submittedAt >= 0;

    if (
        status === PendingTransactionStatus.FAILED ||
        !hasRecoverySubmissionCore
    ) {
        return false;
    }

    return (
        status !== PendingTransactionStatus.SUBMITTED ||
        (typeof state.hash === 'string' &&
            isHex(state.hash) &&
            state.hash.length === 66)
    );
};

// Stable id from an action's inputs. bigints aren't JSON-serializable, so stringify them.
export const buildIntentId = (parts: unknown): string =>
    keccak256(
        stringToHex(
            JSON.stringify(parts, (_key, value) =>
                typeof value === 'bigint' ? value.toString() : value,
            ),
        ),
    );

// Owns in-flight wallet sends keyed by intentId, via wagmi's core sendTransaction (not the hook) so
// the sign/reject promise outlives the dialog. SUBMITTED records and caller-managed uncertain PENDING
// records are mirrored to sessionStorage; a generic PENDING send can't be resumed without its live
// promise, so it is not persisted. Generic persisted records self-clear after receipt reconciliation;
// caller-managed recovery records stay until their owning flow explicitly acknowledges them.
export class PendingTransactionManager {
    private states = new Map<string, IPendingTransactionState>();
    private listeners = new Set<PendingTransactionListener>();
    // Bumped on each send so a late resolution from a superseded send() is ignored.
    private attempts = new Map<string, number>();
    // Last request per intent, kept so a resumed dialog can re-send after a rejection.
    private requests = new Map<
        string,
        ITransactionRequest & { chainId: number }
    >();
    // Optional type/scope per intent, merged into state so it survives every status update and a reload.
    private metas = new Map<string, IPendingTransactionMeta>();

    constructor() {
        this.hydrate();
    }

    send = (
        intentId: string,
        request: ITransactionRequest & { chainId: number },
        meta?: IPendingTransactionMeta,
    ): void => {
        this.requests.set(intentId, request);
        // Only set on an explicit meta so a resend (no meta) keeps the original type/scope.
        if (meta != null) {
            this.metas.set(intentId, meta);
        }
        const attempt = (this.attempts.get(intentId) ?? 0) + 1;
        this.attempts.set(intentId, attempt);
        this.update(intentId, { status: PendingTransactionStatus.PENDING });

        // Ignore a resolution from an earlier send() that lands after a newer one for this action.
        const apply = (state: IPendingTransactionState) => {
            if (this.attempts.get(intentId) === attempt) {
                this.update(intentId, state);
            }
        };

        sendTransaction(wagmiConfig, request)
            .then((hash) =>
                apply({
                    status: PendingTransactionStatus.SUBMITTED,
                    hash,
                    submittedAt: Date.now(),
                    chainId: request.chainId,
                }),
            )
            .catch((error: unknown) =>
                apply({ status: PendingTransactionStatus.FAILED, error }),
            );
    };

    /**
     * Mirrors a hash that was broadcast by a caller-owned flow. Unlike `send`, this never submits
     * anything and deliberately keeps no request that could be used for a blind resend.
     */
    registerSubmitted = (
        intentId: string,
        submission: {
            hash: Hex;
            chainId: number;
            submittedAt?: number;
        },
        meta?: IPendingTransactionMeta,
    ): void => {
        this.attempts.set(intentId, (this.attempts.get(intentId) ?? 0) + 1);
        this.requests.delete(intentId);
        if (meta != null) {
            this.metas.set(intentId, meta);
        }
        this.update(intentId, {
            status: PendingTransactionStatus.SUBMITTED,
            hash: submission.hash,
            submittedAt: submission.submittedAt ?? Date.now(),
            chainId: submission.chainId,
        });
    };

    /**
     * Records an ambiguous caller-owned send without a hash. The recovery context makes the record
     * durable, while the missing hash forces the owning flow to resolve the outcome before retrying.
     * This never submits anything and deliberately keeps no request that could be used for a blind
     * resend.
     */
    registerSubmissionUncertain = (
        intentId: string,
        submission: {
            chainId: number;
            submittedAt?: number;
        },
        meta: IPendingTransactionMeta & {
            recovery: Record<string, unknown>;
        },
    ): void => {
        this.attempts.set(intentId, (this.attempts.get(intentId) ?? 0) + 1);
        this.requests.delete(intentId);
        this.metas.set(intentId, meta);
        this.update(intentId, {
            status: PendingTransactionStatus.PENDING,
            submittedAt: submission.submittedAt ?? Date.now(),
            chainId: submission.chainId,
        });
    };

    get = (intentId: string): IPendingTransactionState | undefined =>
        this.states.get(intentId);

    // Active (PENDING/SUBMITTED) records, optionally narrowed by type/scope and excluding one intent.
    // Used to warn before starting a second action that would duplicate one already in flight.
    getActive = (
        filter?: IPendingTransactionFilter,
    ): [string, IPendingTransactionState][] =>
        [...this.states].filter(([id, state]) => {
            const isActive =
                state.status === PendingTransactionStatus.PENDING ||
                state.status === PendingTransactionStatus.SUBMITTED;

            return (
                isActive &&
                (filter?.excludeIntentId == null ||
                    id !== filter.excludeIntentId) &&
                (filter?.type == null || state.type === filter.type) &&
                (filter?.scope == null || state.scope === filter.scope)
            );
        });

    // The request to re-send when resuming an action whose dialog skipped prepare.
    getRequest = (
        intentId: string,
    ): (ITransactionRequest & { chainId: number }) | undefined =>
        this.requests.get(intentId);

    // Clear every active (PENDING/SUBMITTED) record matching the filter — the same predicate as
    // getActive. Used to supersede in-flight actions the user has explicitly chosen to replace
    // (e.g. "Publish again"); pass excludeIntentId to keep the action that is about to run.
    clearActive = (filter?: IPendingTransactionFilter): void => {
        for (const [id] of this.getActive(filter)) {
            this.clear(id);
        }
    };

    clear = (intentId: string): void => {
        this.attempts.delete(intentId);
        this.requests.delete(intentId);
        this.metas.delete(intentId);
        if (this.states.delete(intentId)) {
            this.persist();
            this.emit(intentId);
        }
    };

    subscribe = (listener: PendingTransactionListener): (() => void) => {
        this.listeners.add(listener);

        return () => {
            this.listeners.delete(listener);
        };
    };

    private update = (
        intentId: string,
        state: IPendingTransactionState,
    ): void => {
        // Merge retained meta so type/scope survive every status transition and the persisted mirror.
        const meta = this.metas.get(intentId);
        const nextState = meta != null ? { ...state, ...meta } : state;
        this.states.set(intentId, nextState);
        this.persist();
        this.emit(intentId, nextState);
    };

    private emit = (
        intentId?: string,
        state?: IPendingTransactionState,
    ): void => {
        for (const listener of this.listeners) {
            listener(intentId, state);
        }
    };

    // Persist SUBMITTED records and caller-managed PENDING recovery records. SUBMITTED records carry a
    // hash, so they can be resumed and reconciled after a reload. A generic PENDING send has no hash
    // and its live promise is gone on reload, so persisting it would only create a dead ghost.
    // JSON.stringify drops undefined fields, so records without meta stay
    // `{ status, hash, submittedAt, chainId }`. Caller-managed `recovery` context is persisted as-is;
    // its Safe-specific fields are validated by the consuming flow before use.
    private persist = (): void => {
        if (typeof sessionStorage === 'undefined') {
            return;
        }
        try {
            const stored = Object.fromEntries(
                [...this.states]
                    .filter(
                        ([, state]) =>
                            state.status ===
                                PendingTransactionStatus.SUBMITTED ||
                            (state.status ===
                                PendingTransactionStatus.PENDING &&
                                state.recovery != null),
                    )
                    .map(
                        ([
                            id,
                            {
                                status,
                                hash,
                                submittedAt,
                                chainId,
                                type,
                                scope,
                                recovery,
                            },
                        ]) => [
                            id,
                            {
                                status,
                                hash,
                                submittedAt,
                                chainId,
                                type,
                                scope,
                                recovery,
                            },
                        ],
                    ),
            );
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        } catch {
            // best-effort; in-memory state still works
        }
    };

    private hydrate = (): void => {
        if (typeof sessionStorage === 'undefined') {
            return;
        }
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            const parsed: unknown = raw ? JSON.parse(raw) : {};
            const stored: Record<string, unknown> = isRecord(parsed)
                ? parsed
                : {};
            for (const [id, state] of Object.entries(stored)) {
                if (!isStoredState(state)) {
                    continue;
                }

                const isCallerManagedRecovery = state.recovery != null;
                const canRestoreSubmitted =
                    state.status === PendingTransactionStatus.SUBMITTED &&
                    state.submittedAt != null &&
                    (isCallerManagedRecovery ||
                        Date.now() - state.submittedAt <= submittedRecordTtl);
                const canRestoreUncertain =
                    state.status === PendingTransactionStatus.PENDING &&
                    isCallerManagedRecovery;

                if (!canRestoreSubmitted && !canRestoreUncertain) {
                    continue;
                }

                this.states.set(id, state);
                // Repopulate all metadata so resumed updates keep their identity and recovery.
                if (
                    state.type != null ||
                    state.scope != null ||
                    state.recovery != null
                ) {
                    this.metas.set(id, {
                        type: state.type,
                        scope: state.scope,
                        recovery: state.recovery,
                    });
                }
            }
        } catch {
            // start empty on unreadable storage
        }
        // Rewrite the mirror so records dropped above are removed from storage as well.
        this.persist();
        // Persisted SUBMITTED records may already have mined while the tab was gone; reconcile so
        // settled generic records self-clear instead of lingering as stale duplicate warnings.
        this.reconcile();
    };

    // Fire-and-forget: drop any hydrated generic SUBMITTED whose transaction is already mined. A
    // still-pending (receipt-not-found) tx is kept — it is genuinely in flight. Caller-managed
    // recovery records, including uncertain PENDING submissions, are intentionally skipped; their
    // owner must classify and acknowledge them explicitly.
    // Best-effort; a brief race where a consumer reads a soon-to-be-cleared record is acceptable. The
    // lookup is pinned to the record's broadcast chain — the wallet's current chain may be a different
    // one after a reload.
    private reconcile = (): void => {
        for (const [id, state] of this.states) {
            if (
                state.status !== PendingTransactionStatus.SUBMITTED ||
                state.hash == null ||
                state.recovery != null
            ) {
                continue;
            }
            getTransactionReceipt(wagmiConfig, {
                hash: state.hash,
                chainId: state.chainId,
            })
                .then(() => this.clear(id))
                .catch(() => {
                    // Not mined yet (or unreadable) — keep it as in-flight.
                });
        }
    };
}

export const pendingTransactionManager = new PendingTransactionManager();
