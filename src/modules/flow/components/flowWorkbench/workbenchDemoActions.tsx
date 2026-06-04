'use client';

/**
 * Demo presenter controls for the workbench — the interactive "cheats" that let
 * stakeholders click through the flow against the Anvil fork: open/close the
 * price-floor gate, skip an epoch, warp time, top up balances, settle the CoW
 * order, dispatch. Reuses the vendored `lidoMoneyMachine/actions.ts` (same
 * behaviour as the CLI demo) so nothing is reimplemented; only the chrome is
 * kit-styled to match the workbench.
 *
 * Renders nothing outside `LMM_DEMO_MODE` or before the manifest loads — it is
 * strictly a demo affordance, never part of the production render path.
 */

import { Button, Dropdown, IconType } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { parseEther } from 'viem';
import { LMM_DEMO_MODE } from '../../demo/lmmDemoConfig';
import { assertForkRpc } from '../../demo/safety';
import { useLmmActionContext } from '../../demo/useLmmActionContext';
import {
    type ActionContext,
    dispatchAction,
    refreshOracle,
    setEthPrice,
    setTargetEpoch,
    settleCowSwapAuto,
    topUpLdo,
    topUpStEth,
    warpAction,
} from '../lidoMoneyMachine/actions';
import { MmIcon } from './mmIcon';

// ETH/USD prices either side of the PriceFloorGate's $3,000 floor.
const GATE_OPEN_USD = 3200;
const GATE_CLOSED_USD = 2800;

// Demo epoch cadence: 1h per epoch (EpochProvider.epochLength at deploy). One
// "advance epoch" warps the fork clock by exactly one epoch so the stream's
// per-epoch slot re-arms and a fresh slice can be dispatched.
const EPOCH_SECONDS = 60 * 60;
// How far ahead the Fast Track action pushes the stream's targetEpoch. Must sit
// comfortably above the StreamUntilBudget floor so the stream leaves its floored
// regime (`balance / floorEpochs`) and meters `balance / (target − current)`.
const STREAM_HORIZON_EPOCHS = 24;

interface IDemoAction {
    key: string;
    label: string;
    description: string;
    icon: string;
    run: (ctx: ActionContext) => Promise<unknown>;
}

// Ordered as a presenter walks the demo: fund the vault → set the gate →
// dispatch → settle the buyback → advance time. Mirrors infra/lmm-demo/DEMO-SCRIPT.md.
const ACTION_GROUPS: { heading: string; actions: IDemoAction[] }[] = [
    {
        heading: '1 · Fund the vault',
        actions: [
            {
                key: 'top-up-steth',
                label: 'Top up 100 stETH',
                description: 'Impersonate the stETH whale → DAO vault.',
                icon: 'deposit',
                run: (ctx) => topUpStEth(ctx, parseEther('100')),
            },
            {
                key: 'top-up-ldo',
                label: 'Top up 1000 LDO',
                description: 'Impersonate the Lido Agent → DAO vault.',
                icon: 'deposit',
                run: (ctx) => topUpLdo(ctx, parseEther('1000')),
            },
        ],
    },
    {
        heading: '2 · Price-floor gate',
        actions: [
            {
                key: 'gate-open',
                label: `Open gate · ETH $${GATE_OPEN_USD.toLocaleString('en-US')}`,
                description: 'Set the oracle price above the $3,000 floor.',
                icon: 'gate',
                run: (ctx) => setEthPrice(ctx, GATE_OPEN_USD),
            },
            {
                key: 'gate-close',
                label: `Close gate · ETH $${GATE_CLOSED_USD.toLocaleString('en-US')}`,
                description: 'Set the oracle price below the $3,000 floor.',
                icon: 'gate',
                run: (ctx) => setEthPrice(ctx, GATE_CLOSED_USD),
            },
        ],
    },
    {
        heading: '3 · Dispatch & settle',
        actions: [
            {
                key: 'dispatch',
                label: 'Dispatch now',
                description: 'Call dispatcher.dispatch() against the fork.',
                icon: 'bolt',
                run: (ctx) => dispatchAction(ctx),
            },
            {
                key: 'settle-cowswap',
                label: 'Settle CoW order',
                description: 'Fill the pending pre-signed buyback order.',
                icon: 'swap',
                run: (ctx) => settleCowSwapAuto(ctx),
            },
        ],
    },
    {
        heading: '4 · Advance time',
        actions: [
            {
                key: 'advance-epoch',
                label: 'Advance one epoch',
                description:
                    'Warp the fork clock one epoch (1h) + refresh oracle — re-arms the per-epoch stream slot.',
                icon: 'clock',
                run: async (ctx) => {
                    await warpAction(ctx, EPOCH_SECONDS);
                    await refreshOracle(ctx);
                },
            },
            {
                key: 'warp-1d',
                label: 'Warp +1 day',
                description: 'Advance the fork clock 24h + refresh oracle.',
                icon: 'reload',
                run: async (ctx) => {
                    await warpAction(ctx, 24 * 60 * 60);
                    await refreshOracle(ctx);
                },
            },
            {
                key: 'warp-7d',
                label: 'Warp +7 days',
                description: 'Advance the fork clock 7d + refresh oracle.',
                icon: 'reload',
                run: async (ctx) => {
                    await warpAction(ctx, 7 * 24 * 60 * 60);
                    await refreshOracle(ctx);
                },
            },
        ],
    },
    {
        heading: '5 · Governance (Fast Track)',
        actions: [
            {
                key: 'extend-stream-horizon',
                label: `Extend stream horizon · +${STREAM_HORIZON_EPOCHS} epochs`,
                description:
                    'Push the stream targetEpoch into the future via dao.execute() signed by the Lido Agent — models a Lido Fast Track proposal so the stream meters again.',
                icon: 'settings',
                run: (ctx) => setTargetEpoch(ctx, STREAM_HORIZON_EPOCHS),
            },
        ],
    },
];

