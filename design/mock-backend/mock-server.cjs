'use strict';
// Mock Aragon backend + JSON-RPC endpoint. Usage: node mock-server.cjs [port]
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const D = require('./data.cjs');

const PORT = Number(process.argv[2] ?? process.env.MOCK_PORT ?? 4100);
const LOG = path.join(__dirname, 'mock-requests.log');
const log = (line) =>
    fs.appendFileSync(LOG, `${new Date().toISOString()} ${line}\n`);

const page = (items, q) => {
    const pageNum = Number(q.get('page') ?? 1);
    const pageSize = Number(q.get('pageSize') ?? 10);
    const start = (pageNum - 1) * pageSize;
    return {
        metadata: {
            page: pageNum,
            pageSize,
            totalRecords: items.length,
            totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
        },
        data: items.slice(start, start + pageSize),
    };
};
const bodyPage = (items, pagination = {}) => {
    const pageNum = pagination.page ?? 1;
    const pageSize = pagination.pageSize ?? 20;
    const start = (pageNum - 1) * pageSize;
    return {
        metadata: {
            page: pageNum,
            pageSize,
            totalRecords: items.length,
            totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
        },
        data: items.slice(start, start + pageSize),
    };
};

const lc = (s) => (s ?? '').toLowerCase();
const daoFromId = (id) => {
    if (!id) {
        return undefined;
    }
    const a = lc(id).split('-').pop();
    return D.DAOS[a];
};
const daoFromAddr = (a) => D.DAOS[lc(a)];
const daoFromPlugin = (pa) =>
    Object.values(D.DAOS).find((d) => lc(d.plugin.address) === lc(pa));
const allProposals = () => Object.values(D.DAOS).flatMap((d) => d.proposals);

const notFound = (res, desc = 'Not found') =>
    send(res, 404, { code: 'notFound', description: desc });
const send = (res, status, body) => {
    res.writeHead(status, {
        'content-type': 'application/json',
        'access-control-allow-origin': '*',
    });
    res.end(JSON.stringify(body));
};

// ---------- workspace helpers ----------
const accountRefs = (body) =>
    (body?.accounts ?? []).map((a) => ({
        network: a.network,
        address: lc(a.address),
    }));
const accountDaos = (body) =>
    accountRefs(body)
        .map((r) => D.DAOS[r.address])
        .filter(Boolean);
const coverage = (body, resource) =>
    accountRefs(body).map((r) => ({
        account: r,
        resource,
        source: 'index',
        status: D.DAOS[r.address] ? 'available' : 'unsupported',
    }));

