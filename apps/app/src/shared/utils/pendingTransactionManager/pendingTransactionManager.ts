import { keccak256, stringToHex } from 'viem';
import { getTransactionReceipt, sendTransaction } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import {
    type IPendingTransactionFilter,
    type IPendingTransactionMeta,
    type IPendingTransactionState,
    type PendingTransactionListener,
    PendingTransactionStatus,
} from './pendingTransactionManager.api';

const STORAGE_KEY = 'aragon.pendingTransactions';

// Guard each stored entry's shape so one corrupt record can't throw and drop the whole hydrate pass.
const isStoredState = (value: unknown): value is IPendingTransactionState => {
    if (value == null || typeof value !== 'object' || !('status' in value)) {
        return false;
    }
    const { status } = value;
    return (
        typeof status === 'string' &&
        (Object.values(PendingTransactionStatus) as string[]).includes(status)
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
// the sign/reject promise outlives the dialog. Only SUBMITTED (broadcast, has a hash) records are
// mirrored to sessionStorage — a PENDING send can't be resumed without its live promise, so it is not
// persisted, and on reload persisted records are reconciled against the chain so settled ones self-clear.
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
                apply({ status: PendingTransactionStatus.SUBMITTED, hash }),
            )
            .catch((error: unknown) =>
                apply({ status: PendingTransactionStatus.FAILED, error }),
            );
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

    // Persist SUBMITTED records only: they carry a hash, so they can be resumed and reconciled after a
    // reload. A PENDING send has no hash and its live promise is gone on reload, so persisting it would
    // only create a dead ghost. JSON.stringify drops undefined fields, so records without meta stay
    // `{ status, hash }`. The promise and error aren't serializable and are omitted.
    private persist = (): void => {
        if (typeof sessionStorage === 'undefined') {
            return;
        }
        try {
            const stored = Object.fromEntries(
                [...this.states]
                    .filter(
                        ([, state]) =>
                            state.status === PendingTransactionStatus.SUBMITTED,
                    )
                    .map(([id, { status, hash, type, scope }]) => [
                        id,
                        { status, hash, type, scope },
                    ]),
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
            const stored: unknown = raw ? JSON.parse(raw) : {};
            if (stored == null || typeof stored !== 'object') {
                return;
            }
            for (const [id, state] of Object.entries(stored)) {
                // Only SUBMITTED records are persisted/restorable; ignore anything else defensively.
                if (
                    isStoredState(state) &&
                    state.status === PendingTransactionStatus.SUBMITTED
                ) {
                    this.states.set(id, state);
                    // Repopulate meta so a resumed action's later updates keep its type/scope.
                    if (state.type != null || state.scope != null) {
                        this.metas.set(id, {
                            type: state.type,
                            scope: state.scope,
                        });
                    }
                }
            }
        } catch {
            // start empty on unreadable storage
        }
        // A persisted SUBMITTED tx may already have mined while the tab was gone; reconcile so settled
        // ones self-clear instead of lingering as stale duplicate warnings.
        this.reconcile();
    };

    // Fire-and-forget: drop any hydrated SUBMITTED whose transaction is already mined. A still-pending
    // (receipt-not-found) tx is kept — it is genuinely in flight. Best-effort; a brief race where a
    // consumer reads a soon-to-be-cleared record is acceptable.
    private reconcile = (): void => {
        for (const [id, state] of this.states) {
            if (
                state.status !== PendingTransactionStatus.SUBMITTED ||
                state.hash == null
            ) {
                continue;
            }
            getTransactionReceipt(wagmiConfig, { hash: state.hash })
                .then(() => this.clear(id))
                .catch(() => {
                    // Not mined yet (or unreadable) — keep it as in-flight.
                });
        }
    };
}

export const pendingTransactionManager = new PendingTransactionManager();
