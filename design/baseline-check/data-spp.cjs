'use strict';
// Mock data of a third DAO, Northstar Protocol (northstar.dao.eth), governed by one Staged Proposal Processor (SPP)
// process "NSP" with two stages of two bodies each:
//
//   stage 0 "Council approval" (approval, 1 of 2 bodies):  Northstar Council Safe (Safe 3-of-5, external body)
//                                                          Core Team multisig plugin (2-of-3, sub-plugin)
//   stage 1 "Community veto"   (optimistic, veto by 1):    NSP token voting plugin (veto mode, sub-plugin)
//                                                          Security Guardian Safe (Safe 2-of-4, external body)
//
// build(helpers) returns everything at offsets from helpers.NOW, so it follows whatever clock data.cjs uses. Shapes
// follow apps/app/src: ISppProposal / ISppSubProposal / ISppPluginSettings (plugins/sppPlugin/types), IDaoPlugin and
// IDao (shared/api/daoService/domain), IMember / IVote (modules/governance/api/governanceService/domain), ISafeInfo /
// ISafeMultisigTransaction (shared/api/safeService/domain).
//
// Safe stage bodies: the stage plugin of a Safe can be described two ways (helpers.safeStageMode):
//   'external'  (default) interfaceType absent + brandId 'safe'. Renders through the generic external-body fallback
//               of the SPP voting terminal (Safe logo, result from `results`, no Votes tab). This is the mode the
//               app at HEAD renders without errors.
//   'canonical' interfaceType 'safe'. Routes the body through the Safe slots (live confirmations from /v2/safe/*),
//               but at HEAD SppVotingTerminalBodySummary / -BodyContent only pass `body` and the parent proposal to a
//               body whose interfaceType is null, so the Safe summary receives `proposal: undefined` and throws. See
//               INTEGRATION.md.

const DAY = 86_400;
const HOUR = 3600;

