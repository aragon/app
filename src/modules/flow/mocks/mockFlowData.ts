import type {
    FlowTokenSymbol,
    IFlowDao,
    IFlowDaoData,
    IFlowDispatch,
    IFlowEvent,
    IFlowPolicy,
    IFlowPolicySubRouter,
    IFlowRecipient,
    IFlowRecipientAggregate,
} from '../types';
import { groupPolicies } from '../utils/envioFlowMapper';

const DAY = 24 * 60 * 60 * 1000;

const now = Date.UTC(2026, 3, 22, 15, 0, 0);

const daysAgo = (d: number): string => new Date(now - d * DAY).toISOString();

const hoursAgo = (h: number): string =>
    new Date(now - h * 60 * 60 * 1000).toISOString();

const daysFromNow = (d: number): string =>
    new Date(now + d * DAY).toISOString();

const makeSeededRng = (seed: string) => {
    let x = 1_779_033_703 ^ seed.length;
    for (let i = 0; i < seed.length; i += 1) {
        x = Math.imul(x ^ seed.charCodeAt(i), 3_432_918_353);
        x = (x << 13) | (x >>> 19);
    }
    return () => {
        x = Math.imul(x ^ (x >>> 16), 2_246_822_507);
        x = Math.imul(x ^ (x >>> 13), 3_266_489_909);
        x ^= x >>> 16;
        return (x >>> 0) / 4_294_967_296;
    };
};

const makeTxHash = (rand: () => number): string =>
    `0x${Math.floor(rand() * 1e16)
        .toString(16)
        .padStart(12, '0')
        .slice(0, 12)}…`;

const generateDispatches = (params: {
    policyId: string;
    count: number;
    token: FlowTokenSymbol;
    amountRange: [number, number];
    topRecipients: IFlowRecipient[];
    spanDays: number;
    startDaysAgo: number;
}): IFlowDispatch[] => {
    const {
        policyId,
        count,
        token,
        amountRange,
        topRecipients,
        spanDays,
        startDaysAgo,
    } = params;
    const rand = makeSeededRng(`dispatch:${policyId}`);
    const items: IFlowDispatch[] = [];
    for (let i = 0; i < count; i += 1) {
        const progress = (i + 0.5) / count;
        const daysBack = startDaysAgo - progress * spanDays;
        const amount =
            amountRange[0] + rand() * (amountRange[1] - amountRange[0]);
        items.push({
            id: `${policyId}-d-${i}`,
            at: daysAgo(daysBack),
            amount,
            token,
            recipientsCount:
                1 + Math.floor(rand() * Math.max(topRecipients.length, 5)),
            topRecipients,
            txHash: makeTxHash(rand),
        });
    }
    return items;
};

const payrollRecipients: IFlowRecipient[] = [
    { name: 'alice.eth', pct: 14, address: '0xa11ce…b0b' },
    {
        name: 'core-team.money-machine.eth',
        pct: 12,
        address: '0xc01e…team',
    },
    { name: 'mallory.eth', pct: 10, address: '0xma11…0ry' },
];

const payrollFullRecipients: IFlowRecipient[] = [
    { ratio: '14%', name: 'alice.eth', address: '0xa11ce…b0b' },
    {
        ratio: '12%',
        name: 'core-team.money-machine.eth',
        address: '0xc01e…team',
    },
    { ratio: '10%', name: 'mallory.eth', address: '0xma11…0ry' },
    { ratio: '9%', name: 'quinn.eth', address: '0xqu11n…7e2d' },
    { ratio: '9%', name: 'nina.eth', address: '0xn1na…a4c0' },
    { ratio: '8%', name: 'yoko.eth', address: '0xyok0…ff11' },
    { ratio: '8%', name: 'levi.eth', address: '0x1ev1…2b98' },
    { ratio: '7%', name: 'uma.eth', address: '0xuma1…19aa' },
    { ratio: '7%', name: 'penn.eth', address: '0xpenn…dd33' },
    { ratio: '6%', name: '0xf3…a12c', address: '0xf3b2…a12c' },
    { ratio: '5%', name: '0x2a…9901', address: '0x2a1d…9901' },
    { ratio: '5%', name: '0x41…c0de', address: '0x41ef…c0de' },
];