// ---------- JSON-RPC ----------
const viem = require(
    require.resolve('viem', {
        paths: [
            require('node:path').join(__dirname, '..', '..', 'apps', 'app'),
        ],
    }),
);
const reverseAbi = [
    {
        name: 'reverseWithGateways',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { type: 'bytes', name: 'reverseName' },
            { type: 'uint256', name: 'coinType' },
            { type: 'string[]', name: 'gateways' },
        ],
        outputs: [
            { type: 'string', name: 'resolvedName' },
            { type: 'address', name: 'resolver' },
            { type: 'address', name: 'reverseResolver' },
        ],
    },
];
const resolveAbi = [
    {
        name: 'resolveWithGateways',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { type: 'bytes', name: 'name' },
            { type: 'bytes', name: 'data' },
            { type: 'string[]', name: 'gateways' },
        ],
        outputs: [{ type: 'bytes' }, { type: 'address', name: 'address' }],
    },
];
const multicallAbi = [
    {
        name: 'aggregate3',
        type: 'function',
        stateMutability: 'payable',
        inputs: [
            {
                name: 'calls',
                type: 'tuple[]',
                components: [
                    { name: 'target', type: 'address' },
                    { name: 'allowFailure', type: 'bool' },
                    { name: 'callData', type: 'bytes' },
                ],
            },
        ],
        outputs: [
            {
                name: 'returnData',
                type: 'tuple[]',
                components: [
                    { name: 'success', type: 'bool' },
                    { name: 'returnData', type: 'bytes' },
                ],
            },
        ],
    },
];
const ENS_BY_ADDR = Object.fromEntries(
    D.PEOPLE.filter((p) => p.ens).map((p) => [p.address.toLowerCase(), p.ens]),
);
ENS_BY_ADDR[D.TV_DAO_ADDR.toLowerCase()] = 'meridian.dao.eth';
ENS_BY_ADDR[D.MS_DAO_ADDR.toLowerCase()] = 'atlas-grants.dao.eth';
const ZERO_WORD = `0x${'0'.repeat(64)}`;
// Returns { success, returnData } for a single contract call.
const innerCall = (to, data) => {
    try {
        const dec = viem.decodeFunctionData({ abi: reverseAbi, data });
        const a = String(dec.args[0]).toLowerCase();
        const name = ENS_BY_ADDR[a];
        if (!name) {
            return { success: false, returnData: '0x' };
        }
        return {
            success: true,
            returnData: viem.encodeFunctionResult({
                abi: reverseAbi,
                functionName: 'reverseWithGateways',
                result: [
                    name,
                    '0x231b0ee14048e9dccd1d247744d114a4eb5e8e63',
                    '0x231b0ee14048e9dccd1d247744d114a4eb5e8e63',
                ],
            }),
        };
    } catch {
        // Best effort: carry on without it.
    }
    try {
        const dec = viem.decodeFunctionData({ abi: resolveAbi, data });
        const inner = dec.args[1];
        const isel = inner.slice(0, 10);
        let out = '0x';
        if (isel === viem.toFunctionSelector('text(bytes32,string)')) {
            out = viem.encodeAbiParameters([{ type: 'string' }], ['']);
        } else {
            const node = inner.slice(10, 74);
            const hit = Object.entries(ENS_BY_ADDR).find(
                ([, n]) => viem.namehash(n).slice(2) === node,
            );
            out = viem.encodeAbiParameters(
                [{ type: 'address' }],
                [hit ? hit[0] : '0x0000000000000000000000000000000000000000'],
            );
        }
        return {
            success: true,
            returnData: viem.encodeFunctionResult({
                abi: resolveAbi,
                functionName: 'resolveWithGateways',
                result: [out, '0x231b0ee14048e9dccd1d247744d114a4eb5e8e63'],
            }),
        };
    } catch {
        // Best effort: carry on without it.
    }
    const sel = (data ?? '').slice(0, 10);
    const person = (word) =>
        D.PEOPLE.find((p) => p.address === `0x${word.slice(24)}`.toLowerCase());
    const arg = (i) => data.slice(10 + i * 64, 10 + (i + 1) * 64);
    const u256 = (v) => ({
        success: true,
        returnData: viem.encodeAbiParameters([{ type: 'uint256' }], [v]),
    });
    // canVote(uint256,address,uint8)
    if (sel === viem.toFunctionSelector('canVote(uint256,address,uint8)')) {
        return {
            success: true,
            returnData: viem.encodeAbiParameters([{ type: 'bool' }], [true]),
        };
    }
    // getVotes(address) / getPastVotes(address,uint256): delegated voting power
    if (
        sel === viem.toFunctionSelector('getVotes(address)') ||
        sel === viem.toFunctionSelector('getPastVotes(address,uint256)')
    ) {
        const p = person(arg(0));
        return u256(p ? BigInt(Math.round(p.vp)) * 10n ** 18n : 0n);
    }
    if (
        sel === viem.toFunctionSelector('getPastTotalSupply(uint256)') ||
        sel === viem.toFunctionSelector('totalSupply()')
    ) {
        return u256(50_000_000n * 10n ** 18n);
    }
    // delegates(address): everybody self-delegates
    if (sel === viem.toFunctionSelector('delegates(address)')) {
        return {
            success: true,
            returnData: viem.encodeAbiParameters(
                [{ type: 'address' }],
                [`0x${arg(0).slice(24)}`],
            ),
        };
    }
    if (sel === viem.toFunctionSelector('decimals()')) {
        return u256(18n);
    }
    // hasPermission(where, who, permissionId, data): grant everything to the demo wallet (nadia.eth) so wallet-gated pages render.
    if (sel === '0xfdef9106') {
        const who = `0x${data.slice(98, 138)}`.toLowerCase();
        return {
            success: true,
            returnData: viem.encodeAbiParameters(
                [{ type: 'bool' }],
                [who === D.PEOPLE[0].address],
            ),
        };
    }
    if (
        sel === '0x70a08231' &&
        (to ?? '').toLowerCase() === D.TOKENS.MRD.address.toLowerCase()
    ) {
        const who = `0x${data.slice(34, 74)}`.toLowerCase();
        const person = D.PEOPLE.find((p) => p.address === who);
        const bal = person ? BigInt(Math.round(person.bal)) * 10n ** 18n : 0n;
        return {
            success: true,
            returnData: viem.encodeAbiParameters([{ type: 'uint256' }], [bal]),
        };
    }
    // resolveWithGateways (avatar / text / addr lookups): fail so the UI falls back.
    if (sel === '0xa1472844' || sel === '0x9061b923') {
        return { success: false, returnData: '0x' };
    }
    return { success: true, returnData: ZERO_WORD };
};
const ethCall = (tx) => {
    const data = tx?.data ?? tx?.input ?? '0x';
    if (data.startsWith('0x82ad56cb')) {
        const { args } = viem.decodeFunctionData({ abi: multicallAbi, data });
        const results = args[0].map((c) => innerCall(c.target, c.callData));
        return viem.encodeFunctionResult({
            abi: multicallAbi,
            functionName: 'aggregate3',
            result: results,
        });
    }
    const r = innerCall(tx?.to, data);
    if (!r.success) {
        return { __error: true };
    }
    return r.returnData;
};
const rpcResult = (call) => {
    const { method } = call;
    switch (method) {
        case 'eth_chainId':
            return '0x1';
        case 'net_version':
            return '1';
        case 'eth_blockNumber':
            return `0x${D.HEAD_BLOCK.toString(16)}`;
        case 'eth_gasPrice':
            return '0x3b9aca00';
        case 'eth_maxPriorityFeePerGas':
            return '0x3b9aca00';
        case 'eth_getBalance':
            return '0x0';
        case 'eth_getCode':
            return '0x';
        case 'eth_getTransactionCount':
            return '0x0';
        case 'eth_getBlockByNumber': {
            const tag = call.params?.[0];
            const bn =
                typeof tag === 'string' && tag.startsWith('0x')
                    ? Number.parseInt(tag, 16)
                    : D.HEAD_BLOCK;
            const ts = D.NOW - (D.HEAD_BLOCK - bn) * 12;
            const z = `0x${'0'.repeat(64)}`;
            return {
                number: `0x${bn.toString(16)}`,
                timestamp: `0x${ts.toString(16)}`,
                hash: D.txh(`block-${bn}`),
                parentHash: z,
                nonce: '0x0000000000000000',
                sha3Uncles: z,
                logsBloom: `0x${'0'.repeat(512)}`,
                transactionsRoot: z,
                stateRoot: z,
                receiptsRoot: z,
                miner: '0x0000000000000000000000000000000000000000',
                difficulty: '0x0',
                totalDifficulty: '0x0',
                extraData: '0x',
                size: '0x1',
                gasLimit: '0x1c9c380',
                gasUsed: '0x0',
                baseFeePerGas: '0x3b9aca00',
                mixHash: z,
                uncles: [],
                transactions: [],
            };
        }
        case 'eth_call':
            return ethCall(call.params?.[0]);
        case 'eth_estimateGas':
            return '0x5208';
        default:
            return null;
    }
};

