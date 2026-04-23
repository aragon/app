'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { CapitalFlowDialogId } from '@/modules/capitalFlow/constants/capitalFlowDialogId';
import type {
    IDispatchSimulationDialogParams,
    IDispatchTransactionDialogParams,
} from '@/modules/capitalFlow/dialogs/dispatchDialog';
import type { Network } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { getMockFlowData } from '../mocks/mockFlowData';
import type { IFlowDaoData } from '../types';
import { useEnvioFlowData } from './useEnvioFlowData';

const TOAST_DURATION_MS = 4000;
/**
 * If the indexer hasn't surfaced a dispatch within this window we give up on the
 * optimistic "pending" state and tell the user to refresh manually — otherwise the
 * badge could sit forever if Envio fell behind.
 */
const PENDING_DISPATCH_TIMEOUT_MS = 60_000;

export interface IFlowToast {
    id: string;
    tone: 'success' | 'info' | 'error' | 'warning';
    title: string;
    description?: string;
}

/**
 * One entry per "in-flight" dispatch: the user signed the tx, the wallet returned a
 * hash, but the indexer hasn't yet produced an execution we can render. We keep this
 * outside `data` so the Envio snapshot stays the source of truth for everything else.
 */
export interface IFlowPendingDispatch {
    policyId: string;
    policyAddress: string;
    policyName: string;
    txHash: string;
    startedAt: number;
}

export interface IFlowDataContext {
    data: IFlowDaoData;
    /**
     * `true` while the Envio-backed snapshot is still being resolved. Consumers
     * that render data-coupled UI (policy detail page, recipient detail page)
     * should show a skeleton instead of "not found" until this flips to false.
     * Always `false` when the Envio feature flag is off (mock-only mode).
     */
    isEnvioLoading: boolean;
    /** `true` once we've swapped the mock snapshot for the live Envio one. */
    hasEnvioData: boolean;
    /**
     * Broadcasts a real on-chain `dispatch()` transaction via the shared
     * `DispatchTransactionDialog`. The flow page's `ConfirmDispatchDialog` calls
     * this after the user reviews the pending amount + recipients.
     *
     * Intended flow:
     * 1. Close the review dialog (dialog stack replace).
     * 2. User signs the tx in their wallet.
     * 3. Once a receipt arrives we push an entry onto `pendingDispatches` and
     *    flip the indexer to urgent polling — the UI shows a "waiting for
     *    indexer" badge until a matching `txHash` appears in Envio.
     */
    dispatchPolicy: (policyId: string) => void;
    /** All in-flight dispatches, keyed by policy id. */
    pendingDispatches: IFlowPendingDispatch[];
    /**
     * Convenience lookup used by cards / detail pages to decide whether to render
     * the "waiting for indexer" badge. Returns the pending entry if the policy has
     * an unresolved dispatch, otherwise `undefined`.
     */
    getPendingDispatch: (policyId: string) => IFlowPendingDispatch | undefined;
    toasts: IFlowToast[];
    dismissToast: (id: string) => void;
}

const FlowDataContext = createContext<IFlowDataContext | null>(null);

export interface IFlowDataProviderProps {
    network: string;
    addressOrEns: string;
    /**
     * DAO identifier (e.g. `ethereum-sepolia-0xabc…`) — required when the
     * `NEXT_PUBLIC_FLOW_USE_ENVIO` flag is on so the provider can resolve DAO
     * metadata + linked accounts via the REST API. Falls back to mock data
     * when the flag is off or the indexer query fails.
     */
    daoId?: string;
    children?: ReactNode;
}

