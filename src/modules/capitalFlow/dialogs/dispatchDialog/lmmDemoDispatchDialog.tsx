// LMM_DEMO_HACK: stand-in for `DispatchTransactionDialog` when the policy
// belongs to the Lido Money Machine demo DAO.  Instead of going through wagmi
// (which would prompt MetaMask + sign on whatever chain the user is connected
// to), we drive `dispatch()` directly against the Anvil fork via viem +
// `--auto-impersonate`.  See `infra/lmm-demo/README.md` for the threat model.

import { AlertCard, AlertInline, Dialog } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    type Address,
    createPublicClient,
    type Hex,
    http,
    type PublicClient,
} from 'viem';
import { mainnet } from 'viem/chains';
import {
    type ActionContext,
    deriveAddressesFromManifest,
    dispatchAction,
} from '@/modules/flow/components/lidoMoneyMachine/actions';
import { LmmSimulationCards } from '@/modules/flow/components/lidoMoneyMachine/LmmSimulationCards';
import { LMM_DEMO_MODE, LMM_RPC_URL } from '@/modules/flow/demo/lmmDemoConfig';
import { assertForkRpc } from '@/modules/flow/demo/safety';
import { useLmmManifest } from '@/modules/flow/demo/useLmmManifest';
import { useDialogContext } from '@/shared/components/dialogProvider';
import {
    type FlowGraph,
    inspect,
    simulate,
    type TopologyGraph,
} from '@/shared/lidoPreview';
import { CapitalFlowDialogId } from '../../constants/capitalFlowDialogId';
import type {
    IDispatchTransactionDialogParams,
    IDispatchTransactionDialogProps,
} from './dispatchTransactionDialog';

/**
 * Lightweight viem PublicClient cache so we don't churn instances across
 * remounts of the dialog (each instance opens its own websocket otherwise).
 */
let cachedClient: PublicClient | undefined;
const getPublicClient = (): PublicClient => {
    if (cachedClient) {
        return cachedClient;
    }
    cachedClient = createPublicClient({
        chain: mainnet,
        transport: http(LMM_RPC_URL),
    });
    return cachedClient;
};

type DispatchPhase = 'preparing' | 'ready' | 'sending' | 'success' | 'error';

export const LmmDemoDispatchDialog: React.FC<
    IDispatchTransactionDialogProps