const lpRecipients: IFlowRecipient[] = [
    { name: 'MERC/USDC · Uni v3', pct: 38, address: '0xpool…u3-1' },
    { name: 'MERC/WETH · Uni v3', pct: 29, address: '0xpool…u3-2' },
    { name: 'MERC/DAI · Curve', pct: 18, address: '0xpool…curv' },
];

const lpFullRecipients: IFlowRecipient[] = [
    { ratio: '38%', name: 'MERC/USDC · Uni v3', address: '0xp001…u3-1' },
    { ratio: '29%', name: 'MERC/WETH · Uni v3', address: '0xp002…u3-2' },
    { ratio: '18%', name: 'MERC/DAI · Curve', address: '0xp003…curv' },
    { ratio: '10%', name: 'MERC/USDT · Bal', address: '0xp004…ba11' },
    { ratio: '5%', name: 'MERC/stETH · Curve', address: '0xp005…steh' },
];

const burnRecipients: IFlowRecipient[] = [
    { name: 'Burn address', pct: 100, address: '0x0000…dead' },
];

const sweepRecipients: IFlowRecipient[] = [
    { name: 'Treasury · USDC vault', pct: 100, address: '0xc0w5…wa9p' },
];

const grantsRecipients: IFlowRecipient[] = [
    { name: 'optics-labs.eth', pct: 26, address: '0xop71…lab5' },
    { name: 'spellbook.eth', pct: 22, address: '0x5pe11…b00k' },
    { name: '0x9a…42be', pct: 18, address: '0x9a5c…42be' },
];

const grantsFullRecipients: IFlowRecipient[] = [
    { ratio: '26%', name: 'optics-labs.eth', address: '0xop71…lab5' },
    { ratio: '22%', name: 'spellbook.eth', address: '0x5pe11…b00k' },
    { ratio: '18%', name: '0x9a…42be', address: '0x9a5c…42be' },
    { ratio: '12%', name: 'research-dao.eth', address: '0xr35e…a4c0' },
    { ratio: '10%', name: 'bluehat.eth', address: '0xb1ue…ha70' },
    { ratio: '8%', name: 'darknet.eth', address: '0xda6k…ne71' },
    { ratio: '4%', name: '0x17…beef', address: '0x1742…beef' },
];

const grantsStreamRecipients: IFlowRecipient[] = [
    { name: 'research-dao.eth', pct: 40, address: '0xr35e…a4c0' },
    { name: 'bluehat.eth', pct: 35, address: '0xb1ue…ha70' },
    { name: 'optics-labs.eth', pct: 25, address: '0xop71…lab5' },
];

const grantsStreamFullRecipients: IFlowRecipient[] = [
    { ratio: '40%', name: 'research-dao.eth', address: '0xr35e…a4c0' },
    { ratio: '35%', name: 'bluehat.eth', address: '0xb1ue…ha70' },
    { ratio: '25%', name: 'optics-labs.eth', address: '0xop71…lab5' },
];

const multiRecipients: IFlowRecipient[] = [
    {
        name: 'Contributor payroll · sub',
        pct: 60,
        address: 'policy:payroll',
    },
    { name: 'LP incentives · sub', pct: 40, address: 'policy:lp' },
];

const multiSubRouters: IFlowPolicySubRouter[] = [
    {
        id: 'multi-sub-a',
        title: 'Buyback Engine',
        subtitle: 'sub-policy A · 55%',
        allowance: {
            type: 'Swap allowance',
            detail: '55% of inbound · Uniswap v4',
        },
        model: {
            type: 'Burn router',
            detail: 'Swap USDC → MERC → burn',
        },
        recipients: [
            { ratio: '100%', name: 'Burn MERC', address: '0x0000…dead' },
        ],
    },
    {
        id: 'multi-sub-b',
        title: 'LP + Contributor',
        subtitle: 'sub-policy B · 30%',
        allowance: {
            type: 'Swap allowance',
            detail: '30% of inbound · CoW Swap',
        },
        model: {
            type: 'Ratio splitter',
            detail: 'Swap USDC → WETH, split into 3 legs',
        },
        recipients: [
            { ratio: '45%', name: 'LP 0.3% Pool', address: '0xp003…lp03' },
            { ratio: '40%', name: 'Contributor Safe', address: '0xc017…safe' },
            { ratio: '15%', name: 'Bug Bounty', address: '0xbu6b…0unt' },
        ],
        subRouters: [
            {
                id: 'multi-sub-b-nested',
                title: 'Contributor Safe · stream',
                subtitle: 'nested · 40%',
                allowance: {
                    type: 'Stream',
                    detail: '40% of sub-policy B per epoch',
                },
                model: {
                    type: 'Ratio splitter',
                    detail: '3 contributors, voter-weighted',
                },
                recipients: [
                    { ratio: '50%', name: 'alice.eth', address: '0xa11ce…b0b' },
                    {
                        ratio: '30%',
                        name: 'core-team.money-machine.eth',
                        address: '0xc01e…team',
                    },
                    {
                        ratio: '20%',
                        name: 'mallory.eth',
                        address: '0xma11…0ry',
                    },
                ],
            },
        ],
    },
    {
        id: 'multi-sub-c',
        title: 'Ops Multisig',
        subtitle: 'sub-policy C · 15%',
        allowance: {
            type: 'Transfer',
            detail: '15% of inbound · direct transfer',
        },
        model: {
            type: 'Solo recipient',
            detail: '100% to ops multisig',
        },
        recipients: [
            { ratio: '100%', name: 'Ops Multisig', address: '0x0p5a…c0de' },
        ],
    },
];