export const FlowDataProvider: React.FC<IFlowDataProviderProps> = (props) => {
    const { network, addressOrEns, daoId, children } = props;

    const [pendingDispatches, setPendingDispatches] = useState<
        IFlowPendingDispatch[]
    >([]);

    const envioResult = useEnvioFlowData({
        network,
        addressOrEns,
        daoId: daoId ?? '',
        isUrgent: pendingDispatches.length > 0,
    });

    const [data, setData] = useState<IFlowDaoData>(() =>
        getMockFlowData(network, addressOrEns),
    );
    const [hasEnvioData, setHasEnvioData] = useState(false);
    const [toasts, setToasts] = useState<IFlowToast[]>([]);

    const queryClient = useQueryClient();
    const { open } = useDialogContext();
    const { check: checkWalletConnected } = useConnectedWalletGuard();

    useEffect(() => {
        if (envioResult.enabled) {
            return;
        }
        setData(getMockFlowData(network, addressOrEns));
        setHasEnvioData(false);
    }, [envioResult.enabled, network, addressOrEns]);

    useEffect(() => {
        if (!envioResult.enabled) {
            return;
        }
        if (envioResult.data) {
            setData(envioResult.data);
            setHasEnvioData(true);
        }
    }, [envioResult.enabled, envioResult.data]);

    useEffect(() => {
        if (envioResult.enabled && envioResult.isError) {
            // biome-ignore lint/suspicious/noConsole: surface Envio query failures to aid debugging
            console.warn(
                '[FlowDataProvider] Envio query failed, keeping previous snapshot.',
                envioResult.error,
            );
        }
    }, [envioResult.enabled, envioResult.isError, envioResult.error]);

    const pushToast = useCallback((toast: Omit<IFlowToast, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const entry: IFlowToast = { id, ...toast };
        setToasts((current) => [...current, entry]);
        setTimeout(() => {
            setToasts((current) => current.filter((t) => t.id !== id));
        }, TOAST_DURATION_MS);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((current) => current.filter((t) => t.id !== id));
    }, []);

    /**
     * Keep the latest rest policies + network in a ref so we can read them from the
     * `dispatchPolicy` callback without invalidating its identity every time the
     * REST query refetches.
     */
    const restPoliciesRef = useRef(envioResult.restPolicies);
    useEffect(() => {
        restPoliciesRef.current = envioResult.restPolicies;
    }, [envioResult.restPolicies]);

    const dataRef = useRef(data);
    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    const indexerQueryKey = envioResult.indexerQueryKey;
    const indexerQueryKeyRef = useRef(indexerQueryKey);
    useEffect(() => {
        indexerQueryKeyRef.current = indexerQueryKey;
    }, [indexerQueryKey]);

    const markDispatchPending = useCallback(
        (entry: Omit<IFlowPendingDispatch, 'startedAt'>) => {
            const startedAt = Date.now();
            setPendingDispatches((current) => {
                const deduped = current.filter(
                    (p) =>
                        p.txHash.toLowerCase() !== entry.txHash.toLowerCase(),
                );
                return [...deduped, { ...entry, startedAt }];
            });

            // Kick the indexer ahead of the next urgent tick so there's no perceived
            // lag between "tx confirmed in wallet" and "waiting for indexer" badge.
            if (indexerQueryKeyRef.current) {
                void queryClient.invalidateQueries({
                    queryKey: indexerQueryKeyRef.current,
                });
            }

            pushToast({
                tone: 'info',
                title: 'Dispatch submitted',
                description: `${entry.policyName} — waiting for the indexer to pick it up.`,
            });
        },
        [pushToast, queryClient],
    );

    const dispatchPolicy = useCallback(
        (policyId: string) => {
            const currentData = dataRef.current;
            // Orchestrators live on their own list but, on-chain, a multi-dispatch
            // plugin exposes the same `dispatch()` entrypoint as a leaf router,
            // so the same transaction dialog works for both. Resolve leaf first,
            // then fall back to orchestrator — ids are unique across both lists.
            const flowPolicy =
                currentData.policies.find((p) => p.id === policyId) ??
                currentData.orchestrators.find((o) => o.id === policyId);

            if (flowPolicy == null) {
                pushToast({
                    tone: 'error',
                    title: 'Policy not available',
                    description:
                        'Refresh the page and try again — the indexer snapshot is out of sync.',
                });
                return;
            }

            const restPolicies = restPoliciesRef.current;
            const matchingRestPolicy = restPolicies.find(
                (p) =>
                    p.address.toLowerCase() ===
                    flowPolicy.address.toLowerCase(),
            );

            if (matchingRestPolicy == null) {
                pushToast({
                    tone: 'error',
                    title: 'Dispatch unavailable',
                    description:
                        'Policy metadata is still indexing. Try again in a minute.',
                });
                return;
            }

            const typedNetwork = network as Network;
            const onDispatchSuccess: IDispatchTransactionDialogParams['onDispatchSuccess'] =
                ({ txHash }) => {
                    markDispatchPending({
                        policyId: flowPolicy.id,
                        policyAddress: flowPolicy.address,
                        policyName: flowPolicy.name,
                        txHash,
                    });
                };

            // Mirror the `DispatchPanel` (transactions page) route so manual
            // Flow dispatches go through the same review → simulate → sign
            // wizard: show the Tenderly simulation first when the network
            // supports it, and fall back to opening the transaction dialog
            // directly on networks where Tenderly isn't wired in.
            const supportsTenderly =
                networkDefinitions[typedNetwork]?.tenderlySupport ?? false;

            // `DispatchTransactionDialog` invariants on a connected wallet,
            // so route unconnected users through the connect-wallet dialog
            // first and only open the dispatch flow once they're connected.
            checkWalletConnected({
                onSuccess: () => {
                    if (supportsTenderly) {
                        const simulationParams: IDispatchSimulationDialogParams =
                            {
                                policy: matchingRestPolicy,
                                network: typedNetwork,
                                onDispatchSuccess,
                            };
                        open(CapitalFlowDialogId.DISPATCH_SIMULATION, {
                            params: simulationParams,
                        });
                        return;
                    }

                    const txParams: IDispatchTransactionDialogParams = {
                        policy: matchingRestPolicy,
                        network: typedNetwork,
                        onDispatchSuccess,
                    };
                    open(CapitalFlowDialogId.DISPATCH_TRANSACTION, {
                        params: txParams,
                    });
                },
            });
        },
        [network, open, pushToast, markDispatchPending, checkWalletConnected],
    );

    // Resolve pending dispatches whose tx hash has landed in the Envio snapshot.
    useEffect(() => {
        if (pendingDispatches.length === 0) {
            return;
        }
        const indexedHashes = new Set<string>();
        for (const policy of data.policies) {
            for (const dispatch of policy.dispatches) {
                if (dispatch.txHash) {
                    indexedHashes.add(dispatch.txHash.toLowerCase());
                }
            }
        }

        const resolved: IFlowPendingDispatch[] = [];
        const stillPending: IFlowPendingDispatch[] = [];
        for (const pending of pendingDispatches) {
            if (indexedHashes.has(pending.txHash.toLowerCase())) {
                resolved.push(pending);
            } else {
                stillPending.push(pending);
            }
        }

        if (resolved.length === 0) {
            return;
        }

        setPendingDispatches(stillPending);
        for (const pending of resolved) {
            pushToast({
                tone: 'success',
                title: 'Dispatch confirmed',
                description: `${pending.policyName} is now reflected in the feed.`,
            });
        }
    }, [data.policies, pendingDispatches, pushToast]);

    // Hard timeout — if the indexer is unusually far behind, stop spinning and tell
    // the operator to come back later. We run a single interval while any pending
    // entry exists; no interval when the queue is empty.
    useEffect(() => {
        if (pendingDispatches.length === 0) {
            return;
        }

        const intervalId = setInterval(() => {
            const now = Date.now();
            setPendingDispatches((current) => {
                const timedOut = current.filter(
                    (p) => now - p.startedAt > PENDING_DISPATCH_TIMEOUT_MS,
                );
                if (timedOut.length === 0) {
                    return current;
                }
                for (const pending of timedOut) {
                    pushToast({
                        tone: 'warning',
                        title: 'Indexer is lagging',
                        description: `${pending.policyName} dispatch is taking longer than expected — refresh in a moment.`,
                    });
                }
                return current.filter(
                    (p) => now - p.startedAt <= PENDING_DISPATCH_TIMEOUT_MS,
                );
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [pendingDispatches.length, pushToast]);

    const getPendingDispatch = useCallback(
        (policyId: string): IFlowPendingDispatch | undefined =>
            pendingDispatches.find((p) => p.policyId === policyId),
        [pendingDispatches],
    );

    const isEnvioLoading =
        envioResult.enabled && !hasEnvioData && !envioResult.isError;

    const value = useMemo<IFlowDataContext>(
        () => ({
            data,
            isEnvioLoading,
            hasEnvioData,
            dispatchPolicy,
            pendingDispatches,
            getPendingDispatch,
            toasts,
            dismissToast,
        }),
        [
            data,
            isEnvioLoading,
            hasEnvioData,
            dispatchPolicy,
            pendingDispatches,
            getPendingDispatch,
            toasts,
            dismissToast,
        ],
    );

    return (
        <FlowDataContext.Provider value={value}>
            {children}
        </FlowDataContext.Provider>
    );
};

export const useFlowDataContext = (): IFlowDataContext => {
    const ctx = useContext(FlowDataContext);
    if (ctx == null) {
        throw new Error(
            'useFlowDataContext: must be used inside <FlowDataProvider>.',
        );
    }
    return ctx;
};
