// Vendored from dao-launchpad@f/lido-demo:lido/preview/ui/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Adapted: imports rewritten to use the in-tree @/shared/lidoPreview vendoring
// of @aragon/lido-preview, with .ts/.tsx extensions stripped for moduleResolution=bundler.

// One-shot write actions the UI can fire against the demo's anvil fork.
//
// All actions broadcast a single tx (or anvil RPC cheat) and return the
// receipt-ish thing.  Callers refresh the status snapshot afterwards.
//
// Wiring assumes anvil is running with `--auto-impersonate`, so any address
// can sign without a key — viem just lets anvil sign for us.  The deployer
// (anvil[0]) signs normal txs; the whale / Lido Agent are impersonated for
// stETH / LDO transfers respectively.

import {
    type Address,
    createWalletClient,
    encodeFunctionData,
    type Hex,
    http,
    type PublicClient,
    parseAbi,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet } from 'viem/chains';
import {
    dispatcherPluginAbi,
    mockCowSwapSettlementAbi,
    mockPriceOracleAbi,
} from '@/shared/lidoPreview';

// Aragon DAO's `execute()` reverts the outer tx with `ActionFailed(uint256
// index)` when one of the strategy actions fails.  That error lives on the
// DAO contract, not on the dispatcher plugin we're calling, so viem can't
// decode it from `dispatcherPluginAbi` alone.  Merging the error item in
// lets viem pretty-print the failure with the offending action's index,
// which is the only useful clue when chasing a dispatch revert.
const DISPATCH_ERRORS = [
    {
        type: 'error',
        name: 'ActionFailed',
        inputs: [{ name: 'index', type: 'uint256' }],
    },
] as const;
const dispatcherAbiWithErrors = [
    ...dispatcherPluginAbi,
    ...DISPATCH_ERRORS,
] as const;