const buildPayrollPolicy = (): Omit<IFlowPolicy, 'address'> => ({
    id: 'payroll',
    name: 'Contributor payroll',
    description: 'Streams weekly USDC to 12 contributors via a ratio splitter.',
    strategy: 'Stream',
    strategyLong: 'Stream · weekly epoch',
    token: 'USDC',
    status: 'live',
    statusLabel: 'Streaming · next in 2d',
    verb: 'streamed',
    createdAt: daysAgo(120),
    installedViaProposal: '#42',
    installedViaProposalSlug: 'proposal-42',
    installTxHash: '0xinst…0042',
    totalDistributed: 48_900,
    forecast30d: 12_800,
    nextDispatchLabel: 'Streams weekly · next in 2d',
    nextDispatchAt: daysFromNow(2),
    pending: null,
    cooldown: { readyAt: daysFromNow(2), totalMs: 7 * DAY },
    lastDispatch: {
        amount: 3100,
        token: 'USDC',
        at: hoursAgo(2),
        txHash: '0x9aef…22c1',
        recipientsCount: 12,
    },
    recipients: payrollRecipients,
    recipientsMore: 9,
    recipientGroup: 'Contributors (12)',
    dispatches: generateDispatches({
        policyId: 'payroll',
        count: 16,
        token: 'USDC',
        amountRange: [2800, 3200],
        topRecipients: payrollRecipients,
        spanDays: 112,
        startDaysAgo: 112,
    }),
    events: [
        {
            id: 'payroll-installed',
            kind: 'policyInstalled',
            at: daysAgo(120),
            title: 'Policy installed',
            description: 'Contributor payroll deployed via proposal #42.',
            proposalId: '#42',
            proposalSlug: 'proposal-42',
            txHash: '0xinst…0042',
        },
        {
            id: 'payroll-recipients-updated',
            kind: 'recipientsUpdated',
            at: daysAgo(70),
            title: 'Recipients updated',
            description: '+2 contributors added (quinn.eth, nina.eth).',
            proposalId: '#48',
            proposalSlug: 'proposal-48',
        },
        {
            id: 'payroll-settings-updated',
            kind: 'settingsUpdated',
            at: daysAgo(28),
            title: 'Settings updated',
            description: 'Epoch length changed from 14d to 7d.',
            proposalId: '#57',
            proposalSlug: 'proposal-57',
        },
    ],
    schema: {
        source: 'Treasury vault · 0x9fA7…2e01',
        allowance: {
            type: 'Stream',
            detail: '3,100 USDC per epoch · every 7 days',
        },
        model: {
            type: 'Ratio splitter',
            detail: '12 recipients with individual weights',
        },
        recipients: payrollFullRecipients,
    },
});