const handle = async (req, res, bodyText) => {
    const url = new URL(req.url, 'http://x');
    const p = url.pathname;
    const q = url.searchParams;
    let body;
    try {
        body = bodyText ? JSON.parse(bodyText) : undefined;
    } catch {
        body = undefined;
    }

    if (p.startsWith('/rpc')) {
        const one = (c) => {
            const r = rpcResult(c ?? {});
            if (r?.__error) {
                return {
                    jsonrpc: '2.0',
                    id: c.id,
                    error: {
                        code: 3,
                        message: 'execution reverted',
                        data: '0x',
                    },
                };
            }
            return { jsonrpc: '2.0', id: c?.id, result: r };
        };
        const reply = Array.isArray(body) ? body.map(one) : one(body);
        log(
            `RPC ${Array.isArray(body) ? body.map((c) => c.method).join(',') : body?.method}`,
        );
        return send(res, 200, reply);
    }

    let m;
    // DAO
    if ((m = p.match(/^\/v[23]\/daos\/([^/]+)\/ens\/([^/]+)$/))) {
        const d = Object.values(D.DAOS).find(
            (x) =>
                lc(x.dao.ens) === lc(decodeURIComponent(m[2])) ||
                lc(x.dao.subdomain) === lc(decodeURIComponent(m[2])),
        );
        return d ? send(res, 200, d.dao) : notFound(res, 'DAO not found');
    }
    if ((m = p.match(/^\/v[23]\/daos\/member\/([^/]+)$/))) {
        const excl = lc(q.get('excludeDaoId'));
        const list = [
            D.DAOS[D.TV_DAO_ADDR].dao,
            D.DAOS[D.MS_DAO_ADDR].dao,
            ...D.EXPLORE_DAOS.slice(4, 6),
        ].filter((d) => lc(d.id) !== excl);
        return send(res, 200, page(list, q));
    }
    if ((m = p.match(/^\/v[23]\/daos\/([^/]+)$/))) {
        const d = daoFromId(decodeURIComponent(m[1]));
        return d ? send(res, 200, d.dao) : notFound(res, 'DAO not found');
    }
    if (/^\/v[23]\/daos$/.test(p)) {
        const search = lc(q.get('search'));
        const list = D.EXPLORE_DAOS.filter(
            (d) => !search || lc(d.name).includes(search),
        );
        return send(res, 200, page(list, q));
    }
    if (
        (m = p.match(/^\/v[23]\/plugins\/by-dao\/([^/]+)\/([^/]+)\/details$/))
    ) {
        const d = daoFromAddr(m[2]);
        const x = D.EXPLORE_DAOS.find((e) => lc(e.address) === lc(m[2]));
        return send(res, 200, d ? [d.plugin] : x ? x.plugins : []);
    }
    if ((m = p.match(/^\/v[23]\/permissions\/([^/]+)\/([^/]+)$/))) {
        const d = daoFromAddr(m[2]);
        return send(res, 200, page(d ? d.permissions : [], q));
    }
    if ((m = p.match(/^\/v[23]\/policies\/([^/]+)\/([^/]+)$/))) {
        return send(res, 200, []);
    }
    // Members
    if ((m = p.match(/^\/v2\/members\/([^/]+)\/([^/]+)\/exists$/))) {
        const d = daoFromPlugin(m[2]);
        return send(res, 200, {
            status: d?.members.some((x) => lc(x.address) === lc(m[1])) ?? false,
        });
    }
    if ((m = p.match(/^\/v2\/members\/([^/]+)$/))) {
        const d =
            daoFromId(q.get('daoId')) ?? daoFromPlugin(q.get('pluginAddress'));
        const mem = d?.members.find(
            (x) =>
                lc(x.address) === lc(m[1]) ||
                lc(x.ens) === lc(decodeURIComponent(m[1])),
        );
        if (mem) {
            return send(res, 200, mem);
        }
        if (d && d.plugin.interfaceType === 'tokenVoting') {
            return send(res, 200, {
                address: m[1],
                ens: null,
                type: 'token-voting',
                votingPower: '0',
                tokenBalance: '0',
                firstActive: null,
                lastActive: null,
                metrics: {
                    firstActivity: null,
                    lastActivity: null,
                    delegationCount: 0,
                },
            });
        }
        return notFound(res, 'Member not found');
    }
    if (p === '/v2/members') {
        const d =
            daoFromId(q.get('daoId')) ?? daoFromPlugin(q.get('pluginAddress'));
        return send(res, 200, page(d ? d.members : [], q));
    }
    // Proposals
    if (p === '/v2/proposals/can-create-proposal') {
        return send(res, 200, { status: true });
    }
    if ((m = p.match(/^\/v2\/proposals\/slug\/([^/]+)$/))) {
        const slug = lc(decodeURIComponent(m[1]));
        const d = daoFromId(q.get('daoId'));
        const pool = d ? d.proposals : allProposals();
        const prop = pool.find((x) => {
            const dd = daoFromPlugin(x.pluginAddress);
            return `${dd.plugin.slug}-${x.incrementalId}` === slug;
        });
        return prop
            ? send(res, 200, prop)
            : notFound(res, 'Proposal not found');
    }
    if ((m = p.match(/^\/v2\/proposals\/([^/]+)\/actions$/))) {
        const actions = D.ACTIONS[decodeURIComponent(m[1])] ?? [];
        return send(res, 200, {
            decoding: false,
            actions,
            rawActions: actions.map((a) => ({
                to: a.to,
                value: a.value,
                data: a.data,
            })),
        });
    }
    if (p === '/v2/proposals') {
        const d =
            daoFromId(q.get('daoId')) ?? daoFromPlugin(q.get('pluginAddress'));
        let list = d ? d.proposals : [];
        if (q.get('pluginAddress')) {
            list = list.filter(
                (x) => lc(x.pluginAddress) === lc(q.get('pluginAddress')),
            );
        }
        if (q.get('creatorAddress')) {
            list = list.filter(
                (x) => lc(x.creator.address) === lc(q.get('creatorAddress')),
            );
        }
        if (q.get('isExecuted') != null) {
            list = list.filter(
                (x) => String(x.executed.status) === q.get('isExecuted'),
            );
        }
        return send(res, 200, page(list, q));
    }
    if (p === '/v2/votes') {
        let list;
        if (q.get('proposalId')) {
            list = D.VOTES[q.get('proposalId')] ?? [];
        } else {
            list = Object.values(D.VOTES).flat();
            if (q.get('address')) {
                list = list.filter(
                    (v) => lc(v.member.address) === lc(q.get('address')),
                );
            }
            if (q.get('pluginAddress')) {
                list = list.filter(
                    (v) =>
                        !v.proposal ||
                        lc(v.proposal.pluginAddress) ===
                            lc(q.get('pluginAddress')),
                );
            }
            list = [...list].sort(
                (a, b) => b.blockTimestamp - a.blockTimestamp,
            );
        }
        const include = q.get('includeInfo') === 'true';
        const out = list.map(({ proposal, ...v }) =>
            include ? { ...v, proposal } : v,
        );
        if (q.get('address') && q.get('proposalId')) {
            return send(
                res,
                200,
                page(
                    out.filter(
                        (v) => lc(v.member.address) === lc(q.get('address')),
                    ),
                    q,
                ),
            );
        }
        return send(res, 200, page(out, q));
    }
    // Finance
    if (p === '/v2/assets') {
        const d = daoFromId(q.get('daoId'));
        return send(res, 200, page(d ? d.assets : [], q));
    }
    if ((m = p.match(/^\/v2\/tokens\/([^/]+)\/([^/]+)$/))) {
        const t = Object.values(D.TOKENS).find(
            (x) => lc(x.address) === lc(m[2]),
        );
        return t ? send(res, 200, t) : notFound(res, 'Token not found');
    }
    if ((m = p.match(/^\/v2\/transactions\/([^/]+)\/([^/]+)\/actions$/))) {
        const tx = Object.values(D.DAOS)
            .flatMap((d) => d.txs)
            .find((t) => t.id === decodeURIComponent(m[2]));
        const propActions =
            D.ACTIONS[
                `${D.NET}-${D.TV_PLUGIN}-${Number(tx?.proposalIndex ?? 0) + 1}`
            ] ?? [];
        return send(res, 200, {
            source: 'proposal',
            actionCount: propActions.length,
            executedBy: D.TV_PLUGIN,
            transactionHash: tx?.transactionHash ?? D.txh('x'),
            blockTimestamp: tx?.blockTimestamp ?? D.NOW,
            proposalSlug: `MGP-${Number(tx?.proposalIndex ?? 0) + 1}`,
            decoding: false,
            actions: propActions,
        });
    }
    if (p === '/v2/transactions') {
        const d = daoFromId(q.get('daoId')) ?? daoFromAddr(q.get('address'));
        let list = d ? d.txs : [];
        if (q.get('side')) {
            list = list.filter((t) => t.side === q.get('side'));
        }
        if (q.get('type')) {
            list = list.filter((t) => t.side === 'execution');
        }
        return send(res, 200, page(list, q));
    }
    // Settings
    if (p === '/v2/plugins/installation-data') {
        return send(res, 200, { preparedSetupData: { helpers: [] } });
    }
    if (p.startsWith('/v2/plugins/logs/')) {
        return notFound(res, 'No logs');
    }
    // Delegate statement
    if (/^\/v[23]\/ipfs\/delegate-statement\//.test(p)) {
        return notFound(res, 'No statement');
    }
    // Workspace queries
    if (p === '/v2/workspaces/query/accounts') {
        const data = accountRefs(body).map((r) => {
            const d = D.DAOS[r.address];
            return {
                network: r.network,
                address: r.address,
                type: d ? 'dao' : 'unknown',
                status: d ? 'available' : 'unsupported',
                indexed: !!d,
                name: d?.dao.name ?? null,
            };
        });
        return send(res, 200, { data });
    }
    if (p === '/v2/workspaces/query/assets') {
        const map = new Map();
        for (const d of accountDaos(body)) {
            for (const a of d.assets) {
                const key = a.token.address;
                const cur = map.get(key) ?? {
                    amount: 0,
                    amountUsd: 0,
                    token: a.token,
                    network: D.NET,
                    tokenAddress: a.token.address,
                    allocations: [],
                };
                cur.amount += Number(a.amount);
                cur.amountUsd += Number(a.amountUsd);
                cur.allocations.push({
                    account: { network: D.NET, address: d.dao.address },
                    amount: a.amount,
                    amountUsd: a.amountUsd,
                });
                map.set(key, cur);
            }
        }
        const items = [...map.values()]
            .map((x) => ({
                ...x,
                amount: String(x.amount),
                amountUsd: x.amountUsd.toFixed(2),
            }))
            .sort((a, b) => Number(b.amountUsd) - Number(a.amountUsd));
        const total = items
            .reduce((s, x) => s + Number(x.amountUsd), 0)
            .toFixed(2);
        const r = bodyPage(items, body?.pagination);
        return send(res, 200, {
            ...r,
            metadata: { ...r.metadata, totalAmountUsd: total, spamCount: 0 },
            coverage: coverage(body, 'assets'),
            partial: false,
        });
    }
    if (p === '/v2/workspaces/query/transactions') {
        const items = accountDaos(body)
            .flatMap((d) =>
                d.txs.map((t) => ({
                    ...t,
                    account: { network: D.NET, address: d.dao.address },
                    internal: false,
                    daoAddress: d.dao.address,
                    type:
                        t.side === 'execution'
                            ? 'execution'
                            : t.token.symbol === 'ETH'
                              ? 'native'
                              : 'erc20',
                })),
            )
            .sort((a, b) => b.blockTimestamp - a.blockTimestamp);
        return send(res, 200, {
            ...bodyPage(items, body?.pagination),
            coverage: coverage(body, 'transactions'),
            partial: false,
        });
    }
    if (p === '/v2/workspaces/query/proposals') {
        const items = accountDaos(body)
            .flatMap((d) => d.proposals)
            .sort((a, b) => b.blockTimestamp - a.blockTimestamp);
        return send(res, 200, {
            ...bodyPage(items, body?.pagination),
            coverage: coverage(body, 'proposals'),
            partial: false,
        });
    }
    if (p === '/v2/workspaces/query/members') {
        const byAddr = new Map();
        for (const d of accountDaos(body)) {
            for (const mem of d.members) {
                const cur = byAddr.get(mem.address) ?? {
                    network: D.NET,
                    address: mem.address,
                    ens: mem.ens,
                    avatar: null,
                    memberships: [],
                };
                cur.memberships.push({
                    account: { network: D.NET, address: d.dao.address },
                    governance: {
                        address: d.plugin.address,
                        type: d.plugin.interfaceType,
                    },
                    role: 'member',
                    votingPower: mem.votingPower ?? undefined,
                    tokenBalance: mem.tokenBalance ?? undefined,
                });
                byAddr.set(mem.address, cur);
            }
        }
        return send(res, 200, {
            ...bodyPage([...byAddr.values()], body?.pagination),
            coverage: coverage(body, 'members'),
            partial: false,
        });
    }
    if (p === '/v2/workspaces/query/todo') {
        const proposals = accountDaos(body)
            .flatMap((d) => d.proposals)
            .filter(
                (x) =>
                    x.startDate < D.NOW &&
                    x.endDate > D.NOW &&
                    !x.executed.status,
            )
            .map((x) => ({ ...x, voteEndDate: x.endDate }));
        return send(res, 200, {
            proposals,
            transactions: [],
            coverage: coverage(body, 'todo'),
            partial: false,
        });
    }

    return null;
};

http.createServer((req, res) => {
    let chunks = '';
    req.on('data', (c) => {
        chunks += c;
    });
    req.on('end', async () => {
        try {
            const r = await handle(req, res, chunks);
            if (r === null) {
                log(
                    `UNMATCHED ${req.method} ${req.url} ${chunks.slice(0, 300)}`,
                );
                notFound(res, 'Unmatched mock route');
            } else if (!req.url.startsWith('/rpc')) {
                log(`OK ${req.method} ${req.url}`);
            }
        } catch (e) {
            log(`ERROR ${req.method} ${req.url} ${e.stack}`);
            send(res, 500, { code: 'mockError', description: String(e) });
        }
    });
}).listen(PORT, () =>
    console.log(`mock backend listening on http://localhost:${PORT}`),
);