// anvil[0] private key — same one PrepareDemo + every operator script use.
// Public test key (well-known across foundry/hardhat/anvil tooling); kept
// behind an env override so a future demo can rotate it if the host swaps
// the deployer.  The default matches `anvil --auto-impersonate` defaults.
// LMM_DEMO_HACK: this constant is reachable from a production import chain
// (dispatchTransactionDialog → LmmDemoDispatchDialog → here), but the
// dialog is now `next/dynamic` so it never lands in the production bundle
// while LMM_DEMO_MODE=0.
const ANVIL_DEPLOYER_KEY: Hex = (process.env.NEXT_PUBLIC_LMM_DEPLOYER_KEY ??
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80') as Hex;

const ERC20_TRANSFER_ABI = parseAbi([
    'function transfer(address,uint256) returns (bool)',
]);

const DAO_EXECUTE_ABI = parseAbi([
    'function execute(bytes32 callId, (address to, uint256 value, bytes data)[] actions, uint256 allowFailureMap) returns (bytes[], uint256)',
]);

const STREAM_SET_TARGET_ABI = parseAbi(['function setTargetEpoch(uint64)']);

const EPOCH_PROVIDER_ABI = parseAbi([
    'function getEpoch() view returns (uint256)',
]);

export type ActionContext = {
    rpc: string;
    publicClient: PublicClient;
    dao: Address;
    dispatcher: Address;
    addresses: {
        stETH: Address;
        wstETH: Address;
        ldo: Address;
        weth: Address;
        usdc: Address;
        mockOracle: Address;
        mockCowSwap: Address;
        streamBudget: Address;
        stEthWhale: Address;
        lidoAgent: Address;
        epochProvider: Address;
    };
};

// Wallet helpers ------------------------------------------------------------

function deployerWallet(rpc: string) {
    return createWalletClient({
        account: privateKeyToAccount(ANVIL_DEPLOYER_KEY),
        chain: mainnet,
        transport: http(rpc),
    });
}

function impersonatedWallet(rpc: string, address: Address) {
    // Anvil signs as `address` because the fork is started with --auto-impersonate.
    return createWalletClient({
        account: address,
        chain: mainnet,
        transport: http(rpc),
    });
}

/** Ensure an impersonated account has enough ETH to pay gas before we
 *  submit a viem-driven tx from it.  Forge's `--unlocked` mode bypasses
 *  the balance check entirely; `eth_sendTransaction` (what viem uses)
 *  does not, so contract-address `from`s (Agent, whales) need a topped-up
 *  ETH balance or the tx fails the entrypoint check with no useful
 *  revert reason. */
async function ensureGasFor(
    publicClient: PublicClient,
    address: Address,
): Promise<void> {
    await publicClient.request({
        method: 'anvil_setBalance' as never,
        // 100 ETH — plenty for any single tx; idempotent on every call.
        params: [address, '0x56bc75e2d63100000'] as never,
    });
}

// Generic send-and-wait, returning the tx hash.
type WriteArgs = Parameters<
    ReturnType<typeof deployerWallet>['writeContract']
>[0];
async function send(
    publicClient: PublicClient,
    walletClient:
        | ReturnType<typeof deployerWallet>
        | ReturnType<typeof impersonatedWallet>,
    args: WriteArgs,
): Promise<Hex> {
    const hash = await walletClient.writeContract(args);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    // `waitForTransactionReceipt` resolves regardless of tx outcome — we
    // have to inspect `status` ourselves.  Without this check a reverted
    // tx in a multi-step action silently slips through, and a later step
    // gets to debug a stale-state symptom (e.g. mock has no LDO because
    // the preamble transfer reverted but we proceeded to simulateFill).
    if (receipt.status !== 'success') {
        throw new Error(`tx ${hash} reverted on-chain (no further reason)`);
    }
    return hash;
}

// --- The actions -----------------------------------------------------------

export async function dispatchAction(ctx: ActionContext): Promise<Hex> {
    return send(ctx.publicClient, deployerWallet(ctx.rpc), {
        address: ctx.dispatcher,
        abi: dispatcherAbiWithErrors,
        functionName: 'dispatch',
    });
}

/** Advance the fork's clock by N seconds + mine 1 block. */
export async function warpAction(
    ctx: ActionContext,
    seconds: number,
): Promise<void> {
    await ctx.publicClient.request({
        method: 'evm_increaseTime' as never,
        params: [seconds] as never,
    });
    await ctx.publicClient.request({
        method: 'anvil_mine' as never,
        params: ['0x1'] as never,
    });
}

/** Stamp `updatedAt = block.timestamp` on every oracle pair the LMM demo
 *  reads from.  Use after `warpAction` so the staleness check (max age
 *  3600s) doesn't trip the UniV2 LP and CowSwap legs — they short-circuit
 *  to no-op when the oracle hasn't been refreshed since the last warp.
 *
 *  Idempotent: calling it without a preceding warp just bumps `updatedAt`
 *  to the current head block, which is already the case.  Safe to chain
 *  liberally.  Does NOT change any prices — see `setEthPrice` for that. */
export async function refreshOracle(ctx: ActionContext): Promise<void> {
    const wallet = deployerWallet(ctx.rpc);
    // Three pairs that the demo's price-floor gate + UniV2 LP read from.
    // Each `refresh()` call writes `updatedAt = block.timestamp` for that
    // specific (sell, buy) entry — pairs are stored separately, so all of
    // them need touching individually.  Order doesn't matter.
    const pairs: [Address, Address][] = [
        [ctx.addresses.weth, ctx.addresses.usdc],
        [ctx.addresses.wstETH, ctx.addresses.ldo],
        [ctx.addresses.ldo, ctx.addresses.wstETH],
    ];
    for (const [sell, buy] of pairs) {
        await send(ctx.publicClient, wallet, {
            address: ctx.addresses.mockOracle,
            abi: mockPriceOracleAbi,
            functionName: 'refresh',
            args: [sell, buy],
        });
    }
}

export async function topUpStEth(
    ctx: ActionContext,
    amount: bigint,
): Promise<Hex> {
    await ensureGasFor(ctx.publicClient, ctx.addresses.stEthWhale);
    return send(
        ctx.publicClient,
        impersonatedWallet(ctx.rpc, ctx.addresses.stEthWhale),
        {
            address: ctx.addresses.stETH,
            abi: ERC20_TRANSFER_ABI,
            functionName: 'transfer',
            args: [ctx.dao, amount],
        },
    );
}

export async function topUpLdo(
    ctx: ActionContext,
    amount: bigint,
): Promise<Hex> {
    await ensureGasFor(ctx.publicClient, ctx.addresses.lidoAgent);
    return send(
        ctx.publicClient,
        impersonatedWallet(ctx.rpc, ctx.addresses.lidoAgent),
        {
            address: ctx.addresses.ldo,
            abi: ERC20_TRANSFER_ABI,
            functionName: 'transfer',
            args: [ctx.dao, amount],
        },
    );
}

/** Set the ETH/USD price (whole dollars) + refresh updatedAt on the other
 *  seeded pairs so the staleness check passes everywhere.
 *
 *  IMPORTANT: anvil's clock drifts away from the host wallclock every time
 *  we Warp.  The gate's staleness check (and ours) reads `block.timestamp`,
 *  so we must stamp `updatedAt` with that, not `Date.now()`. */
export async function setEthPrice(
    ctx: ActionContext,
    usd: number,
): Promise<Hex> {
    const wallet = deployerWallet(ctx.rpc);
    const priceScaled = BigInt(usd) * 10n ** 6n; // USDC = 6 decimals
    const block = await ctx.publicClient.getBlock();
    const now = block.timestamp;
    const hash = await send(ctx.publicClient, wallet, {
        address: ctx.addresses.mockOracle,
        abi: mockPriceOracleAbi,
        functionName: 'setPrice',
        args: [ctx.addresses.weth, ctx.addresses.usdc, priceScaled, now],
    });
    await send(ctx.publicClient, wallet, {
        address: ctx.addresses.mockOracle,
        abi: mockPriceOracleAbi,
        functionName: 'refresh',
        args: [ctx.addresses.wstETH, ctx.addresses.ldo],
    });
    await send(ctx.publicClient, wallet, {
        address: ctx.addresses.mockOracle,
        abi: mockPriceOracleAbi,
        functionName: 'refresh',
        args: [ctx.addresses.ldo, ctx.addresses.wstETH],
    });
    return hash;
}

/** Push the stream's targetEpoch to `currentEpoch + offset` via a DAO.execute
 *  call signed by the Lido Agent (only address with EXECUTE on the LMM DAO). */
export async function setTargetEpoch(
    ctx: ActionContext,
    offsetEpochs: number,
): Promise<Hex> {
    const currentEpoch = await ctx.publicClient.readContract({
        address: ctx.addresses.epochProvider,
        abi: EPOCH_PROVIDER_ABI,
        functionName: 'getEpoch',
    });
    const newTarget = currentEpoch + BigInt(offsetEpochs);
    const inner = encodeFunctionData({
        abi: STREAM_SET_TARGET_ABI,
        functionName: 'setTargetEpoch',
        args: [newTarget],
    });

    await ensureGasFor(ctx.publicClient, ctx.addresses.lidoAgent);
    return send(
        ctx.publicClient,
        impersonatedWallet(ctx.rpc, ctx.addresses.lidoAgent),
        {
            address: ctx.dao,
            abi: DAO_EXECUTE_ABI,
            functionName: 'execute',
            args: [
                `0x${'00'.repeat(31)}01` as Hex, // arbitrary callId — only used in events
                [
                    {
                        to: ctx.addresses.streamBudget,
                        value: 0n,
                        data: inner,
                    },
                ],
                0n,
            ],
        },
    );
}

/** Simulate a CowSwap solver fill: seed the mock with LDO from the Agent,
 *  then call simulateFill (pulls wstETH from the DAO via the relayer
 *  allowance, sends LDO back). */
export async function settleCowSwap(
    ctx: ActionContext,
    sellAmount: bigint,
    buyAmount: bigint,
): Promise<Hex> {
    await ensureGasFor(ctx.publicClient, ctx.addresses.lidoAgent);
    await send(
        ctx.publicClient,
        impersonatedWallet(ctx.rpc, ctx.addresses.lidoAgent),
        {
            address: ctx.addresses.ldo,
            abi: ERC20_TRANSFER_ABI,
            functionName: 'transfer',
            args: [ctx.addresses.mockCowSwap, buyAmount],
        },
    );
    return send(ctx.publicClient, deployerWallet(ctx.rpc), {
        address: ctx.addresses.mockCowSwap,
        abi: mockCowSwapSettlementAbi,
        functionName: 'simulateFill',
        args: [
            ctx.addresses.wstETH,
            ctx.addresses.ldo,
            ctx.dao,
            sellAmount,
            buyAmount,
        ],
    });
}

// ---- Manifest → addresses adapter -----------------------------------------

export function deriveAddressesFromManifest(m: {
    lido?: {
        stETH?: string;
        wstETH?: string;
        ldo?: string;
        weth?: string;
        usdc?: string;
        agent?: string;
    };
    cowSwap?: { settlement?: string };
    oracle?: { address?: string };
    lmm?: { budgets?: { wstEthStream?: string }; epochProvider?: string };
    demo?: { stEthWhale?: string };
}): ActionContext['addresses'] | null {
    const required = (a?: string): Address => {
        if (!a) {
            throw new Error('manifest is missing a required address');
        }
        return a as Address;
    };
    try {
        return {
            stETH: required(m.lido?.stETH),
            wstETH: required(m.lido?.wstETH),
            ldo: required(m.lido?.ldo),
            weth: required(m.lido?.weth),
            usdc: required(m.lido?.usdc),
            mockOracle: required(m.oracle?.address),
            mockCowSwap: required(m.cowSwap?.settlement),
            streamBudget: required(m.lmm?.budgets?.wstEthStream),
            stEthWhale: required(m.demo?.stEthWhale),
            lidoAgent: required(m.lido?.agent),
            epochProvider: required(m.lmm?.epochProvider),
        };
    } catch {
        return null;
    }
}