const buildLpPolicy = (): Omit<IFlowPolicy, 'address'> => ({
    id: 'lp',
    name: 'LP incentives',
    description: 'Gauge-weighted MERC incentives to 5 LP farms every 7 days.',
    strategy: 'Epoch transfer',
    strategyLong: 'Epoch transfer · gauge-weighted',
    token: 'MERC',
    status: 'ready',
    statusLabel: 'Ready · 50,000 MERC queued',
    verb: 'distributed',
    createdAt: daysAgo(96),
    installedViaProposal: '#47',
    installedViaProposalSlug: 'proposal-47',
    installTxHash: '0xinst…0047',
    totalDistributed: 820_000,
    forecast30d: 210_000,
    nextDispatchLabel: 'Ready to dispatch',
    nextDispatchAt: hoursAgo(4),
    pending: { amount: 50_000, token: 'MERC' },
    cooldown: null,
    lastDispatch: {
        amount: 50_000,
        token: 'MERC',
        at: daysAgo(7),
        txHash: '0xd4ad…0a11',
        recipientsCount: 5,
    },
    recipients: lpRecipients,
    recipientsMore: 2,
    recipientGroup: 'LP farms',
    dispatches: generateDispatches({
        policyId: 'lp',
        count: 13,
        token: 'MERC',
        amountRange: [45_000, 52_000],
        topRecipients: lpRecipients,
        spanDays: 90,
        startDaysAgo: 97,
    }),
    events: [
        {
            id: 'lp-installed',
            kind: 'policyInstalled',
            at: daysAgo(96),
            title: 'Policy installed',
            description: 'LP incentives deployed via proposal #47.',
            proposalId: '#47',
            proposalSlug: 'proposal-47',
        },
        {
            id: 'lp-proposal-applied',
            kind: 'proposalApplied',
            at: daysAgo(40),
            title: 'Proposal applied',
            description: 'Gauge weights updated by proposal #52.',
            proposalId: '#52',
            proposalSlug: 'proposal-52',
        },
    ],
    schema: {
        source: 'Treasury vault · 0x9fA7…2e01',
        allowance: {
            type: 'Fixed per epoch',
            detail: '50,000 MERC per epoch · every 7 days',
        },
        model: {
            type: 'Gauge-weighted',
            detail: 'Weighted by MERC holder votes, settled at epoch close',
        },
        recipients: lpFullRecipients,
    },
});

const buildBurnPolicy = (): Omit<IFlowPolicy, 'address'> => ({
    id: 'burn',
    name: 'Fee burn',
    description: 'Burns 100% of collected protocol fees at every epoch.',
    strategy: 'Burn',
    strategyLong: 'Burn router · single-token',
    token: 'MERC',
    status: 'cooldown',
    statusLabel: 'Cooldown · ready in 4d',
    verb: 'burned',
    createdAt: daysAgo(80),
    installedViaProposal: '#51',
    installedViaProposalSlug: 'proposal-51',
    installTxHash: '0xinst…0051',
    totalDistributed: 445_000,
    forecast30d: 115_000,
    nextDispatchLabel: 'Next burn in 4d',
    nextDispatchAt: daysFromNow(4),
    pending: { amount: 28_000, token: 'MERC' },
    cooldown: { readyAt: daysFromNow(4), totalMs: 7 * DAY },
    lastDispatch: {
        amount: 28_000,
        token: 'MERC',
        at: daysAgo(3),
        txHash: '0x0b77…dead',
        recipientsCount: 1,
    },
    recipients: burnRecipients,
    recipientsMore: 0,
    recipientGroup: 'Burn',
    dispatches: generateDispatches({
        policyId: 'burn',
        count: 11,
        token: 'MERC',
        amountRange: [24_000, 32_000],
        topRecipients: burnRecipients,
        spanDays: 77,
        startDaysAgo: 77,
    }),
    events: [
        {
            id: 'burn-installed',
            kind: 'policyInstalled',
            at: daysAgo(80),
            title: 'Policy installed',
            description: 'Fee burn deployed via proposal #51.',
            proposalId: '#51',
            proposalSlug: 'proposal-51',
        },
    ],
    schema: {
        source: 'Fee collector · 0xFee5…b001',
        allowance: {
            type: 'Drain',
            detail: 'Full balance transferred at each epoch',
        },
        model: {
            type: 'Solo recipient',
            detail: '100% to a single address',
        },
        recipients: [
            { ratio: '100%', name: 'Burn address', address: '0x0000…dead' },
        ],
    },
});

