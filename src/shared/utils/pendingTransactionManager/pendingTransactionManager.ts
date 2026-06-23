import { keccak256, stringToHex } from 'viem';
import { sendTransaction } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import {
    type IPendingTransactionState,
    type PendingTransactionListener,
    PendingTransactionStatus,
} from './pendingTransactionManager.api';

const STORAGE_KEY = 'aragon.pendingTransactions';

// Stable id from the action's inputs (not its calldata, which embeds a now-relative end date).
// bigints aren't JSON-serializable, so stringify them.
export const buildIntentId = (parts: unknown): string =>
    keccak256(
        stringToHex(
            JSON.stringify(parts, (_key, value) =>
                typeof value === 'bigint' ? value.toString() : value,
            ),
        ),
    );

// Owns in-flight wallet sends keyed by intentId. Uses wagmi's core sendTransaction (not the hook) so
// the sign/reject promise outlives the dialog, and mirrors state to sessionStorage so it survives a
// reload too. Exported for tests; the app uses the shared `pendingTransactionManager` instance.
export class PendingTransactionManager {
    private states = new Map<string, IPendingTransactionState>();
    private listeners = new Set<PendingTransactionListener>();
    // Sends started this session have a live wallet promise; hydrated ones don't.
    private liveSends = new Set<string>();
    // Bumped on each send so a late resolution from a superseded send() is ignored.
    private attempts = new Map<string, number>();
    // Last request per intent, kept so a resumed dialog can re-send after a rejection.
    private requests = new Map<
        string,
        ITransactionRequest & { chainId: number }
    >();

    constructor() {
        this.hydrate();
    }

    send = (
        intentId: string,
        request: ITransactionRequest & { chainId: number },
    ): void => {
        this.requests.set(intentId, request);
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

    // The request to re-send when resuming an action whose dialog skipped prepare.
    getRequest = (
        intentId: string,
    ): (ITransactionRequest & { chainId: number }) | undefined =>
        this.requests.get(intentId);

    // PENDING with no live promise = reloaded mid-sign; outcome unknown, so the dialog starts fresh.
    isInterrupted = (intentId: string): boolean =>
        this.states.get(intentId)?.status ===
            PendingTransactionStatus.PENDING && !this.liveSends.has(intentId);

    clear = (intentId: string): void => {
        this.liveSends.delete(intentId);
        this.attempts.delete(intentId);
        this.requests.delete(intentId);
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
        // A PENDING update is a this-session send, so its outcome is awaited here (not interrupted).
        if (state.status === PendingTransactionStatus.PENDING) {
            this.liveSends.add(intentId);
        }
        this.states.set(intentId, state);
        this.persist();
        this.emit(intentId, state);
    };

    private emit = (
        intentId?: string,
        state?: IPendingTransactionState,
    ): void => {
        for (const listener of this.listeners) {
            listener(intentId, state);
        }
    };

    // Persist status + hash only (the promise and error aren't serializable).
    private persist = (): void => {
        if (typeof sessionStorage === 'undefined') {
            return;
        }
        try {
            const stored = Object.fromEntries(
                [...this.states].map(([id, { status, hash }]) => [
                    id,
                    { status, hash },
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
            const stored = raw
                ? (JSON.parse(raw) as Record<string, IPendingTransactionState>)
                : {};
            const valid = Object.values(PendingTransactionStatus);
            for (const [id, state] of Object.entries(stored)) {
                // Ignore a status written by an older build that no longer exists.
                if (valid.includes(state.status)) {
                    this.states.set(id, state);
                }
            }
        } catch {
            // start empty on unreadable storage
        }
    };
}

export const pendingTransactionManager = new PendingTransactionManager();