> = (props) => {
    const { location } = props;
    const params = location.params as IDispatchTransactionDialogParams;
    const {
        policy,
        showBackButton = false,
        routerSelectorParams,
        onDispatchSuccess,
    } = params;

    const router = useRouter();
    const { open, close } = useDialogContext();
    const { manifest } = useLmmManifest();

    const [phase, setPhase] = useState<DispatchPhase>('preparing');
    const [flow, setFlow] = useState<FlowGraph | null>(null);
    const [simError, setSimError] = useState<string | undefined>(undefined);
    const [txHash, setTxHash] = useState<Hex | undefined>(undefined);
    const [txError, setTxError] = useState<string | undefined>(undefined);

    const ctxRef = useRef<ActionContext | undefined>(undefined);

    // ---- Step 1: build ActionContext + simulate the next dispatch ---------
    useEffect(() => {
        let cancelled = false;
        if (!LMM_DEMO_MODE || !manifest) {
            return;
        }
        const run = async () => {
            try {
                const publicClient = getPublicClient();
                const dispatcher = manifest.lmm.dispatcherPlugin as Address;
                const dao = manifest.lmm.dao as Address;
                const addresses = deriveAddressesFromManifest(
                    manifest as unknown as Parameters<
                        typeof deriveAddressesFromManifest
                    >[0],
                );
                if (!addresses) {
                    throw new Error(
                        'demo manifest is missing one or more required addresses',
                    );
                }
                ctxRef.current = {
                    rpc: LMM_RPC_URL,
                    publicClient,
                    dao,
                    dispatcher,
                    addresses,
                };
                const topology: TopologyGraph = await inspect(
                    publicClient,
                    dispatcher,
                );
                const simulated = await simulate(publicClient, topology);
                if (cancelled) {
                    return;
                }
                setFlow(simulated);
                setPhase('ready');
            } catch (e) {
                if (cancelled) {
                    return;
                }
                setSimError(e instanceof Error ? e.message : String(e));
                setPhase('ready');
            }
        };
        void run();
        return () => {
            cancelled = true;
        };
    }, [manifest]);

    const handleCancel = () => {
        if (phase === 'sending') {
            return;
        }
        close(CapitalFlowDialogId.DISPATCH_TRANSACTION);
        if (showBackButton && routerSelectorParams) {
            open(CapitalFlowDialogId.ROUTER_SELECTOR, {
                params: routerSelectorParams,
            });
        }
    };

    const handleConfirm = async () => {
        if (!ctxRef.current) {
            return;
        }
        setPhase('sending');
        setTxError(undefined);
        try {
            assertForkRpc();
            const hash = await dispatchAction(ctxRef.current);
            setTxHash(hash);
            setPhase('success');
            if (onDispatchSuccess) {
                // Fetch the full receipt so optimistic callers (waiting-for-
                // indexer badge, etc) have something to read.
                const receipt =
                    await ctxRef.current.publicClient.waitForTransactionReceipt(
                        { hash },
                    );
                onDispatchSuccess({ txHash: hash, receipt });
            }
        } catch (e) {
            setTxError(e instanceof Error ? e.message : String(e));
            setPhase('error');
        }
    };

    const handleDone = () => {
        close(CapitalFlowDialogId.DISPATCH_TRANSACTION);
        router.refresh();
    };

    const title = useMemo(
        () => `Dispatch ${policy.name ?? 'policy'} (demo)`,
        [policy.name],
    );
    const description =
        'This dispatches on the demo Anvil fork. No real funds move. ' +
        'Cheats: open the policy page actions menu to warp time or top up balances.';

    return (
        <>
            <Dialog.Header description={description} title={title} />
            <Dialog.Content>
                <div className="flex flex-col gap-4 pb-3 md:pb-4">
                    <AlertCard
                        message={`Demo mode — all writes go to ${LMM_RPC_URL}.`}
                        variant="warning"
                    >
                        Real chains are not touched.
                    </AlertCard>

                    {phase === 'preparing' && (
                        <div className="rounded-lg border border-neutral-100 bg-neutral-0 px-3 py-3 font-normal text-neutral-500 text-sm">
                            Computing the next dispatch…
                        </div>
                    )}
                    {simError && (
                        <AlertInline
                            message={`Simulation failed: ${simError}`}
                            variant="critical"
                        />
                    )}
                    {flow && <LmmSimulationCards flow={flow} />}
                    {txError && (
                        <AlertInline
                            message={`Dispatch failed: ${txError}`}
                            variant="critical"
                        />
                    )}
                    {phase === 'success' && txHash && (
                        <AlertInline
                            message={`Dispatch confirmed. Tx hash: ${txHash.slice(0, 10)}…`}
                            variant="info"
                        />
                    )}
                </div>
            </Dialog.Content>
            <Dialog.Footer
                hasError={phase === 'error'}
                primaryAction={
                    phase === 'success'
                        ? { label: 'Done', onClick: handleDone }
                        : {
                              label:
                                  phase === 'sending'
                                      ? 'Dispatching…'
                                      : 'Confirm dispatch',
                              onClick: handleConfirm,
                              disabled: phase !== 'ready' && phase !== 'error',
                          }
                }
                secondaryAction={
                    phase === 'success'
                        ? undefined
                        : {
                              label: 'Cancel',
                              onClick: handleCancel,
                              disabled: phase === 'sending',
                          }
                }
            />
        </>
    );
};