const buildSweepPolicy = (): Omit<IFlowPolicy, 'address'> => ({
    id: 'sweep',
    name: 'Stable sweep',
    description:
        'Monthly CoW-Swap converts WETH fees to USDC for the treasury.',
    strategy: 'CoW swap',
    strategyLong: 'CoW swap · WETH → USDC · monthly',
    token: 'WETH',
    status: 'cooldown',
    statusLabel: 'Cooldown · window opens in 9d',
    verb: 'swapped',
    createdAt: daysAgo(65),
    installedViaProposal: '#55',
    installedViaProposalSlug: 'proposal-55',
    installTxHash: '0xinst…0055',
    totalDistributed: 94.1,
    forecast30d: 14.0,
    nextDispatchLabel: 'Claim window opens in 9d',
    nextDispatchAt: daysFromNow(9),
    pending: { amount: 12.4, token: 'WETH' },
    cooldown: { readyAt: daysFromNow(9), totalMs: 30 * DAY },
    lastDispatch: {
        amount: 12.4,
        token: 'WETH',
        at: daysAgo(11),
        txHash: '0xcafe…b4be',
        recipientsCount: 1,
    },
    recipients: sweepRecipients,
    recipientsMore: 0,
    recipientGroup: 'DAO vaults',
    dispatches: generateDispatches({
        policyId: 'sweep',
        count: 4,
        token: 'WETH',
        amountRange: [10, 18],
        topRecipients: sweepRecipients,
        spanDays: 60,
        startDaysAgo: 62,
    }),
    events: [
        {
            id: 'sweep-installed',
            kind: 'policyInstalled',
            at: daysAgo(65),
            title: 'Policy installed',
            description: 'Stable sweep deployed via proposal #55.',
            proposalId: '#55',
            proposalSlug: 'proposal-55',
        },
    ],
    schema: {
        source: 'Fee collector · 0xFee5…b001',
        allowance: {
            type: 'Drain',
            detail: 'Full WETH balance at each epoch',
        },
        model: {
            type: 'Solo recipient',
            detail: 'Proceeds routed to treasury USDC vault',
        },
        recipients: [
            {
                ratio: '100%',
                name: 'Treasury · USDC vault',
                address: '0xc0w5…wa9p',
            },
        ],
    },
});

const buildGrantsPolicy = (): Omit<IFlowPolicy, 'address'> => ({
    id: 'grants',
    name: 'Grants program',
    description:
        'Claim-window distribution of approved grants up to 25k USDC each.',
    strategy: 'Claimer',
    strategyLong: 'Claimer policy · approved claims',
    token: 'USDC',
    status: 'live',
    statusLabel: 'Claim window open · 4,180 USDC claimable',
    verb: 'claimed',
    createdAt: daysAgo(50),
    installedViaProposal: '#61',
    installedViaProposalSlug: 'proposal-61',
    installTxHash: '0xinst…0061',
    totalDistributed: 128_500,
    forecast30d: 30_000,
    nextDispatchLabel: 'Claim-driven · no scheduled dispatch',
    nextDispatchAt: hoursAgo(-20),
    pending: { amount: 4180, token: 'USDC' },
    cooldown: null,
    failedLastDispatch: {
        at: daysAgo(18),
        reason: 'Slippage tolerance exceeded (0.8% vs 0.5% max).',
        txHash: '0xfa11…ed18',
    },
    lastDispatch: {
        amount: 7300,
        token: 'USDC',
        at: hoursAgo(4),
        txHash: '0xa1b2…14de',
        recipientsCount: 1,
    },
    recipients: grantsRecipients,
    recipientsMore: 4,
    recipientGroup: 'External EOAs',
    dispatches: [
        ...generateDispatches({
            policyId: 'grants',
            count: 9,
            token: 'USDC',
            amountRange: [3000, 9000],
            topRecipients: grantsRecipients,
            spanDays: 46,
            startDaysAgo: 46,
        }),
        {
            id: 'grants-d-failed-1',
            at: daysAgo(18),
            amount: 4800,
            token: 'USDC',
            recipientsCount: 1,
            topRecipients: grantsRecipients,
            txHash: '0xfa11…ed18',
            status: 'failed',
            failureReason: 'Slippage tolerance exceeded',
        },
    ],
    events: [
        {
            id: 'grants-installed',
            kind: 'policyInstalled',
            at: daysAgo(50),
            title: 'Policy installed',
            description: 'Grants program deployed via proposal #61.',
            proposalId: '#61',
            proposalSlug: 'proposal-61',
        },
        {
            id: 'grants-dispatch-failed',
            kind: 'dispatchFailed',
            at: daysAgo(18),
            title: 'Dispatch failed',
            description:
                'Swap reverted — slippage tolerance exceeded (0.8% vs 0.5% max).',
            txHash: '0xfa11…ed18',
        },
        {
            id: 'grants-settings-updated',
            kind: 'settingsUpdated',
            at: daysAgo(12),
            title: 'Settings updated',
            description:
                'Per-claim cap raised from 10k to 25k USDC; slippage tolerance relaxed.',
            proposalId: '#67',
            proposalSlug: 'proposal-67',
        },
    ],
    schema: {
        source: 'Grants vault · 0x6ra7…c0de',
        allowance: {
            type: 'Pull',
            detail: 'Claimants pull approved amounts in the window',
        },
        model: {
            type: 'Tiered',
            detail: 'Per-claim cap: up to 25,000 USDC',
        },
        recipients: grantsFullRecipients,
    },
});