export const WorkbenchDemoActions: React.FC = () => {
    const ctx = useLmmActionContext();
    const [open, setOpen] = useState(false);
    const [busyKey, setBusyKey] = useState<string | null>(null);

    if (!(LMM_DEMO_MODE && ctx)) {
        return null;
    }
    const actionCtx = ctx;

    const run = (action: IDemoAction) => async () => {
        setBusyKey(action.key);
        try {
            assertForkRpc();
            await action.run(actionCtx);
        } catch (e) {
            // Presenter tool — surface failures to devtools only; the live
            // snapshot poll reflects the resulting state (or lack of change).
            // biome-ignore lint/suspicious/noConsole: demo presenter affordance
            console.error(`[lmm-demo] action ${action.key} failed:`, e);
        } finally {
            setBusyKey(null);
        }
    };

    return (
        <Dropdown.Container
            align="end"
            customTrigger={
                <Button
                    iconLeft={IconType.SETTINGS}
                    iconRight={IconType.CHEVRON_DOWN}
                    size="md"
                    variant="tertiary"
                >
                    Demo
                </Button>
            }
            onOpenChange={setOpen}
            open={open}
        >
            {/* Fixed width so the long action descriptions wrap inside the menu
                instead of stretching it across the canvas. */}
            <div className="w-[320px]">
                <div className="px-2 pt-1 pb-0.5 font-semibold text-neutral-500 text-xs">
                    Demo controls · Anvil fork
                </div>
                {ACTION_GROUPS.map((group) => (
                    <div key={group.heading}>
                        <div className="px-2 pt-2 pb-0.5 font-semibold text-[11px] text-neutral-400 uppercase tracking-[0.06em]">
                            {group.heading}
                        </div>
                        {group.actions.map((action) => (
                            <Dropdown.Item
                                disabled={busyKey != null}
                                key={action.key}
                                onClick={run(action)}
                            >
                                <span className="flex w-full items-start gap-2.5 whitespace-normal text-left">
                                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                                        <MmIcon name={action.icon} size={15} />
                                    </span>
                                    <span className="flex min-w-0 flex-col">
                                        <span className="whitespace-normal break-words font-semibold text-neutral-800 text-sm">
                                            {action.label}
                                            {busyKey === action.key && ' …'}
                                        </span>
                                        <span className="whitespace-normal break-words text-neutral-400 text-xs leading-snug">
                                            {action.description}
                                        </span>
                                    </span>
                                </span>
                            </Dropdown.Item>
                        ))}
                    </div>
                ))}
            </div>
        </Dropdown.Container>
    );
};
