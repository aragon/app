'use strict';
// Request handling for the Northstar Protocol mock DAO (data-spp.cjs). The generic routes of mock-server.cjs assume
// one plugin per DAO (`d.plugin`); a staged process has a process plugin plus four bodies, each with its own members,
// sub-proposals and votes, and two of the bodies are Safes read through Aragon's backend at /v2/safe/*. So everything
// that concerns Northstar is answered here, before the server's own routing, and nothing else is touched.
//
//   const routes = createRoutes(S, { viem });
//   routes.handle(req, url, res, { send, notFound, body })  -> true when it answered the request
//   routes.innerCall(to, data)                               -> { success, returnData } for a Northstar contract
//                                                               call, undefined for anything else

const createRoutes = (S, { viem }) => {
    const lc = (s) => String(s ?? '').toLowerCase();
    const same = (a, b) => a != null && b != null && lc(a) === lc(b);
    const { NOW } = S;
    const fetchedAt = new Date(NOW * 1000).toISOString();

    const BODIES = new Set(Object.keys(S.MEMBERS).map(lc)); // TV, MS, Council Safe, Guardian Safe
    const MINE = new Set([S.DAO_ADDR, S.SPP_ADDR, ...BODIES].map(lc));
    const SAFE_ADDRS = new Set([S.COUNCIL_SAFE, S.GUARDIAN_SAFE].map(lc));
    const ALL_PROPOSALS = [...S.PROPOSALS, ...S.SUB_PROPOSALS];
    const proposalById = new Map(ALL_PROPOSALS.map((p) => [p.id, p]));
    const isDaoId = (id) =>
        id != null && lc(id).split('-').pop() === lc(S.DAO_ADDR);
    const isDaoAddr = (a) => same(a, S.DAO_ADDR);

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
    const ownSend = (res, status, body) => {
        res.writeHead(status, {
            'content-type': 'application/json',
            'access-control-allow-origin': '*',
        });
        res.end(JSON.stringify(body));
    };

    // ---------- Safe service (/v2/safe/:network/:address/...) ----------
    const safeMeta = (source) => ({ source, fetchedAt, stale: false });
    const safePage = (items, q, base) => {
        const limit = Number(q.get('limit') ?? 20);
        const offset = Number(q.get('offset') ?? 0);
        const results = items.slice(offset, offset + limit);
        const more = offset + limit < items.length;
        return {
            count: items.length,
            next: more
                ? `${base}?limit=${limit}&offset=${offset + limit}`
                : null,
            previous:
                offset > 0
                    ? `${base}?limit=${limit}&offset=${Math.max(0, offset - limit)}`
                    : null,
            results,
            meta: safeMeta('transaction-service'),
        };
    };
    const reportAbi = [
        {
            type: 'function',
            name: 'reportProposalResult',
            inputs: [
                { name: '_proposalId', type: 'uint256' },
                { name: '_stageId', type: 'uint16' },
                { name: '_resultType', type: 'uint8' },
                { name: '_tryAdvance', type: 'bool' },
            ],
            outputs: [],
            stateMutability: 'nonpayable',
        },
    ];
    const safeTxAction = (safe, tx) => {
        let inputData = { function: '', contract: '', parameters: [] };
        try {
            const dec = viem.decodeFunctionData({
                abi: reportAbi,
                data: tx.data,
            });
            inputData = {
                function: 'reportProposalResult',
                contract: 'StagedProposalProcessor',
                parameters: reportAbi[0].inputs.map((input, i) => ({
                    name: input.name,
                    type: input.type,
                    value: String(dec.args[i]),
                })),
            };
        } catch {
            // Not a report (e.g. changeThreshold): leave it undecoded.
        }
        return {
            type: 'Unknown',
            from: safe,
            to: tx.to,
            value: tx.value,
            data: tx.data ?? '0x',
            inputData,
        };
    };
    const handleSafe = (p, q, url, send, notFound) => {
        const m = p.match(
            /^\/v2\/safe\/([^/]+)\/([^/]+)\/(info|queue|history|next-nonce|transactions\/([^/]+)\/actions)$/,
        );
        if (!m || !SAFE_ADDRS.has(lc(m[2]))) {
            return false;
        }
        const safe = Object.keys(S.SAFE_STATE).find((a) => same(a, m[2]));
        const state = S.SAFE_STATE[safe];
        const base = `${url.origin}${p}`;
        switch (m[3]) {
            case 'info':
                send(200, { ...state.info, meta: safeMeta('chain') });
                return true;
            case 'queue':
                send(200, safePage(state.queue, q, base));
                return true;
            case 'history':
                send(200, safePage(state.history, q, base));
                return true;
            case 'next-nonce': {
                const highest = state.queue.reduce(
                    (n, t) => Math.max(n, Number(t.nonce) + 1),
                    Number(state.info.nonce),
                );
                send(200, {
                    nextNonce: String(highest),
                    currentNonce: state.info.nonce,
                    meta: safeMeta('chain'),
                });
                return true;
            }
            default: {
                const tx = [...state.queue, ...state.history].find((t) =>
                    same(t.safeTxHash, m[4]),
                );
                if (!tx) {
                    notFound('Safe transaction not found');
                    return true;
                }
                const action = safeTxAction(safe, tx);
                send(200, {
                    decoding: false,
                    actions: [action],
                    rawActions: [
                        {
                            to: action.to,
                            value: action.value,
                            data: action.data,
                        },
                    ],
                });
                return true;
            }
        }
    };

    // ---------- Aragon backend routes ----------
    const tokenVotingZeroMember = (address) => ({
        address,
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
    const membersOf = (pluginAddress) => {
        const key = Object.keys(S.MEMBERS).find((a) => same(a, pluginAddress));
        return key ? S.MEMBERS[key] : undefined;
    };

    const handle = (_req, url, res, helpers = {}) => {
        const p = url.pathname;
        const q = url.searchParams;
        const send = (status, body) =>
            (helpers.send ?? ownSend)(res, status, body);
        const notFound = (description = 'Not found') =>
            helpers.notFound
                ? helpers.notFound(res, description)
                : ownSend(res, 404, { code: 'notFound', description });
        let m;

        if (p.startsWith('/v2/safe/')) {
            return handleSafe(p, q, url, send, notFound);
        }

        // Safe transaction service (api.safe.global/tx-service, forwarded here by server-preload.cjs): balances of a
        // Northstar Safe, read by the Safe account page.
        if (
            (m = p.match(
                /^\/tx-service\/eth\/api\/v1\/safes\/([^/]+)\/balances\/$/,
            )) &&
            SAFE_ADDRS.has(lc(m[1]))
        ) {
            send(
                200,
                S.SAFE_STATE[
                    Object.keys(S.SAFE_STATE).find((a) => same(a, m[1]))
                ].balances,
            );
            return true;
        }

        // DAO
        if ((m = p.match(/^\/v[23]\/daos\/([^/]+)\/ens\/([^/]+)$/))) {
            const name = lc(decodeURIComponent(m[2]));
            if (name === lc(S.DAO.ens) || name === lc(S.DAO.subdomain)) {
                send(200, S.DAO);
                return true;
            }
            return false;
        }
        if (
            (m = p.match(/^\/v[23]\/daos\/([^/]+)$/)) &&
            isDaoId(decodeURIComponent(m[1]))
        ) {
            send(200, S.DAO);
            return true;
        }
        if (
            (m = p.match(
                /^\/v[23]\/plugins\/by-dao\/([^/]+)\/([^/]+)\/details$/,
            )) &&
            isDaoAddr(m[2])
        ) {
            send(200, S.PLUGINS);
            return true;
        }
        if (
            (m = p.match(/^\/v[23]\/permissions\/([^/]+)\/([^/]+)$/)) &&
            isDaoAddr(m[2])
        ) {
            send(200, page(S.PERMISSIONS, q));
            return true;
        }

        // Members (one list per body)
        if (
            (m = p.match(/^\/v2\/members\/([^/]+)\/([^/]+)\/exists$/)) &&
            BODIES.has(lc(m[2]))
        ) {
            send(200, {
                status: membersOf(m[2]).some((x) => same(x.address, m[1])),
            });
            return true;
        }
        if ((m = p.match(/^\/v2\/members\/([^/]+)$/))) {
            const pluginAddress = q.get('pluginAddress');
            const forBody =
                pluginAddress != null && BODIES.has(lc(pluginAddress));
            if (!forBody && !isDaoId(q.get('daoId'))) {
                return false;
            }
            const pool = forBody
                ? membersOf(pluginAddress)
                : S.daoEntry.members;
            const who = lc(decodeURIComponent(m[1]));
            const member = pool.find(
                (x) =>
                    lc(x.address) === who ||
                    (x.ens != null && lc(x.ens) === who),
            );
            if (member) {
                send(200, member);
            } else if (
                forBody &&
                same(pluginAddress, S.TV_ADDR) &&
                /^0x[0-9a-f]{40}$/.test(who)
            ) {
                send(200, tokenVotingZeroMember(m[1]));
            } else {
                notFound('Member not found');
            }
            return true;
        }
        if (p === '/v2/members') {
            const pluginAddress = q.get('pluginAddress');
            if (pluginAddress != null && BODIES.has(lc(pluginAddress))) {
                send(200, page(membersOf(pluginAddress), q));
                return true;
            }
            if (pluginAddress == null && isDaoId(q.get('daoId'))) {
                send(200, page(S.daoEntry.members, q));
                return true;
            }
            if (pluginAddress != null && same(pluginAddress, S.SPP_ADDR)) {
                send(200, page([], q)); // the process itself has no members
                return true;
            }
            return false;
        }

        // Proposals
        if ((m = p.match(/^\/v2\/proposals\/slug\/([^/]+)$/))) {
            const slug = lc(decodeURIComponent(m[1]));
            const sm = slug.match(/^nsp-(\d+)$/);
            if (!sm || (q.get('daoId') != null && !isDaoId(q.get('daoId')))) {
                return false;
            }
            const prop = S.PROPOSALS.find(
                (x) => x.incrementalId === Number(sm[1]),
            );
            prop ? send(200, prop) : notFound('Proposal not found');
            return true;
        }
        if ((m = p.match(/^\/v2\/proposals\/([^/]+)\/actions$/))) {
            const id = decodeURIComponent(m[1]);
            if (!proposalById.has(id)) {
                return false;
            }
            const actions = S.ACTIONS[id] ?? [];
            send(200, {
                decoding: false,
                actions,
                rawActions: actions.map((a) => ({
                    to: a.to,
                    value: a.value,
                    data: a.data,
                })),
            });
            return true;
        }
        if (p === '/v2/proposals') {
            const pluginAddress = q.get('pluginAddress');
            const mineByPlugin =
                pluginAddress != null && MINE.has(lc(pluginAddress));
            if (
                !mineByPlugin &&
                !(pluginAddress == null && isDaoId(q.get('daoId')))
            ) {
                return false;
            }
            let list =
                pluginAddress != null && BODIES.has(lc(pluginAddress))
                    ? S.SUB_PROPOSALS.filter((x) =>
                          same(x.pluginAddress, pluginAddress),
                      )
                    : S.PROPOSALS;
            if (q.get('creatorAddress')) {
                list = list.filter((x) =>
                    same(x.creator.address, q.get('creatorAddress')),
                );
            }
            if (q.get('isExecuted') != null) {
                list = list.filter(
                    (x) => String(x.executed.status) === q.get('isExecuted'),
                );
            }
            list = [...list].sort(
                (a, b) => b.blockTimestamp - a.blockTimestamp,
            );
            send(200, page(list, q));
            return true;
        }

        // Votes: by (sub-)proposal, or by body
        if (p === '/v2/votes') {
            const proposalId = q.get('proposalId');
            const pluginAddress = q.get('pluginAddress');
            let list;
            if (proposalId != null && S.VOTES[proposalId] != null) {
                list = S.VOTES[proposalId];
            } else if (
                proposalId == null &&
                pluginAddress != null &&
                MINE.has(lc(pluginAddress))
            ) {
                list = Object.values(S.VOTES)
                    .flat()
                    .filter(
                        (v) =>
                            same(pluginAddress, S.SPP_ADDR) ||
                            same(v.proposal.pluginAddress, pluginAddress),
                    );
            } else {
                return false;
            }
            if (q.get('address')) {
                list = list.filter((v) =>
                    same(v.member.address, q.get('address')),
                );
            }
            list = [...list].sort(
                (a, b) => b.blockTimestamp - a.blockTimestamp,
            );
            const include = q.get('includeInfo') === 'true';
            send(
                200,
                page(
                    list.map(({ proposal, ...v }) =>
                        include ? { ...v, proposal } : v,
                    ),
                    q,
                ),
            );
            return true;
        }

        // Finance
        if (p === '/v2/assets' && isDaoId(q.get('daoId'))) {
            send(200, page(S.ASSETS, q));
            return true;
        }
        if (
            (m = p.match(/^\/v2\/tokens\/([^/]+)\/([^/]+)$/)) &&
            same(m[2], S.NSP_TOKEN.address)
        ) {
            send(200, S.NSP_TOKEN);
            return true;
        }
        if ((m = p.match(/^\/v2\/transactions\/([^/]+)\/([^/]+)\/actions$/))) {
            const tx = S.TXS.find((t) => t.id === decodeURIComponent(m[2]));
            if (!tx) {
                return false;
            }
            const prop = S.PROPOSALS.find(
                (x) => x.proposalIndex === tx.proposalIndex,
            );
            const actions = prop ? S.ACTIONS[prop.id] : [];
            send(200, {
                source: 'proposal',
                actionCount: actions.length,
                executedBy: S.SPP_ADDR,
                transactionHash: tx.transactionHash,
                blockTimestamp: tx.blockTimestamp,
                proposalSlug: prop ? `NSP-${prop.incrementalId}` : undefined,
                decoding: false,
                actions,
            });
            return true;
        }
        if (
            p === '/v2/transactions' &&
            (isDaoId(q.get('daoId')) || isDaoAddr(q.get('address')))
        ) {
            let list = S.TXS;
            if (q.get('side')) {
                list = list.filter((t) => t.side === q.get('side'));
            }
            if (q.get('type')) {
                list = list.filter((t) => t.side === 'execution');
            }
            send(200, page(list, q));
            return true;
        }

        return false;
    };

    // ---------- JSON-RPC: contract reads of Northstar contracts ----------
    const sel = (sig) => viem.toFunctionSelector(sig);
    const SEL = {
        getVotes: sel('getVotes(address)'),
        getPastVotes: sel('getPastVotes(address,uint256)'),
        balanceOf: sel('balanceOf(address)'),
        totalSupply: sel('totalSupply()'),
        getPastTotalSupply: sel('getPastTotalSupply(uint256)'),
        decimals: sel('decimals()'),
        symbol: sel('symbol()'),
        name: sel('name()'),
        delegates: sel('delegates(address)'),
        canApprove: sel('canApprove(uint256,address)'),
        isMember: sel('isMember(address)'),
        isListed: sel('isListed(address)'),
        canVote: sel('canVote(uint256,address,uint8)'),
        getVotingToken: sel('getVotingToken()'),
        VERSION: sel('VERSION()'),
        getOwners: sel('getOwners()'),
        getThreshold: sel('getThreshold()'),
        nonce: sel('nonce()'),
        isOwner: sel('isOwner(address)'),
    };
    const enc = (type, value) => ({
        success: true,
        returnData: viem.encodeAbiParameters([{ type }], [value]),
    });
    const word = (data, i) => data.slice(10 + i * 64, 10 + (i + 1) * 64);
    const argAddr = (data, i) => `0x${word(data, i).slice(24)}`.toLowerCase();
    const argUint = (data, i) => BigInt(`0x${word(data, i)}`);
    const personVp = (a) => S.PEOPLE.find((x) => same(x.address, a))?.vp ?? 0;
    const tokens = (n) => BigInt(Math.round(n)) * 10n ** 18n;
    const subByIndex = (plugin, index) =>
        S.SUB_PROPOSALS.find(
            (x) =>
                same(x.pluginAddress, plugin) &&
                x.proposalIndex === String(index),
        );
    const isOpen = (sub) =>
        sub != null &&
        !sub.executed.status &&
        sub.startDate <= NOW &&
        NOW < sub.endDate;
    const hasVoted = (sub, voter) =>
        (S.VOTES[sub.id] ?? []).some((v) => same(v.member.address, voter));

    const innerCall = (to, data) => {
        if (to == null || data == null || data.length < 10) {
            return undefined;
        }
        const s = data.slice(0, 10).toLowerCase();
        if (same(to, S.NSP_TOKEN.address)) {
            if (
                s === SEL.getVotes ||
                s === SEL.getPastVotes ||
                s === SEL.balanceOf
            ) {
                return enc('uint256', tokens(personVp(argAddr(data, 0))));
            }
            if (s === SEL.totalSupply || s === SEL.getPastTotalSupply) {
                return enc('uint256', tokens(S.NSP_SUPPLY));
            }
            if (s === SEL.decimals) {
                return enc('uint8', 18);
            }
            if (s === SEL.symbol) {
                return enc('string', S.NSP_TOKEN.symbol);
            }
            if (s === SEL.name) {
                return enc('string', S.NSP_TOKEN.name);
            }
            if (s === SEL.delegates) {
                return enc('address', argAddr(data, 0)); // everybody self-delegates
            }
            return undefined;
        }
        if (same(to, S.MS_ADDR)) {
            const members = S.MEMBERS[S.MS_ADDR];
            if (s === SEL.canApprove) {
                const sub = subByIndex(S.MS_ADDR, argUint(data, 0));
                const voter = argAddr(data, 1);
                const isMember = members.some((x) => same(x.address, voter));
                return enc(
                    'bool',
                    isMember && isOpen(sub) && !hasVoted(sub, voter),
                );
            }
            if (s === SEL.isMember || s === SEL.isListed) {
                return enc(
                    'bool',
                    members.some((x) => same(x.address, argAddr(data, 0))),
                );
            }
            return undefined;
        }
        if (same(to, S.TV_ADDR)) {
            if (s === SEL.canVote) {
                const sub = subByIndex(S.TV_ADDR, argUint(data, 0));
                return enc(
                    'bool',
                    personVp(argAddr(data, 1)) > 0 && isOpen(sub),
                );
            }
            if (s === SEL.getVotingToken) {
                return enc('address', S.NSP_TOKEN.address);
            }
            return undefined;
        }
        if (SAFE_ADDRS.has(lc(to))) {
            const info =
                S.SAFE_STATE[Object.keys(S.SAFE_STATE).find((a) => same(a, to))]
                    .info;
            if (s === SEL.VERSION) {
                return enc('string', info.version);
            }
            if (s === SEL.getOwners) {
                return enc('address[]', info.owners);
            }
            if (s === SEL.getThreshold) {
                return enc('uint256', BigInt(info.threshold));
            }
            if (s === SEL.nonce) {
                return enc('uint256', BigInt(info.nonce));
            }
            if (s === SEL.isOwner) {
                return enc(
                    'bool',
                    info.owners.some((o) => same(o, argAddr(data, 0))),
                );
            }
            return undefined;
        }
        return undefined;
    };

    return { handle, innerCall, isMine: (a) => MINE.has(lc(a)) };
};

module.exports = { createRoutes };