const buildGrantsStreamPolicy = (): Omit<IFlowPolicy, 'address'> => ({
    id: 'grants-stream',
    name: 'Research grants stream',
    description: 'Quarterly grant stream to 3 research collectives.',
    strategy: 'Stream',
    strategyLong: 'Stream · quarterly epoch',
    token: 'USDC',
    status: 'awaiting',
    statusLabel: 'Awaiting proposal #71',
    verb: 'streamed',
    createdAt: daysAgo(12),
    installedViaProposal: '#69',
    installedViaProposalSlug: 'proposal-69',
    installTxHash: '0xinst…0069',
    totalDistributed: 0,
    forecast30d: 0,
    nextDispatchLabel: 'Awaiting proposal #71',
    nextDispatchAt: undefined,
    pending: null,
    cooldown: null,
    lastDispatch: undefined,
    recipients: grantsStreamRecipients,
    recipientsMore: 0,
    recipientGroup: 'Research DAOs',
    dispatches: [],
    events: [
        {
            id: 'grants-stream-installed',
            kind: 'policyInstalled',
            at: daysAgo(12),
            title: 'Policy installed',
            description:
                'Research grants stream scaffolded via proposal #69 — awaiting activation.',
            proposalId: '#69',
            proposalSlug: 'proposal-69',
        },
        {
            id: 'grants-stream-settings-updated',
            kind: 'settingsUpdated',
            at: daysAgo(4),
            title: 'Settings updated',
            description:
                'Quarterly cadence confirmed, awaiting activation vote in proposal #71.',
            proposalId: '#71',
            proposalSlug: 'proposal-71',
        },
    ],
    schema: {
        source: 'Treasury vault · 0x9fA7…2e01',
        allowance: {
            type: 'Stream',
            detail: '12,500 USDC per epoch · every 90 days',
        },
        model: {
            type: 'Ratio splitter',
            detail: '3 recipients · voter-weighted',
        },
        recipients: grantsStreamFullRecipients,
    },
});

const buildMultiPolicy = (): Omit<IFlowPolicy, 'address'> => ({
    id: 'multi',
    name: 'Cross-program distribution',
    description:
        'Routes fee sweeps across buyback, LP, and contributor subpolicies.',
    strategy: 'Multi-dispatch',
    strategyLong: 'Multi-dispatch · chained routers',
    token: 'MERC',
    status: 'paused',
    statusLabel: 'Paused · review pending',
    verb: 'distributed',
    createdAt: daysAgo(45),
    installedViaProposal: '#63',
    installedViaProposalSlug: 'proposal-63',
    installTxHash: '0xinst…0063',
    totalDistributed: 85_000,
    forecast30d: 0,
    nextDispatchLabel: 'Paused · review pending',
    pending: null,
    cooldown: null,
    lastDispatch: {
        amount: 42_000,
        token: 'MERC',
        at: daysAgo(22),
        txHash: '0xmu17…21c3',
        recipientsCount: 2,
    },
    recipients: multiRecipients,
    recipientsMore: 0,
    recipientGroup: 'Sub-routers',
    dispatches: generateDispatches({
        policyId: 'multi',
        count: 2,
        token: 'MERC',
        amountRange: [40_000, 45_000],
        topRecipients: multiRecipients,
        spanDays: 18,
        startDaysAgo: 40,
    }),
    events: [
        {
            id: 'multi-installed',
            kind: 'policyInstalled',
            at: daysAgo(45),
            title: 'Policy installed',
            description:
                'Cross-program distribution deployed via proposal #63.',
            proposalId: '#63',
            proposalSlug: 'proposal-63',
        },
        {
            id: 'multi-paused',
            kind: 'paused',
            at: daysAgo(10),
            title: 'Policy paused',
            description: 'Paused for post-incident review.',
            proposalId: '#68',
            proposalSlug: 'proposal-68',
        },
    ],
    schema: {
        source: 'Treasury vault · 0x9fA7…2e01',
        allowance: {
            type: 'Fixed per epoch',
            detail: '100,000 MERC per epoch · every 14 days',
        },
        model: {
            type: 'Ratio splitter',
            detail: 'Routes to nested policies',
        },
        recipients: [
            {
                ratio: '60%',
                name: 'Contributor payroll (sub-router)',
                address: 'policy:payroll',
            },
            {
                ratio: '40%',
                name: 'LP incentives (sub-router)',
                address: 'policy:lp',
            },
        ],
        subRouters: multiSubRouters,
    },
});