const build = (helpers) => {
    const { NOW, addr, txh, viem } = helpers;
    if (NOW == null || addr == null || txh == null || viem == null) {
        throw new Error(
            'data-spp build(): NOW, addr, txh and viem are required',
        );
    }
    const NET = helpers.NET ?? 'ethereum-mainnet';
    const ASSET_HOST = helpers.ASSET_HOST ?? 'https://mock-assets.aragon.test';
    const HEAD_BLOCK = helpers.HEAD_BLOCK ?? 21_900_000;
    const safeStageMode = helpers.safeStageMode ?? 'external';

    const units = (n, d = 18) =>
        (
            (BigInt(Math.round(n * 1e6)) * 10n ** BigInt(d)) /
            10n ** 6n
        ).toString();
    const wei = (n) => units(n, 18);
    const checksum = (a) => viem.getAddress(a);
    const at = (days) => Math.round(NOW + days * DAY);
    const iso = (ts) => new Date(ts * 1000).toISOString();
    const blockAt = (ts) => HEAD_BLOCK - Math.round((NOW - ts) / 12);
    const permId = (name) => viem.keccak256(viem.toHex(name));
    const logo = (sym) => `${ASSET_HOST}/token/${sym.toLowerCase()}.svg`;

    // ---------- Tokens ----------
    const baseToken = (address, symbol, name, decimals, priceUsd) => ({
        address,
        network: NET,
        symbol,
        name,
        logo: logo(symbol),
        decimals,
        priceUsd,
        totalSupply: null,
    });
    const T = helpers.TOKENS ?? {};
    const TOKENS = {
        USDC:
            T.USDC ??
            baseToken(
                '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                'USDC',
                'USD Coin',
                6,
                '1.00',
            ),
        ETH:
            T.ETH ??
            baseToken(
                '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                'ETH',
                'Ether',
                18,
                '3148.62',
            ),
        DAI:
            T.DAI ??
            baseToken(
                '0x6b175474e89094c44da98b954eedeac495271d0f',
                'DAI',
                'Dai Stablecoin',
                18,
                '0.9998',
            ),
        NSP: {
            ...baseToken(
                addr('northstar-token'),
                'NSP',
                'Northstar',
                18,
                '0.42',
            ),
            totalSupply: wei(100_000_000),
        },
    };
    const NSP_SUPPLY = 100_000_000;

    // ---------- People ----------
    // Seeds p-* are the ones data.cjs uses, so these addresses (and their ENS names) are shared with Meridian / Atlas;
    // ns-* people are new to Northstar. nadia.eth is the demo wallet of the capture scripts.
    const person = (key, seed, ens, vp) => ({
        key,
        address: addr(seed),
        ens,
        vp,
    });
    const PEOPLE = [
        person('nadia', 'p-nadia', 'nadia.eth', 3_200_000),
        person('kofi', 'p-kofi', 'kofi-mensah.eth', 2_450_000),
        person('lena', 'p-lena', 'lenaweber.eth', 1_980_000),
        person('ines', 'ns-ines', 'ines-alvarez.eth', 1_640_000),
        person('sofia', 'p-sofia', 'sofiaruiz.eth', 1_210_000),
        person('ravi', 'p-ravi', null, 980_000),
        person('dmitri', 'ns-dmitri', 'dmitri.eth', 860_000),
        person('tomas', 'p-tomas', 'tomas.eth', 720_000),
        person('yuki', 'ns-yuki', null, 550_000),
        person('chen', 'p-chen', 'chenwei.eth', 430_000),
        person('oren', 'ns-oren', 'oren.eth', 0),
        person('priya', 'ns-priya', 'priya-n.eth', 0),
    ];
    const P = Object.fromEntries(PEOPLE.map((p) => [p.key, p]));
    const info = (p) => ({ address: p.address, ens: p.ens, avatar: null });
    // Delegations received, shown on the token member list.
    const DELEGATIONS = {
        nadia: 41,
        kofi: 28,
        lena: 17,
        ines: 9,
        sofia: 6,
        dmitri: 3,
    };

    // ---------- Addresses ----------
    const DAO_ADDR = addr('dao-northstar');
    const SPP_ADDR = addr('plugin-northstar-spp');
    const MS_ADDR = addr('plugin-northstar-core-ms');
    const TV_ADDR = addr('plugin-northstar-tv');
    const COUNCIL_SAFE = addr('safe-northstar-council');
    const GUARDIAN_SAFE = addr('safe-northstar-guardian');
    const SAFE_OWNER_CONDITION = addr('northstar-safe-owner-condition');
    const RECIPIENTS = {
        auditors: addr('ns-r-auditors'),
        baseOps: addr('ns-r-base-ops'),
        grants: addr('ns-r-grants'),
        liquidity: addr('ns-r-liquidity'),
        feeController: addr('ns-fee-controller'),
        bugBounty: addr('ns-r-bug-bounty'),
    };

    // ---------- Stage timing ----------
    const S0 = {
        voteDuration: 5 * DAY,
        minAdvance: 1 * DAY,
        maxAdvance: 12 * DAY,
    };
    const S1 = {
        voteDuration: 7 * DAY,
        minAdvance: 7 * DAY,
        maxAdvance: 21 * DAY,
    };

    // ---------- Body plugins ----------
    const msSettings = {
        pluginAddress: MS_ADDR,
        minApprovals: 2,
        onlyListed: true,
        historicalMembersCount: '3',
    };
    const tvSettings = {
        pluginAddress: TV_ADDR,
        votingMode: 0, // standard: no early execution, no vote replacement
        supportThreshold: 500_000, // 50% of the votes cast must be "veto"
        minParticipation: 50_000, // 5% of the supply must take part for a veto to count
        minDuration: S1.voteDuration,
        minProposerVotingPower: '0',
        token: { ...TOKENS.NSP, hasDelegate: true, underlying: null },
        historicalTotalSupply: wei(NSP_SUPPLY),
    };
    const sppSettings = () => ({
        pluginAddress: SPP_ADDR,
        stages: STAGES,
        externalProposers: [],
    });

    const pluginBase = {
        daoAddress: DAO_ADDR,
        release: '1',
        build: '3',
        isSupported: true,
    };
    const msPlugin = {
        ...pluginBase,
        name: 'Core Team',
        description:
            'Three core contributors review every proposal for technical soundness. Two approvals clear the council stage.',
        links: [],
        processKey: undefined,
        address: MS_ADDR,
        subdomain: 'multisig',
        interfaceType: 'multisig',
        isProcess: true,
        isBody: true,
        isSubPlugin: true,
        parentPlugin: SPP_ADDR,
        settings: msSettings,
        blockTimestamp: at(-301),
        transactionHash: txh('ns-ms-install'),
        slug: 'core-team',
    };
    const tvPlugin = {
        ...pluginBase,
        name: 'NSP Token Holders',
        description:
            'Every NSP holder and delegate can veto a council-approved proposal during the 7-day community window.',
        links: [
            {
                name: 'Delegate guide',
                url: 'https://docs.northstar.fi/governance/delegates',
            },
        ],
        processKey: undefined,
        address: TV_ADDR,
        subdomain: 'token-voting',
        interfaceType: 'tokenVoting',
        isProcess: true,
        isBody: true,
        isSubPlugin: true,
        parentPlugin: SPP_ADDR,
        settings: tvSettings,
        blockTimestamp: at(-301),
        transactionHash: txh('ns-tv-install'),
        slug: 'nsp-holders',
    };
    // DAO-level records of the two Safes: the backend reports every Safe associated with a DAO as one canonical
    // `safe` plugin record (see plugins/safeMultisigPlugin/constants). They give the members page a tab per Safe
    // (owners from /v2/members) and the Safe settings aside (from /v2/safe/:network/:address/info).
    const safeRecord = (address, seed, ts) => ({
        ...pluginBase,
        name: undefined,
        description: undefined,
        links: [],
        address,
        subdomain: undefined,
        interfaceType: 'safe',
        release: '0',
        build: '0',
        isProcess: false,
        isBody: true,
        isSubPlugin: true,
        parentPlugin: SPP_ADDR,
        settings: { pluginAddress: address },
        blockTimestamp: ts,
        transactionHash: txh(seed),
        slug: 'safe',
    });
    const councilSafePlugin = safeRecord(
        COUNCIL_SAFE,
        'ns-council-safe',
        at(-340),
    );
    const guardianSafePlugin = safeRecord(
        GUARDIAN_SAFE,
        'ns-guardian-safe',
        at(-330),
    );

    // Stage bodies as SPP reports them in settings.stages[].plugins.
    const safeStageBody = (address, proposalType, withCondition) =>
        safeStageMode === 'canonical'
            ? {
                  ...safeRecord(address, `stage-${address}`, at(-300)),
                  proposalType,
                  ...(withCondition
                      ? {
                            proposalCreationConditionAddress:
                                SAFE_OWNER_CONDITION,
                        }
                      : {}),
              }
            : {
                  proposalType,
                  address,
                  interfaceType: undefined,
                  brandId: 'safe',
                  ...(withCondition
                      ? {
                            proposalCreationConditionAddress:
                                SAFE_OWNER_CONDITION,
                        }
                      : {}),
              };
    const STAGES = [
        {
            stageIndex: 0,
            name: 'Council approval',
            plugins: [
                safeStageBody(COUNCIL_SAFE, 1, true),
                { ...msPlugin, proposalType: 1 },
            ],
            voteDuration: S0.voteDuration,
            minAdvance: S0.minAdvance,
            maxAdvance: S0.maxAdvance,
            approvalThreshold: 1,
            vetoThreshold: 0,
        },
        {
            stageIndex: 1,
            name: 'Community veto',
            plugins: [
                { ...tvPlugin, proposalType: 2 },
                safeStageBody(GUARDIAN_SAFE, 2, false),
            ],
            voteDuration: S1.voteDuration,
            minAdvance: S1.minAdvance,
            maxAdvance: S1.maxAdvance,
            approvalThreshold: 0,
            vetoThreshold: 1,
        },
    ];

    const sppPlugin = {
        ...pluginBase,
        name: 'Northstar Staged Governance',
        description:
            'Proposals are approved by the Council Safe or the Core Team, then pass a 7-day community veto window in which NSP holders or the Security Guardian can block them.',
        links: [
            {
                name: 'Governance framework',
                url: 'https://docs.northstar.fi/governance/framework',
            },
        ],
        processKey: 'NSP',
        address: SPP_ADDR,
        subdomain: 'spp',
        interfaceType: 'spp',
        isProcess: true,
        isBody: false,
        isSubPlugin: false,
        settings: sppSettings(),
        subPlugins: [
            { stageIndex: 0, addresses: [COUNCIL_SAFE, MS_ADDR] },
            { stageIndex: 1, addresses: [TV_ADDR, GUARDIAN_SAFE] },
        ],
        blockTimestamp: at(-302),
        transactionHash: txh('ns-spp-install'),
        slug: 'nsp',
        proposalCreationConditionAddress: undefined,
    };

    const PLUGINS = [
        sppPlugin,
        tvPlugin,
        msPlugin,
        councilSafePlugin,
        guardianSafePlugin,
    ];

    // ---------- Bodies' members ----------
    const SAFES = {
        [COUNCIL_SAFE]: {
            label: 'Northstar Council Safe',
            owners: ['nadia', 'kofi', 'lena', 'ines', 'dmitri'],
            threshold: 3,
        },
        [GUARDIAN_SAFE]: {
            label: 'Security Guardian Safe',
            owners: ['chen', 'oren', 'priya', 'lena'],
            threshold: 2,
        },
    };
    const MS_MEMBERS = ['nadia', 'sofia', 'tomas'];
    const TV_HOLDERS = PEOPLE.filter((p) => p.vp > 0).map((p) => p.key);

    // ---------- DAO ----------
    const DAO = {
        id: `${NET}-${DAO_ADDR}`,
        address: DAO_ADDR,
        network: NET,
        name: 'Northstar Protocol',
        description:
            'Northstar is an intent-based settlement layer for cross-rollup swaps. NSP holders, an elected council and the core team govern upgrades, the fee switch and the ecosystem treasury through a two-stage process with a community veto.',
        version: '1.4.0',
        ens: 'northstar.dao.eth',
        subdomain: 'northstar',
        avatar: `${ASSET_HOST}/avatar/northstar.png`,
        plugins: PLUGINS,
        isSupported: true,
        metrics: { proposalsCreated: 8, members: 2847, tvlUSD: '0' }, // tvlUSD set below from the assets
        links: [
            { name: 'Website', url: 'https://northstar.fi' },
            { name: 'Forum', url: 'https://forum.northstar.fi' },
            { name: 'Docs', url: 'https://docs.northstar.fi' },
            { name: 'X', url: 'https://x.com/northstar_fi' },
        ],
        blockTimestamp: at(-344),
        transactionHash: txh('dao-northstar'),
        creator: info(P.kofi),
    };

    // ---------- Proposals ----------
    // ms: Core Team approvals ('reported' = sub-proposal executed and the result written to SPP)
    // council: Council Safe report: 'approved' (executed, in history) or { queued: [owners who signed] }
    // tv: token veto votes { yes = veto, no, abstain } ('reported' = sub-proposal executed, veto written to SPP)
    // guardian: Guardian Safe report: 'vetoed' or { queued: [...] }
    // transition: day the proposal advanced to stage 1; executedAt: day it executed
    const DEFS = [
        {
            n: 1,
            intent: 'rejected in stage 0: neither council body approved before the stage expired',
            title: 'Migrate NSP staking to liquid restaking',
            creator: 'dmitri',
            summary:
                'Replace the native NSP staking module with a liquid restaking wrapper so stakers can use stNSP as collateral across integrated money markets.',
            start: -34,
            ms: { approvals: ['tomas'] },
            council: null,
            actions: [
                [
                    'call',
                    'setStakingModule',
                    [['_module', 'address', 'ns-restaking-wrapper']],
                ],
            ],
        },
        {
            n: 2,
            intent: 'executed',
            title: 'Fund the Q4 2026 security audit program',
            creator: 'kofi',
            summary:
                'Allocate 240,000 USDC to the audit program covering the v3 settlement contracts, the solver registry and the cross-rollup bridge adapters.',
            start: -30,
            ms: { approvals: ['nadia', 'sofia'], reported: true },
            council: 'approved',
            transition: -25,
            tv: { yes: ['dmitri'], no: ['kofi'], abstain: [] },
            executedAt: -17,
            actions: [['withdraw', 'USDC', 240_000, 'auditors']],
        },
        {
            n: 3,
            intent: 'expired in stage 0: approved by the Core Team but never advanced before maxAdvance',
            title: 'Onboard Wintermute as a designated solver',
            creator: 'sofia',
            summary:
                'Add Wintermute to the designated solver set with a 500,000 NSP bond, enabling it to settle intents on all supported rollups.',
            start: -22,
            ms: { approvals: ['sofia', 'tomas'], reported: true },
            council: null,
            actions: [
                [
                    'call',
                    'addSolver',
                    [
                        ['_solver', 'address', 'ns-solver-wintermute'],
                        ['_bond', 'uint256', wei(500_000)],
                    ],
                ],
            ],
        },
        {
            n: 4,
            intent: 'passed: veto window over without a veto, executable',
            title: 'Deploy Northstar v3 settlement on Base',
            creator: 'nadia',
            summary:
                'Send 40 ETH to the Base Operations Safe to deploy and seed the v3 settlement contracts on Base, following the successful Arbitrum launch.',
            start: -17,
            ms: { approvals: ['nadia', 'tomas'], reported: true },
            council: 'approved',
            transition: -11,
            tv: {
                yes: ['ravi', 'yuki'],
                no: ['lena', 'sofia'],
                abstain: ['chen'],
            },
            actions: [['withdrawNative', 'ETH', 40, 'baseOps']],
        },
        {
            n: 5,
            intent: 'vetoed in stage 1 by the NSP token holders',
            title: 'Raise the protocol fee switch to 25 bps',
            creator: 'lena',
            summary:
                'Increase the protocol fee on settled volume from 10 to 25 basis points and route the additional revenue to the treasury.',
            start: -15,
            ms: { approvals: ['sofia'] },
            council: 'approved',
            transition: -9,
            tv: {
                yes: ['kofi', 'ines', 'ravi', 'dmitri', 'yuki', 'chen'],
                no: ['nadia'],
                abstain: [],
                reported: true,
            },
            actions: [
                ['call', 'setProtocolFee', [['_feeBps', 'uint16', '25']]],
            ],
        },
        {
            n: 6,
            intent: 'stage 1 veto window active',
            title: 'Launch the Northstar Ecosystem Grants round 3',
            creator: 'ines',
            summary:
                'Fund grants round 3 with 300,000 USDC and 1,500,000 NSP for solver tooling, intent explorers and research on MEV-aware settlement.',
            start: -9,
            ms: { approvals: ['sofia', 'tomas'], reported: true },
            council: 'approved',
            transition: -3,
            tv: { yes: ['ines', 'ravi'], no: ['tomas'], abstain: [] },
            guardian: { queued: ['oren'] },
            actions: [
                ['withdraw', 'USDC', 300_000, 'grants'],
                ['withdraw', 'NSP', 1_500_000, 'grants'],
            ],
        },
        {
            n: 7,
            intent: 'stage 0 approved by the Core Team, advanceable',
            title: 'Increase the bug bounty ceiling to 1M USDC',
            creator: 'tomas',
            summary:
                'Raise the maximum Immunefi payout for critical vulnerabilities from 250,000 to 1,000,000 USDC and pre-fund the bounty Safe with 250,000 USDC.',
            start: -4,
            ms: { approvals: ['sofia', 'tomas'], reported: true },
            council: { queued: ['dmitri'] },
            actions: [['withdraw', 'USDC', 250_000, 'bugBounty']],
        },
        {
            n: 8,
            intent: 'stage 0 active: Council Safe at 2 of 3 confirmations, Core Team at 1 of 2',
            title: 'Seed NSP/ETH liquidity on Uniswap v4',
            creator: 'kofi',
            summary:
                'Move 2,000,000 NSP and 220 ETH to the Liquidity Operations Safe to seed an NSP/ETH v4 pool with a dynamic-fee hook.',
            start: -2,
            ms: { approvals: ['sofia'] },
            council: { queued: ['kofi', 'lena'] },
            actions: [
                ['withdraw', 'NSP', 2_000_000, 'liquidity'],
                ['withdrawNative', 'ETH', 220, 'liquidity'],
            ],
        },
    ];

    const html = (...paras) =>
        paras.map((p) => (p.startsWith('<') ? p : `<p>${p}</p>`)).join('');
    const description = (d) =>
        html(
            '<h2>Summary</h2>',
            d.summary,
            '<h2>Motivation</h2>',
            'The proposal was discussed on the Northstar forum for two weeks and presented on the monthly governance call. Feedback from delegates and the Security Guardian has been incorporated into the final scope.',
            '<h2>Specification</h2>',
            '<ul><li>The Council Safe or the Core Team approve the proposal in the council stage.</li><li>NSP holders and the Security Guardian may veto it during the 7-day community window.</li><li>If no veto is reached, anyone can execute the actions below.</li></ul>',
            '<h2>Risks</h2>',
            'Execution risk is limited to the actions listed. The Security Guardian retains its veto for the full community window.',
        );

    // Onchain SPP proposal ids are uint256; the backend sends them as decimal strings (proposalIndex).
    const sppProposalIndex = (n) =>
        BigInt(txh(`nsp-proposal-id-${n}`)).toString();
    const sppProposalId = (n) => `${NET}-${SPP_ADDR}-${sppProposalIndex(n)}`;

    const tvVotes = (tv) => {
        const sum = (keys) => keys.reduce((s, k) => s + P[k].vp, 0);
        return [
            { type: 2, totalVotingPower: wei(sum(tv.yes)) },
            { type: 3, totalVotingPower: wei(sum(tv.no)) },
            { type: 1, totalVotingPower: wei(sum(tv.abstain)) },
        ].filter((v) => v.totalVotingPower !== '0');
    };

    let msSubCounter = 0;
    let tvSubCounter = 0;
    const SUB_PROPOSALS = [];
    const VOTES = {}; // proposal or sub-proposal id -> IVote[] (with `proposal`, stripped unless includeInfo=true)
    const RESULTS = {};

    const buildProposal = (d) => {
        const index = sppProposalIndex(d.n);
        const id = sppProposalId(d.n);
        const startDate = at(d.start);
        const s0End = startDate + S0.voteDuration;
        const transition = d.transition != null ? at(d.transition) : null;
        const stageIndex = transition != null ? 1 : 0;
        const executedTs = d.executedAt != null ? at(d.executedAt) : null;
        const parent = {
            id,
            title: d.title,
            pluginAddress: SPP_ADDR,
            incrementalId: d.n,
        };
        const results = [];
        const subProposals = [];

        const subBase = (
            pluginAddress,
            interfaceType,
            subdomain,
            settings,
            sIdx,
            n,
            start,
            end,
        ) => ({
            id: `${NET}-${pluginAddress}-${n}`,
            proposalIndex: String(n - 1),
            incrementalId: n,
            title: '',
            network: NET,
            blockTimestamp: start,
            summary: '',
            metadataUri: null,
            description: null,
            startDate: start,
            endDate: end,
            creator: { address: SPP_ADDR, ens: null, avatar: null },
            daoAddress: DAO_ADDR,
            transactionHash: txh(`ns-sub-${pluginAddress}-${n}`),
            resources: [],
            settings,
            pluginAddress,
            pluginSubdomain: subdomain,
            pluginInterfaceType: interfaceType,
            hasActions: false,
            hasSimulation: false,
            stageIndex: sIdx,
        });

        // Stage 0: Core Team multisig sub-proposal (created with the proposal).
        msSubCounter += 1;
        const msN = msSubCounter;
        const msApprovals = d.ms.approvals;
        const msReportedAt = startDate + (msApprovals.length + 1) * 6 * HOUR;
        const msSub = {
            ...subBase(
                MS_ADDR,
                'multisig',
                'multisig',
                msSettings,
                0,
                msN,
                startDate,
                s0End,
            ),
            executed: d.ms.reported
                ? {
                      status: true,
                      transactionHash: txh(`ns-ms-exec-${msN}`),
                      blockTimestamp: msReportedAt,
                      blockNumber: blockAt(msReportedAt),
                  }
                : { status: false },
            metrics: { totalVotes: msApprovals.length },
        };
        subProposals.push(msSub);
        if (d.ms.reported) {
            results.push({ pluginAddress: MS_ADDR, stage: 0, resultType: 1 });
        }
        VOTES[msSub.id] = msApprovals.map((k, i) => ({
            transactionHash: txh(`ns-ms-vote-${msN}-${i}`),
            blockTimestamp: startDate + (i + 1) * 6 * HOUR,
            member: info(P[k]),
            network: NET,
            parentProposal: parent,
            proposal: msSub,
        }));

        // Stage 0: Council Safe result.
        if (d.council === 'approved') {
            results.push({
                pluginAddress: COUNCIL_SAFE,
                stage: 0,
                resultType: 1,
            });
        }

        // Stage 1: token voting veto sub-proposal (created when the proposal advanced).
        if (transition != null) {
            tvSubCounter += 1;
            const tvN = tvSubCounter;
            const s1End = transition + S1.voteDuration;
            const tvSub = {
                ...subBase(
                    TV_ADDR,
                    'tokenVoting',
                    'token-voting',
                    tvSettings,
                    1,
                    tvN,
                    transition,
                    s1End,
                ),
                executed: d.tv.reported
                    ? {
                          status: true,
                          transactionHash: txh(`ns-tv-exec-${tvN}`),
                          blockTimestamp: s1End + 2 * HOUR,
                          blockNumber: blockAt(s1End + 2 * HOUR),
                      }
                    : { status: false },
                metrics: { votesByOption: tvVotes(d.tv) },
            };
            subProposals.push(tvSub);
            if (d.tv.reported) {
                results.push({
                    pluginAddress: TV_ADDR,
                    stage: 1,
                    resultType: 2,
                });
            }
            const voters = [
                ...d.tv.yes.map((k) => [k, 2]),
                ...d.tv.no.map((k) => [k, 3]),
                ...d.tv.abstain.map((k) => [k, 1]),
            ];
            VOTES[tvSub.id] = voters.map(([k, option], i) => ({
                transactionHash: txh(`ns-tv-vote-${tvN}-${i}`),
                blockTimestamp: transition + (i + 1) * 5 * HOUR,
                member: info(P[k]),
                network: NET,
                token: TOKENS.NSP,
                votingPower: wei(P[k].vp),
                voteOption: option,
                parentProposal: parent,
                proposal: tvSub,
            }));
            if (d.guardian === 'vetoed') {
                results.push({
                    pluginAddress: GUARDIAN_SAFE,
                    stage: 1,
                    resultType: 2,
                });
            }
        }

        const stageExecutions = [];
        if (transition != null) {
            stageExecutions.push({
                stageIndex: 0,
                status: true,
                transactionHash: txh(`ns-advance-${d.n}`),
                blockTimestamp: transition,
                blockNumber: blockAt(transition),
            });
        }
        if (executedTs != null) {
            stageExecutions.push({
                stageIndex: 1,
                status: true,
                transactionHash: txh(`ns-exec-${d.n}`),
                blockTimestamp: executedTs,
                blockNumber: blockAt(executedTs),
            });
        }

        SUB_PROPOSALS.push(...subProposals);
        RESULTS[id] = results;
        VOTES[id] = [];

        return {
            id,
            proposalIndex: index,
            incrementalId: d.n,
            title: d.title,
            network: NET,
            blockTimestamp: startDate - HOUR,
            summary: d.summary,
            metadataUri: `ipfs://bafkreinorthstarproposal${d.n}`,
            description: description(d),
            startDate,
            endDate:
                transition != null
                    ? transition + S1.voteDuration
                    : s0End + S1.voteDuration,
            creator: info(P[d.creator]),
            daoAddress: DAO_ADDR,
            transactionHash: txh(`ns-proposal-${d.n}`),
            resources: [
                {
                    name: 'Forum discussion',
                    url: `https://forum.northstar.fi/t/nsp-${d.n}`,
                },
                {
                    name: 'Risk assessment',
                    url: `https://docs.northstar.fi/risk/nsp-${d.n}`,
                },
            ],
            settings: sppSettings(),
            executed:
                executedTs != null
                    ? {
                          status: true,
                          transactionHash: txh(`ns-exec-${d.n}`),
                          blockTimestamp: executedTs,
                          blockNumber: blockAt(executedTs),
                      }
                    : { status: false },
            pluginAddress: SPP_ADDR,
            pluginSubdomain: 'spp',
            pluginInterfaceType: 'spp',
            hasActions: d.actions.length > 0,
            hasSimulation: false,
            stageIndex,
            lastStageTransition: transition ?? startDate,
            subProposals,
            stageExecutions,
            results,
        };
    };

    const PROPOSALS = DEFS.map(buildProposal).sort(
        (a, b) => b.incrementalId - a.incrementalId,
    );
    const proposalByN = Object.fromEntries(
        PROPOSALS.map((p) => [p.incrementalId, p]),
    );

    // ---------- Actions ----------
    const callAbi = (fn, params) => [
        {
            type: 'function',
            name: fn,
            stateMutability: 'nonpayable',
            inputs: params.map(([name, type]) => ({ name, type })),
            outputs: [],
        },
    ];
    const tokenInfo = (t) => ({
        name: t.name,
        symbol: t.symbol,
        address: t.address,
        logo: t.logo,
        priceUsd: t.priceUsd,
        decimals: t.decimals,
    });
    const buildAction = ([kind, ...rest]) => {
        if (kind === 'withdraw') {
            const [sym, amount, to] = rest;
            const token = TOKENS[sym];
            const raw = units(amount, token.decimals);
            const target = RECIPIENTS[to];
            return {
                type: 'Transfer',
                from: DAO_ADDR,
                to: token.address,
                data: viem.encodeFunctionData({
                    abi: viem.erc20Abi,
                    functionName: 'transfer',
                    args: [target, BigInt(raw)],
                }),
                value: '0',
                inputData: {
                    function: 'transfer',
                    contract: token.name,
                    parameters: [
                        { name: 'to', type: 'address', value: target },
                        { name: 'value', type: 'uint256', value: raw },
                    ],
                },
                sender: { address: DAO_ADDR },
                receiver: { address: target },
                amount: raw,
                token: tokenInfo(token),
            };
        }
        if (kind === 'withdrawNative') {
            const [sym, amount, to] = rest;
            const raw = units(amount, 18);
            const target = RECIPIENTS[to];
            return {
                type: 'TransferNative',
                from: DAO_ADDR,
                to: target,
                data: '0x',
                value: raw,
                inputData: { function: '', contract: '', parameters: [] },
                sender: { address: DAO_ADDR },
                receiver: { address: target },
                amount: raw,
                token: tokenInfo(TOKENS[sym]),
            };
        }
        // A plain contract call, decoded by the backend.
        const [fn, params] = rest;
        const values = params.map(([, type, v]) =>
            type === 'address' ? addr(v) : v,
        );
        const contract =
            fn === 'setProtocolFee'
                ? 'NorthstarFeeController'
                : fn === 'addSolver'
                  ? 'NorthstarSolverRegistry'
                  : 'NorthstarStaking';
        return {
            type: 'Unknown',
            from: DAO_ADDR,
            to: addr(`ns-contract-${contract}`),
            data: viem.encodeFunctionData({
                abi: callAbi(fn, params),
                functionName: fn,
                args: values.map((v, i) =>
                    params[i][1].startsWith('uint') ? BigInt(v) : v,
                ),
            }),
            value: '0',
            inputData: {
                function: fn,
                contract,
                parameters: params.map(([name, type], i) => ({
                    name,
                    type,
                    value: values[i],
                })),
            },
        };
    };
    const ACTIONS = {};
    DEFS.forEach((d) => {
        ACTIONS[sppProposalId(d.n)] = d.actions.map(buildAction);
    });

    // ---------- Safes: info, queue and history ----------
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
    const ZERO = '0x0000000000000000000000000000000000000000';
    const sig = (seed) =>
        `0x${txh(`sig-${seed}`).slice(2)}${txh(`sig2-${seed}`).slice(2, 66)}1f`;
    const safeTx = ({
        safe,
        nonce,
        data,
        to,
        signers,
        submitted,
        executed,
        report,
    }) => {
        const safeTxHash = txh(`safe-${safe}-${nonce}-${data.slice(0, 80)}`);
        return {
            nonce: String(nonce),
            safeTxHash,
            from: checksum(P[signers[0]].address),
            to: checksum(to),
            value: '0',
            data,
            operation: 0,
            safeTxGas: '0',
            baseGas: '0',
            gasPrice: '0',
            gasToken: ZERO,
            refundReceiver: ZERO,
            confirmations: signers.map((k, i) => ({
                owner: checksum(P[k].address),
                signature: sig(`${safeTxHash}-${k}`),
                signatureType: 'EOA',
                submissionDate: iso(submitted + i * 3 * HOUR),
            })),
            confirmationsRequired: SAFES[safe].threshold,
            signatures: executed != null ? sig(`${safeTxHash}-packed`) : null,
            isExecuted: executed != null,
            isSuccessful: executed != null ? true : null,
            submissionDate: iso(submitted),
            ...(executed != null
                ? {
                      executionDate: iso(executed),
                      transactionHash: txh(`safe-exec-${safeTxHash}`),
                  }
                : {}),
            ...(report != null ? { aragonReports: [report] } : {}),
        };
    };
    const reportCall = (n, stageId, resultType) =>
        viem.encodeFunctionData({
            abi: reportAbi,
            functionName: 'reportProposalResult',
            args: [BigInt(sppProposalIndex(n)), stageId, resultType, false],
        });
    const aragonReport = (n, stageId, resultType) => ({
        daoId: DAO.id,
        bodyId: SPP_ADDR,
        proposalId: n,
        stageId,
        resultType,
    });
    // Unrelated Safe housekeeping so history is not only reports.
    const ownerChange = (_safe, n) =>
        viem.encodeFunctionData({
            abi: [
                {
                    type: 'function',
                    name: 'changeThreshold',
                    inputs: [{ name: '_threshold', type: 'uint256' }],
                    outputs: [],
                    stateMutability: 'nonpayable',
                },
            ],
            functionName: 'changeThreshold',
            args: [BigInt(n)],
        });

    const safeState = {};
    for (const safe of [COUNCIL_SAFE, GUARDIAN_SAFE]) {
        const s = SAFES[safe];
        const executedTxs = [];
        // Setup transaction: the threshold set after the owners were added.
        executedTxs.push({
            data: ownerChange(safe, s.threshold),
            to: safe,
            signers: s.owners.slice(0, s.threshold),
            submitted: at(-320),
            executed: at(-319),
        });
        const queued = [];
        const isCouncil = safe === COUNCIL_SAFE;
        for (const d of [...DEFS].sort((a, b) => a.start - b.start)) {
            const entry = isCouncil ? d.council : d.guardian;
            if (entry == null) {
                continue;
            }
            const stageId = isCouncil ? 0 : 1;
            const resultType = isCouncil ? 1 : 2;
            const stageStart = isCouncil ? at(d.start) : at(d.transition);
            if (entry === 'approved' || entry === 'vetoed') {
                executedTxs.push({
                    data: reportCall(d.n, stageId, resultType),
                    to: SPP_ADDR,
                    signers: s.owners.slice(0, s.threshold),
                    submitted: stageStart + 4 * HOUR,
                    executed: stageStart + 20 * HOUR,
                    report: aragonReport(d.n, stageId, resultType),
                });
            } else if (entry.queued) {
                queued.push({
                    data: reportCall(d.n, stageId, resultType),
                    to: SPP_ADDR,
                    signers: entry.queued,
                    submitted: stageStart + 5 * HOUR,
                    executed: null,
                    report: aragonReport(d.n, stageId, resultType),
                });
            }
        }
        executedTxs.sort((a, b) => a.executed - b.executed);
        const history = executedTxs
            .map((t, nonce) => safeTx({ safe, nonce, ...t }))
            .sort((a, b) => Number(b.nonce) - Number(a.nonce));
        const nonce = executedTxs.length;
        const queue = queued.map((t, i) =>
            safeTx({ safe, nonce: nonce + i, ...t }),
        );
        safeState[safe] = {
            info: {
                address: checksum(safe),
                nonce: String(nonce),
                threshold: s.threshold,
                owners: s.owners.map((k) => checksum(P[k].address)),
                version: '1.4.1',
                modules: [],
                guard: null,
            },
            queue,
            history,
            // What the Safe transaction service answers on /v1/safes/:address/balances/ (the Safe account page).
            balances: (isCouncil
                ? [
                      [null, 42.5],
                      [TOKENS.USDC, 185_000],
                      [TOKENS.NSP, 750_000],
                  ]
                : [[null, 1.2]]
            ).map(([token, amount]) => ({
                tokenAddress: token == null ? null : checksum(token.address),
                token:
                    token == null
                        ? null
                        : {
                              name: token.name,
                              symbol: token.symbol,
                              decimals: token.decimals,
                              logoUri: token.logo,
                          },
                balance: units(amount, token == null ? 18 : token.decimals),
            })),
        };
    }

    // ---------- Members per body ----------
    const memberBase = (p, type, i, firstDays) => ({
        address: p.address,
        ens: p.ens,
        type,
        firstActive: blockAt(at(-(firstDays - i * 9))),
        lastActive: blockAt(at(-(i + 1))),
        metrics: {
            firstActivity: at(-(firstDays - i * 9)),
            lastActivity: at(-(i + 1)),
        },
    });
    const MEMBERS = {
        [TV_ADDR]: TV_HOLDERS.map((k, i) => {
            const p = P[k];
            const delegated = Math.round(
                p.vp * (DELEGATIONS[k] != null ? 0.35 : 0),
            );
            const m = memberBase(p, 'token-voting', i, 290);
            return {
                ...m,
                votingPower: wei(p.vp),
                tokenBalance: wei(p.vp - delegated),
                metrics: { ...m.metrics, delegationCount: DELEGATIONS[k] ?? 0 },
            };
        }),
        [MS_ADDR]: MS_MEMBERS.map((k, i) =>
            memberBase(P[k], 'multisig', i, 295),
        ),
        [COUNCIL_SAFE]: SAFES[COUNCIL_SAFE].owners.map((k, i) =>
            memberBase(P[k], 'safe', i, 330),
        ),
        [GUARDIAN_SAFE]: SAFES[GUARDIAN_SAFE].owners.map((k, i) =>
            memberBase(P[k], 'safe', i, 320),
        ),
    };
    // Every person once, for surfaces that want "the DAO's members" (workspace queries).
    const ALL_MEMBERS = [
        ...new Map(
            Object.values(MEMBERS)
                .flat()
                .map((m) => [m.address, m]),
        ).values(),
    ];

    // ---------- Assets ----------
    const asset = (sym, amount) => ({
        amount: String(amount),
        amountUsd: (amount * Number(TOKENS[sym].priceUsd)).toFixed(2),
        token: TOKENS[sym],
    });
    const ASSETS = [
        asset('USDC', 2_415_380.42),
        asset('NSP', 8_500_000),
        asset('ETH', 612.48),
        asset('DAI', 384_210.07),
    ].sort((a, b) => Number(b.amountUsd) - Number(a.amountUsd));
    DAO.metrics.tvlUSD = ASSETS.reduce(
        (s, a) => s + Number(a.amountUsd),
        0,
    ).toFixed(2);

    // ---------- Transactions ----------
    const txDefs = [
        ['execution', 2, 17],
        ['withdraw', 'USDC', 240_000, 17, RECIPIENTS.auditors],
        ['deposit', 'USDC', 400_000, 23, addr('ns-fee-collector')],
        ['deposit', 'ETH', 85, 41, addr('ns-fee-collector')],
        ['deposit', 'NSP', 8_500_000, 96, addr('ns-token-vesting')],
        ['deposit', 'DAI', 384_210.07, 140, addr('ns-cow-settlement')],
        ['deposit', 'USDC', 2_255_380.42, 210, addr('ns-treasury-migration')],
        ['deposit', 'ETH', 527.48, 260, addr('ns-treasury-migration')],
    ];
    const TXS = txDefs.map((def, i) => {
        const daysAgo = def[0] === 'execution' ? def[2] : def[3];
        const hash = txh(`${DAO_ADDR}-tx-${i}`);
        const base = {
            network: NET,
            blockNumber: blockAt(at(-daysAgo)),
            blockTimestamp: at(-daysAgo),
            value: '0',
            transactionHash: hash,
            id: `${NET}-${hash}-${i}`,
        };
        if (def[0] === 'execution') {
            const p = proposalByN[def[1]];
            return {
                ...base,
                transactionHash: p.executed.transactionHash,
                id: `${NET}-${p.executed.transactionHash}-${i}`,
                fromAddress: SPP_ADDR,
                toAddress: DAO_ADDR,
                side: 'execution',
                type: 'execution',
                daoAddress: DAO_ADDR,
                source: 'proposal',
                proposalIndex: p.proposalIndex,
                actionCount: ACTIONS[p.id].length,
            };
        }
        const [side, sym, amount, , counterparty] = def;
        const t = TOKENS[sym];
        return {
            ...base,
            fromAddress: side === 'deposit' ? counterparty : DAO_ADDR,
            toAddress: side === 'deposit' ? DAO_ADDR : counterparty,
            value: String(amount),
            side,
            token: t,
            amountUsd: (amount * Number(t.priceUsd)).toFixed(2),
        };
    });

    // ---------- Permissions ----------
    const ent = (address, layer, extra = {}) => ({ address, layer, ...extra });
    const daoEnt = ent(DAO_ADDR, 'dao', { label: 'DAO', status: 'installed' });
    const sppEnt = ent(SPP_ADDR, 'topLevelPlugin', {
        label: sppPlugin.name,
        interfaceType: 'spp',
        status: 'installed',
    });
    const subEnt = (plugin, stageIndex) =>
        ent(plugin.address, 'processInternal', {
            label: plugin.name,
            interfaceType: plugin.interfaceType,
            status: 'installed',
            parentPluginAddress: SPP_ADDR,
            parentPluginName: sppPlugin.name,
            parentInterfaceType: 'spp',
            stageIndex,
        });
    const safeEnt = (address, stageIndex, withCondition) =>
        ent(address, 'externalActor', {
            label: SAFES[address].label,
            brandId: 'safe',
            parentPluginAddress: SPP_ADDR,
            parentPluginName: sppPlugin.name,
            parentInterfaceType: 'spp',
            stageIndex,
            ...(withCondition
                ? { proposalCreationConditionAddress: SAFE_OWNER_CONDITION }
                : {}),
        });
    const msEnt = subEnt(msPlugin, 0);
    const tvEnt = subEnt(tvPlugin, 1);
    const councilEnt = safeEnt(COUNCIL_SAFE, 0, true);
    const guardianEnt = safeEnt(GUARDIAN_SAFE, 1, false);
    const perm = (name, who, where, extra = {}) => ({
        permissionId: permId(name),
        whoAddress: who.address,
        whereAddress: where.address,
        who,
        where,
        network: NET,
        ...extra,
    });
    const PERMISSIONS = [
        perm('EXECUTE_PERMISSION', sppEnt, daoEnt),
        perm('ROOT_PERMISSION', daoEnt, daoEnt),
        perm('UPGRADE_DAO_PERMISSION', daoEnt, daoEnt),
        perm('SET_METADATA_PERMISSION', daoEnt, daoEnt),
        perm('REGISTER_STANDARD_CALLBACK_PERMISSION', daoEnt, daoEnt),
        perm('SET_TRUSTED_FORWARDER_PERMISSION', daoEnt, daoEnt),
        perm('UPDATE_STAGES_PERMISSION', daoEnt, sppEnt),
        perm('UPDATE_RULES_PERMISSION', daoEnt, sppEnt),
        perm('SET_METADATA_PERMISSION', daoEnt, sppEnt),
        perm('SET_TARGET_CONFIG_PERMISSION', daoEnt, sppEnt),
        perm('UPGRADE_PLUGIN_PERMISSION', daoEnt, sppEnt),
        perm('CREATE_PROPOSAL_PERMISSION', msEnt, sppEnt),
        perm('CREATE_PROPOSAL_PERMISSION', councilEnt, sppEnt, {
            conditionAddress: SAFE_OWNER_CONDITION,
            condition: { conditionType: 'safeOwner' },
            conditionEntity: ent(SAFE_OWNER_CONDITION, 'condition', {
                label: 'Safe owner condition',
            }),
        }),
        perm(
            'ADVANCE_PERMISSION',
            ent(addr('any-address'), 'unknown', { label: 'Anyone' }),
            sppEnt,
        ),
        perm(
            'EXECUTE_PROPOSAL_PERMISSION',
            ent(addr('any-address'), 'unknown', { label: 'Anyone' }),
            sppEnt,
        ),
        perm('UPDATE_MULTISIG_SETTINGS_PERMISSION', daoEnt, msEnt),
        perm('UPDATE_VOTING_SETTINGS_PERMISSION', daoEnt, tvEnt),
        perm('UPGRADE_PLUGIN_PERMISSION', daoEnt, msEnt),
        perm('UPGRADE_PLUGIN_PERMISSION', daoEnt, tvEnt),
        perm(
            'MINT_PERMISSION',
            daoEnt,
            ent(TOKENS.NSP.address, 'contract', { label: 'Northstar (NSP)' }),
        ),
        perm('SET_METADATA_PERMISSION', daoEnt, guardianEnt),
    ];

    // ---------- Index ----------
    const ENS = Object.fromEntries(
        PEOPLE.filter((p) => p.ens).map((p) => [
            p.address.toLowerCase(),
            p.ens,
        ]),
    );
    ENS[DAO_ADDR.toLowerCase()] = DAO.ens;
    // Reverse names of the Safes, so their stage body cards read as a name rather than a bare address.
    ENS[COUNCIL_SAFE.toLowerCase()] = 'council.northstar.eth';
    ENS[GUARDIAN_SAFE.toLowerCase()] = 'guardian.northstar.eth';

    // Same shape as the entries of D.DAOS in data.cjs (dao, plugin, proposals, members, assets, txs, permissions) so
    // the entry can also be merged into D.DAOS for workspace routes; `plugin` is the process (SPP) plugin.
    const daoEntry = {
        dao: DAO,
        plugin: sppPlugin,
        proposals: PROPOSALS,
        members: ALL_MEMBERS,
        assets: ASSETS,
        txs: TXS,
        permissions: PERMISSIONS,
    };

    return {
        NOW,
        NET,
        DAO,
        DAO_ADDR,
        SPP_ADDR,
        MS_ADDR,
        TV_ADDR,
        COUNCIL_SAFE,
        GUARDIAN_SAFE,
        SAFE_OWNER_CONDITION,
        TOKENS,
        NSP_TOKEN: TOKENS.NSP,
        NSP_SUPPLY,
        PEOPLE,
        PLUGINS,
        STAGES,
        PROPOSALS,
        SUB_PROPOSALS,
        DEFS,
        VOTES,
        ACTIONS,
        MEMBERS,
        SAFES,
        SAFE_STATE: safeState,
        ASSETS,
        TXS,
        PERMISSIONS,
        ENS,
        daoEntry,
        DAOS: { [DAO_ADDR]: daoEntry },
        route: '/dao/ethereum-mainnet/northstar.dao.eth',
        safeStageMode,
    };
};

module.exports = { build };
