// LMM_DEMO_HACK: the "cheats" dropdown that lets a demo presenter warp
// time, top up balances, settle a CoW order, etc., directly against the
// Anvil fork.  Visible only when `LMM_DEMO_MODE === true` *and* the
// manifest is loaded.  Each action delegates to the vendored
// `lidoMoneyMachine/actions.ts` so the behavior matches Jordi's CLI demo.

'use client';

import { useMemo, useState } from 'react';
import { createPublicClient, http, type PublicClient, parseEther } from 'viem';
import { mainnet } from 'viem/chains';
import { LMM_DEMO_MODE, LMM_RPC_URL } from '@/modules/flow/demo/lmmDemoConfig';
import { assertForkRpc } from '@/modules/flow/demo/safety';
import { useLmmManifest } from '@/modules/flow/demo/useLmmManifest';
import { type ActionItem, ActionsMenu } from './ActionsMenu';
import {
    type ActionContext,
    deriveAddressesFromManifest,
    dispatchAction,
    refreshOracle,
    setEthPrice,
    setTargetEpoch,
    settleCowSwapAuto,
    topUpLdo,
    topUpStEth,
    warpAction,
} from './actions';
import './styles.css';

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

export const LmmCheatsMenu: React.FC = () => {
    const { manifest } = useLmmManifest();
    const [busyKey, setBusyKey] = useState<string | null>(null);

    const ctx = useMemo<ActionContext | undefined>(() => {
        if (!manifest) {
            return undefined;
        }
        const addresses = deriveAddressesFromManifest(
            manifest as unknown as Parameters<
                typeof deriveAddressesFromManifest
            >[0],
        );
        if (!addresses) {
            return undefined;
        }
        return {
            rpc: LMM_RPC_URL,
            publicClient: getPublicClient(),
            dao: manifest.lmm.dao,
            dispatcher: manifest.lmm.dispatcherPlugin,
            addresses,
        };
    }, [manifest]);

    const runAction = (key: string, fn: () => Promise<unknown>) => async () => {
        setBusyKey(key);
        try {
            assertForkRpc();
            await fn();
        } catch (e) {
            // Stay silent in the UI — the menu is a presenter tool, the
            // status panel below will reflect any state changes (or lack
            // thereof) on the next refresh.  We still log to the console
            // so the presenter can investigate in devtools.  `noConsole`
            // is disabled for the vendored Lido directory in biome.json.
            console.error(`[lmm-demo] action ${key} failed:`, e);
        } finally {
            setBusyKey(null);
        }
    };

    if (!LMM_DEMO_MODE || !ctx) {
        return null;
    }

    const groups: ActionItem[][] = [
        [
            {
                key: 'dispatch',
                label: 'Dispatch now',
                description: 'Calls dispatcher.dispatch() against the fork.',
                run: runAction('dispatch', () => dispatchAction(ctx)),
            },
        ],
        [
            {
                key: 'warp-1d',
                label: 'Warp +1 day',
                description:
                    'Advance the fork clock by 24h, mine 1 block, refresh oracle.',
                // Chain refresh after the warp so the staleness check (max
                // 3600s) doesn't no-op the UniV2 LP + CowSwap legs on the
                // next dispatch — see actions.ts → refreshOracle.
                run: runAction('warp-1d', async () => {
                    await warpAction(ctx, 24 * 60 * 60);
                    await refreshOracle(ctx);
                }),
            },
            {
                key: 'warp-7d',
                label: 'Warp +7 days',
                description:
                    'Advance the fork clock by 7 days + refresh oracle.',
                run: runAction('warp-7d', async () => {
                    await warpAction(ctx, 7 * 24 * 60 * 60);
                    await refreshOracle(ctx);
                }),
            },
            {
                key: 'refresh-oracle',
                label: 'Refresh oracle (only)',
                description:
                    'Re-stamp updatedAt on every oracle pair without touching prices.',
                run: runAction('refresh-oracle', () => refreshOracle(ctx)),
            },
        ],
        [
            {
                key: 'top-up-steth',
                label: 'Top up 100 stETH',
                description: 'Impersonate the stETH whale and transfer to DAO.',
                run: runAction('top-up-steth', () =>
                    topUpStEth(ctx, parseEther('100')),
                ),
            },
            {
                key: 'top-up-ldo',
                label: 'Top up 1000 LDO',
                description: 'Impersonate Lido Agent and transfer LDO to DAO.',
                run: runAction('top-up-ldo', () =>
                    topUpLdo(ctx, parseEther('1000')),
                ),
            },
        ],
        [
            {
                key: 'set-eth-price',
                label: 'Set ETH/USD to $3 000',
                description:
                    'Updates the mock oracle so the PriceFloorGate opens.',
                run: runAction('set-eth-price', () => setEthPrice(ctx, 3000)),
            },
            {
                key: 'set-target-epoch',
                label: 'Bump target epoch +1',
                description: 'Increment StreamUntilBudget.targetEpoch by one.',
                run: runAction('set-target-epoch', () =>
                    setTargetEpoch(ctx, 1),
                ),
            },
        ],
        [
            {
                key: 'settle-cowswap',
                label: 'Settle CoW order (mock)',
                description:
                    'Fills the pending presigned order (sell-side = current wstETH allowance).',
                // Sizes the fill from the *current* on-chain allowance the
                // DAO granted to the settlement contract (= the size of
                // the latest presigned order).  Hardcoding `parseEther('1')`
                // here used to revert with `transfer amount exceeds
                // allowance` after the stream's per-dispatch budget
                // dropped below 1 wstETH — see commit history.
                run: runAction('settle-cowswap', async () => {
                    const result = await settleCowSwapAuto(ctx);
                    if (result === null) {
                        console.warn(
                            '[lmm-demo] settle-cowswap: no pending order (allowance is 0). Run a dispatch first.',
                        );
                    }
                }),
            },
        ],
    ];

    return (
        <div
            className="lmm-cheats-menu-wrapper"
            // The vendored `ActionsMenu` ships with `.actions-menu` styles
            // from `styles.css` (vendored alongside it).  Wrap it in a
            // demo-tagged container so the production tree can scope future
            // overrides cleanly.
        >
            <ActionsMenu busyKey={busyKey} groups={groups} />
        </div>
    );
};