const buildPolicies = (): Omit<IFlowPolicy, 'address'>[] => [
    buildPayrollPolicy(),
    buildLpPolicy(),
    buildBurnPolicy(),
    buildSweepPolicy(),
    buildGrantsPolicy(),
    buildGrantsStreamPolicy(),
    buildMultiPolicy(),
];

const buildRecipientsAggregate = (
    policies: IFlowPolicy[],
): IFlowRecipientAggregate[] => {
    const map = new Map<string, IFlowRecipientAggregate>();
    for (const policy of policies) {
        for (const dispatch of policy.dispatches) {
            if (dispatch.status === 'failed') {
                continue;
            }
            const top = dispatch.topRecipients[0];
            if (top == null) {
                continue;
            }
            const key = top.address;
            const existing = map.get(key);
            const share = typeof top.pct === 'number' ? top.pct / 100 : 1;
            const contribution = dispatch.amount * share;
            if (existing) {
                existing.amountsByToken[dispatch.token] =
                    (existing.amountsByToken[dispatch.token] ?? 0) +
                    contribution;
                existing.dispatchCount += 1;
                if (
                    new Date(dispatch.at).getTime() >
                    new Date(existing.lastReceivedAt).getTime()
                ) {
                    existing.lastReceivedAt = dispatch.at;
                }
                if (!existing.fromPolicyIds.includes(policy.id)) {
                    existing.fromPolicyIds.push(policy.id);
                }
            } else {
                map.set(key, {
                    address: top.address,
                    name: top.name,
                    group: policy.recipientGroup,
                    fromPolicyIds: [policy.id],
                    amountsByToken: {
                        [dispatch.token]: contribution,
                    } as Partial<Record<FlowTokenSymbol, number>>,
                    dispatchCount: 1,
                    lastReceivedAt: dispatch.at,
                });
            }
        }
    }
    return Array.from(map.values()).sort(
        (a, b) =>
            new Date(b.lastReceivedAt).getTime() -
            new Date(a.lastReceivedAt).getTime(),
    );
};

const buildDao = (network: string, addressOrEns: string): IFlowDao => ({
    network,
    addressOrEns,
    name: 'Money Machine DAO',
    avatarColor: '#003bf5',
});

export const getMockFlowData = (
    network: string,
    addressOrEns: string,
): IFlowDaoData => {
    const rawPolicies = buildPolicies();
    // Inject synthetic `address` values so the mock satisfies `IFlowPolicy.address` (used
    // by the pills grouping + external-edit links). Real Envio data carries the actual
    // plugin address.
    const policies = rawPolicies.map((p) => ({
        ...p,
        address: p.id.startsWith('0x')
            ? p.id
            : (`0xmock${p.id.padEnd(36, '0')}`.slice(0, 42) as string),
    }));
    const recipients = buildRecipientsAggregate(policies);
    return {
        dao: buildDao(network, addressOrEns),
        policies,
        groupedPolicies: groupPolicies(policies),
        orchestrators: [],
        recipients,
    };
};

export { buildRecipientsAggregate };

export const getAllDispatches = (data: IFlowDaoData): IFlowDispatch[] =>
    data.policies
        .flatMap((policy) =>
            policy.dispatches.map((dispatch) => ({
                ...dispatch,
                policyId: policy.id,
            })),
        )
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

export const getAllEvents = (data: IFlowDaoData): IFlowEvent[] =>
    data.policies
        .flatMap((policy) => policy.events)
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
