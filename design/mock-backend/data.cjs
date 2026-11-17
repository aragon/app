'use strict';
// Mock data for the Aragon App backend. Timestamps are relative to server start (seconds).
const crypto = require('node:crypto');
const viem = require(
    require.resolve('viem', {
        paths: [
            require('node:path').join(__dirname, '..', '..', 'apps', 'app'),
        ],
    }),
);

const NOW = Math.floor(Date.now() / 1000);
const DAY = 86_400;
const HOUR = 3600;
const NET = 'ethereum-mainnet';
const ASSET_HOST = 'https://mock-assets.aragon.test';

const addr = (seed) =>
    `0x${crypto.createHash('sha256').update(seed).digest('hex').slice(0, 40)}`;
const txh = (seed) =>
    `0x${crypto.createHash('sha256').update(`tx-${seed}`).digest('hex')}`;
const wei = (n) => (BigInt(Math.round(n * 1e6)) * 10n ** 12n).toString(); // 18 decimals
const units = (n, d) =>
    ((BigInt(Math.round(n * 1e6)) * 10n ** BigInt(d)) / 10n ** 6n).toString();
const permId = (name) => viem.keccak256(viem.toHex(name));
const logo = (sym) => `${ASSET_HOST}/token/${sym.toLowerCase()}.svg`;

// ---------- Tokens ----------
const TOKENS = {
    USDC: {
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        network: NET,
        symbol: 'USDC',
        name: 'USD Coin',
        logo: logo('USDC'),
        decimals: 6,
        priceUsd: '1.00',
        totalSupply: null,
    },
    ETH: {
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        network: NET,
        symbol: 'ETH',
        name: 'Ether',
        logo: logo('ETH'),
        decimals: 18,
        priceUsd: '3148.62',
        totalSupply: null,
    },
    WETH: {
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        network: NET,
        symbol: 'WETH',
        name: 'Wrapped Ether',
        logo: logo('WETH'),
        decimals: 18,
        priceUsd: '3148.62',
        totalSupply: null,
    },
    DAI: {
        address: '0x6b175474e89094c44da98b954eedeac495271d0f',
        network: NET,
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        logo: logo('DAI'),
        decimals: 18,
        priceUsd: '0.9998',
        totalSupply: null,
    },
    MRD: {
        address: addr('meridian-token'),
        network: NET,
        symbol: 'MRD',
        name: 'Meridian',
        logo: logo('MRD'),
        decimals: 18,
        priceUsd: '0.84',
        totalSupply: wei(50_000_000),
    },
};

// ---------- People ----------
const PEOPLE = [
    {
        address: addr('p-nadia'),
        ens: 'nadia.eth',
        vp: 4_850_000,
        bal: 1_200_000,
        deleg: 214,
    },
    {
        address: addr('p-kofi'),
        ens: 'kofi-mensah.eth',
        vp: 3_920_000,
        bal: 2_100_000,
        deleg: 167,
    },
    {
        address: addr('p-lena'),
        ens: 'lenaweber.eth',
        vp: 2_740_000,
        bal: 940_000,
        deleg: 98,
    },
    {
        address: addr('p-ravi'),
        ens: null,
        vp: 2_115_000,
        bal: 2_115_000,
        deleg: 0,
    },
    {
        address: addr('p-sofia'),
        ens: 'sofiaruiz.eth',
        vp: 1_680_000,
        bal: 610_000,
        deleg: 54,
    },
    {
        address: addr('p-tomas'),
        ens: 'tomas.eth',
        vp: 1_245_500,
        bal: 845_500,
        deleg: 21,
    },
    { address: addr('p-aiko'), ens: null, vp: 980_200, bal: 980_200, deleg: 0 },
    {
        address: addr('p-marcus'),
        ens: 'marcusj.eth',
        vp: 760_000,
        bal: 410_000,
        deleg: 12,
    },
    {
        address: addr('p-chen'),
        ens: 'chenwei.eth',
        vp: 512_340,
        bal: 512_340,
        deleg: 3,
    },
    {
        address: addr('p-amara'),
        ens: null,
        vp: 388_000,
        bal: 388_000,
        deleg: 0,
    },
    {
        address: addr('p-jonas'),
        ens: 'jonas-b.eth',
        vp: 241_750,
        bal: 241_750,
        deleg: 1,
    },
    { address: addr('p-elif'), ens: null, vp: 125_000, bal: 125_000, deleg: 0 },
];
const MULTISIG_SIGNERS = [
    PEOPLE[0],
    PEOPLE[2],
    PEOPLE[4],
    PEOPLE[5],
    PEOPLE[8],
];
const addrInfo = (p) => ({ address: p.address, ens: p.ens, avatar: null });

// ---------- DAOs ----------
const TV_DAO_ADDR = addr('dao-meridian');
const MS_DAO_ADDR = addr('dao-atlas');
const TV_PLUGIN = addr('plugin-meridian-tv');
const MS_PLUGIN = addr('plugin-atlas-ms');

const tokenSettings = {
    pluginAddress: TV_PLUGIN,
    votingMode: 1,
    supportThreshold: 500_000,
    minParticipation: 150_000,
    minDuration: 5 * DAY,
    minProposerVotingPower: wei(100_000),
    token: { ...TOKENS.MRD, hasDelegate: true, underlying: null },
    historicalTotalSupply: wei(50_000_000),
};
const multisigSettings = {
    pluginAddress: MS_PLUGIN,
    minApprovals: 3,
    onlyListed: true,
    historicalMembersCount: '5',
};

const tvPlugin = {
    name: 'Meridian Token Voting',
    description:
        'Token-weighted governance for all MRD holders and their delegates. Proposals pass with a simple majority and 15% quorum.',
    links: [
        {
            name: 'Governance docs',
            url: 'https://docs.meridian.xyz/governance',
        },
    ],
    processKey: 'MGP',
    address: TV_PLUGIN,
    daoAddress: TV_DAO_ADDR,
    subdomain: 'token-voting',
    interfaceType: 'tokenVoting',
    release: '1',
    build: '3',
    isProcess: true,
    isBody: true,
    isSubPlugin: false,
    settings: tokenSettings,
    blockTimestamp: NOW - 410 * DAY,
    transactionHash: txh('tv-install'),
    slug: 'mgp',
    isSupported: true,
};
const msPlugin = {
    name: 'Grants Council Multisig',
    description:
        'Five elected council members approve grant disbursements. Three approvals are required to execute.',
    links: [],
    processKey: 'AGC',
    address: MS_PLUGIN,
    daoAddress: MS_DAO_ADDR,
    subdomain: 'multisig',
    interfaceType: 'multisig',
    release: '1',
    build: '3',
    isProcess: true,
    isBody: true,
    isSubPlugin: false,
    settings: multisigSettings,
    blockTimestamp: NOW - 230 * DAY,
    transactionHash: txh('ms-install'),
    slug: 'agc',
    isSupported: true,
};

const TV_DAO = {
    id: `${NET}-${TV_DAO_ADDR}`,
    address: TV_DAO_ADDR,
    network: NET,
    name: 'Meridian DAO',
    description:
        'Meridian is a community-owned protocol for cross-chain liquidity routing. MRD holders steer the treasury, fund public goods across the ecosystem and set the protocol roadmap through open, on-chain governance.',
    version: '1.4.0',
    ens: 'meridian.dao.eth',
    subdomain: 'meridian',
    avatar: `${ASSET_HOST}/avatar/meridian.png`,
    plugins: [tvPlugin],
    isSupported: true,
    metrics: { proposalsCreated: 8, members: 1284, tvlUSD: '4796412.37' },
    links: [
        { name: 'Website', url: 'https://meridian.xyz' },
        { name: 'Forum', url: 'https://forum.meridian.xyz' },
        { name: 'X', url: 'https://x.com/meridianproto' },
        { name: 'Discord', url: 'https://discord.gg/meridian' },
    ],
    blockTimestamp: NOW - 412 * DAY,
    transactionHash: txh('dao-meridian'),
    creator: addrInfo(PEOPLE[0]),
};
const MS_DAO = {
    id: `${NET}-${MS_DAO_ADDR}`,
    address: MS_DAO_ADDR,
    network: NET,
    name: 'Atlas Grants Council',
    description:
        'The Atlas Grants Council reviews and funds open-source tooling, research and community initiatives. Grants are approved by a 3-of-5 elected council.',
    version: '1.4.0',
    ens: 'atlas-grants.dao.eth',
    subdomain: 'atlas-grants',
    avatar: `${ASSET_HOST}/avatar/atlas.png`,
    plugins: [msPlugin],
    isSupported: true,
    metrics: { proposalsCreated: 6, members: 5, tvlUSD: '612480.15' },
    links: [
        { name: 'Website', url: 'https://atlasgrants.org' },
        { name: 'Apply for a grant', url: 'https://atlasgrants.org/apply' },
    ],
    blockTimestamp: NOW - 231 * DAY,
    transactionHash: txh('dao-atlas'),
    creator: addrInfo(PEOPLE[2]),
};

const exploreExtra = [
    [
        'Lido DAO',
        'Liquid staking governance for the Lido protocol on Ethereum.',
        'lido',
        2_480_000_000,
        4210,
        312,
    ],
    [
        'Polygon Village',
        'Community grants and builder support for the Polygon ecosystem.',
        'polygon-village',
        18_420_000,
        860,
        94,
    ],
    [
        'Solace Collective',
        'An artist-run collective funding generative art residencies.',
        'solace',
        412_800,
        214,
        41,
    ],
    [
        'Harbor Protocol',
        'Decentralized insurance pools governed by underwriters.',
        'harbor',
        9_870_000,
        1930,
        128,
    ],
    [
        'Greenfield Climate DAO',
        'Pooling capital for verified on-chain carbon removal projects.',
        'greenfield',
        2_150_000,
        3120,
        77,
    ],
    [
        'Nexus Research Guild',
        'Funding open cryptography and zero-knowledge research.',
        'nexus',
        1_320_500,
        58,
        36,
    ],
    [
        'Orbit Gaming DAO',
        'Player-owned treasury for the Orbit game universe.',
        'orbit',
        640_000,
        9800,
        152,
    ],
];
const EXPLORE_DAOS = [
    TV_DAO,
    MS_DAO,
    ...exploreExtra.map(
        ([name, description, slug, tvl, members, props], i) => ({
            id: `${NET}-${addr(`dao-x-${slug}`)}`,
            address: addr(`dao-x-${slug}`),
            network:
                i % 3 === 1
                    ? 'polygon-mainnet'
                    : i % 3 === 2
                      ? 'base-mainnet'
                      : NET,
            name,
            description,
            version: '1.4.0',
            ens: `${slug}.dao.eth`,
            subdomain: slug,
            avatar: `${ASSET_HOST}/avatar/${slug}.png`,
            plugins: [
                {
                    ...tvPlugin,
                    address: addr(`pl-${slug}`),
                    daoAddress: addr(`dao-x-${slug}`),
                },
            ],
            isSupported: true,
            metrics: { proposalsCreated: props, members, tvlUSD: String(tvl) },
            links: [],
            blockTimestamp: NOW - (300 + i * 40) * DAY,
            transactionHash: txh(`dao-x-${slug}`),
        }),
    ),
];

// ---------- Proposals ----------
const html = (...paras) =>
    paras.map((p) => (p.startsWith('<') ? p : `<p>${p}</p>`)).join('');

const tvProposalDefs = [
    {
        id: 1,
        title: 'Sponsor the ETHDenver 2027 Community Hub',
        creator: 2,
        summary:
            'Proposal to sponsor a Meridian community hub at ETHDenver 2027 for 85,000 USDC to grow developer adoption.',
        start: -58,
        end: -53,
        yes: 2_010_000,
        no: 310_000,
        abstain: 95_000,
        executed: false,
        actions: [['withdraw', 'USDC', 85_000, 'events']],
    },
    {
        id: 2,
        title: 'Q4 2026 Contributor Compensation',
        creator: 0,
        summary:
            'Approve the Q4 2026 compensation budget of 180,000 USDC for the core contributor team, paid to the Contributors Safe.',
        start: -44,
        end: -39,
        yes: 11_420_000,
        no: 640_000,
        abstain: 210_000,
        executed: true,
        actions: [['withdraw', 'USDC', 180_000, 'contributors']],
    },
    {
        id: 3,
        title: 'Update DAO metadata and website links',
        creator: 1,
        summary:
            'Refresh the DAO description to reflect the cross-chain routing roadmap and add the new Discord and forum links.',
        start: -31,
        end: -26,
        yes: 9_870_000,
        no: 120_000,
        abstain: 400_000,
        executed: true,
        actions: [['metadata']],
    },
    {
        id: 4,
        title: 'Reduce proposal threshold to 25,000 MRD',
        creator: 3,
        summary:
            'Lower the minimum voting power required to submit a proposal from 100,000 MRD to 25,000 MRD to broaden participation.',
        start: -18,
        end: -13,
        yes: 3_140_000,
        no: 5_420_000,
        abstain: 760_000,
        executed: false,
        actions: [],
    },
    {
        id: 5,
        title: 'Signal: Expand the delegate compensation framework',
        creator: 4,
        summary:
            'Non-binding signal to expand delegate compensation to the top 30 delegates by voting power, funded from the community budget.',
        start: -11,
        end: -6,
        yes: 8_240_000,
        no: 2_130_000,
        abstain: 540_000,
        executed: false,
        actions: [],
    },
    {
        id: 6,
        title: 'Allocate 120 ETH to Uniswap v4 liquidity provisioning',
        creator: 1,
        summary:
            'Move 120 ETH from the treasury to the Liquidity Operations Safe to seed the MRD/ETH v4 pool with a dynamic-fee hook.',
        start: -6,
        end: -1,
        yes: 9_810_000,
        no: 910_000,
        abstain: 330_000,
        executed: false,
        actions: [['withdrawNative', 'ETH', 120, 'liquidity']],
    },
    {
        id: 7,
        title: 'Adopt the Meridian Constitution v2',
        creator: 0,
        summary:
            'Ratify the revised constitution that formalises working groups, conflict-of-interest disclosures and emergency procedures.',
        start: 1,
        end: 6,
        yes: 0,
        no: 0,
        abstain: 0,
        executed: false,
        actions: [['metadata']],
    },
    {
        id: 8,
        title: 'Fund the Q1 2027 Ecosystem Grants Program',
        creator: 2,
        summary:
            'Allocate 250,000 USDC and 400,000 MRD to the Ecosystem Grants Program to fund integrations, tooling and research during Q1 2027.',
        start: -2,
        end: 3,
        yes: 6_215_000,
        no: 1_104_000,
        abstain: 402_000,
        executed: false,
        actions: [
            ['withdraw', 'USDC', 250_000, 'grants'],
            ['withdraw', 'MRD', 400_000, 'grants'],
        ],
    },
];

const RECIPIENTS = {
    events: addr('r-events'),
    contributors: addr('r-contributors'),
    liquidity: addr('r-liquidity'),
    grants: MS_DAO_ADDR,
};

const longDescription = (d, atlas = false) =>
    html(
        '<h2>Summary</h2>',
        d.summary,
        '<h2>Motivation</h2>',
        atlas
            ? 'The applicant team has shipped two previous milestones on time and the work is fully open source. The council reviewed the application in the monthly grants call and the scope was reduced after feedback from two council members.'
            : 'Over the last two quarters Meridian has grown routed volume by 38% while the number of active contributors has stayed flat. This proposal is part of the community roadmap ratified in MGP-3 and has been discussed on the forum for two weeks, with feedback from delegates incorporated into the final version.',
        '<h2>Specification</h2>',
        '<ul><li>Funds are transferred directly from the DAO treasury upon execution.</li><li>Recipients report progress publicly on the forum every month.</li><li>Any unspent funds are returned to the treasury at the end of the period.</li></ul>',
        '<h2>Risks</h2>',
        atlas
            ? 'Funds are released in a single transfer upon execution. The council can claw back unspent funds if milestones are missed for more than 60 days.'
            : 'Execution risk is limited to the amounts listed in the actions. The Security Council retains its existing veto rights and no protocol parameters are changed by this proposal.',
    );

const buildTvProposal = (d) => {
    const votes = [
        { type: 2, totalVotingPower: wei(d.yes) },
        { type: 3, totalVotingPower: wei(d.no) },
        { type: 1, totalVotingPower: wei(d.abstain) },
    ].filter((v) => v.totalVotingPower !== '0');
    const created = NOW + d.start * DAY - 2 * HOUR;
    return {
        id: `${NET}-${TV_PLUGIN}-${d.id}`,
        proposalIndex: String(d.id - 1),
        incrementalId: d.id,
        title: d.title,
        network: NET,
        blockTimestamp: created,
        summary: d.summary,
        metadataUri: `ipfs://bafkreimeridianproposal${d.id}`,
        description: longDescription(d),
        startDate: NOW + d.start * DAY,
        endDate: NOW + d.end * DAY,
        creator: addrInfo(PEOPLE[d.creator]),
        daoAddress: TV_DAO_ADDR,
        transactionHash: txh(`tvp-${d.id}`),
        resources: [
            {
                name: 'Forum discussion',
                url: `https://forum.meridian.xyz/t/mgp-${d.id}`,
            },
            {
                name: 'Temperature check',
                url: `https://snapshot.org/#/meridian.eth/proposal/${d.id}`,
            },
        ],
        settings: tokenSettings,
        executed: d.executed
            ? {
                  status: true,
                  transactionHash: txh(`tvp-exec-${d.id}`),
                  blockTimestamp: NOW + d.end * DAY + 3 * HOUR,
                  blockNumber: 21_400_000 + d.id * 1000,
              }
            : { status: false },
        pluginAddress: TV_PLUGIN,
        pluginSubdomain: 'token-voting',
        pluginInterfaceType: 'tokenVoting',
        hasActions: d.actions.length > 0,
        hasSimulation: false,
        metrics: { votesByOption: votes },
    };
};

const msProposalDefs = [
    {
        id: 1,
        title: 'Grant: Open-source zk proving benchmarks',
        creator: 0,
        summary:
            'Fund the Nexus Research Guild with 40,000 USDC to publish reproducible benchmarks for zk proving systems.',
        start: -40,
        end: -33,
        approvals: 4,
        executed: true,
        actions: [['withdraw', 'USDC', 40_000, 'events']],
    },
    {
        id: 2,
        title: 'Grant: Governance analytics dashboard',
        creator: 2,
        summary:
            'Fund a public dashboard that tracks delegate participation across ecosystem DAOs (25,000 USDC).',
        start: -30,
        end: -23,
        approvals: 3,
        executed: false,
        actions: [['withdraw', 'USDC', 25_000, 'contributors']],
    },
    {
        id: 3,
        title: 'Grant: Hackathon prize pool for Q4',
        creator: 4,
        summary:
            'Provide a 15,000 DAI prize pool for the Atlas Q4 hackathon tracks.',
        start: -20,
        end: -13,
        approvals: 1,
        executed: false,
        actions: [['withdraw', 'DAI', 15_000, 'events']],
    },
    {
        id: 4,
        title: 'Add a sixth council seat for research',
        creator: 0,
        summary:
            'Expand the council with a research seat to improve technical review of grant applications.',
        start: -3,
        end: 4,
        approvals: 3,
        executed: false,
        actions: [['addMembers']],
    },
    {
        id: 5,
        title: 'Grant: Wallet accessibility audit',
        creator: 3,
        summary:
            'Commission an accessibility audit of the five most-used governance wallets (18,500 USDC).',
        start: -1,
        end: 6,
        approvals: 1,
        executed: false,
        actions: [['withdraw', 'USDC', 18_500, 'liquidity']],
    },
    {
        id: 6,
        title: 'Q1 2027 council operating budget',
        creator: 1,
        summary:
            'Approve the 30,000 USDC operating budget for council operations, tooling and legal review in Q1 2027.',
        start: 1,
        end: 8,
        approvals: 0,
        executed: false,
        actions: [['withdraw', 'USDC', 30_000, 'contributors']],
    },
];

const buildMsProposal = (d) => ({
    id: `${NET}-${MS_PLUGIN}-${d.id}`,
    proposalIndex: String(d.id - 1),
    incrementalId: d.id,
    title: d.title,
    network: NET,
    blockTimestamp: NOW + d.start * DAY - HOUR,
    summary: d.summary,
    metadataUri: `ipfs://bafkreiatlasproposal${d.id}`,
    description: longDescription(d, true),
    startDate: NOW + d.start * DAY,
    endDate: NOW + d.end * DAY,
    creator: addrInfo(MULTISIG_SIGNERS[d.creator]),
    daoAddress: MS_DAO_ADDR,
    transactionHash: txh(`msp-${d.id}`),
    resources: [
        {
            name: 'Grant application',
            url: `https://atlasgrants.org/applications/${d.id}`,
        },
    ],
    settings: multisigSettings,
    executed: d.executed
        ? {
              status: true,
              transactionHash: txh(`msp-exec-${d.id}`),
              blockTimestamp: NOW + (d.start + 3) * DAY,
              blockNumber: 21_300_000 + d.id,
          }
        : { status: false },
    pluginAddress: MS_PLUGIN,
    pluginSubdomain: 'multisig',
    pluginInterfaceType: 'multisig',
    hasActions: d.actions.length > 0,
    hasSimulation: false,
    metrics: { totalVotes: d.approvals },
});

const TV_PROPOSALS = tvProposalDefs
    .map(buildTvProposal)
    .sort((a, b) => b.incrementalId - a.incrementalId);
const MS_PROPOSALS = msProposalDefs
    .map(buildMsProposal)
    .sort((a, b) => b.incrementalId - a.incrementalId);

const encodeTransfer = (to, amount) =>
    viem.encodeFunctionData({
        abi: viem.erc20Abi,
        functionName: 'transfer',
        args: [to, BigInt(amount)],
    });

const buildActions = (def, daoAddr, daoObj) =>
    def.actions.map(([kind, sym, amount, recipientKey]) => {
        if (kind === 'withdraw') {
            const token = TOKENS[sym];
            const raw = units(amount, token.decimals);
            const to = RECIPIENTS[recipientKey];
            return {
                type: 'Transfer',
                from: daoAddr,
                to: token.address,
                data: encodeTransfer(to, raw),
                value: '0',
                inputData: {
                    function: 'transfer',
                    contract: token.name,
                    parameters: [
                        { name: 'to', type: 'address', value: to },
                        { name: 'value', type: 'uint256', value: raw },
                    ],
                },
                sender: { address: daoAddr },
                receiver: { address: to },
                amount: raw,
                token: {
                    name: token.name,
                    symbol: token.symbol,
                    address: token.address,
                    logo: token.logo,
                    priceUsd: token.priceUsd,
                    decimals: token.decimals,
                },
            };
        }
        if (kind === 'withdrawNative') {
            const token = TOKENS[sym];
            const raw = units(amount, 18);
            const to = RECIPIENTS[recipientKey];
            return {
                type: 'TransferNative',
                from: daoAddr,
                to,
                data: '0x',
                value: raw,
                inputData: { function: '', contract: '', parameters: [] },
                sender: { address: daoAddr },
                receiver: { address: to },
                amount: raw,
                token: {
                    name: token.name,
                    symbol: token.symbol,
                    address: token.address,
                    logo: token.logo,
                    priceUsd: token.priceUsd,
                    decimals: 18,
                },
            };
        }
        if (kind === 'metadata') {
            return {
                type: 'MetadataUpdate',
                from: daoAddr,
                to: daoAddr,
                data: '0xee57e36f',
                value: '0',
                inputData: {
                    function: 'setMetadata',
                    contract: 'DAO',
                    parameters: [
                        {
                            name: '_metadata',
                            type: 'bytes',
                            value: '0x697066733a2f2f62616679',
                        },
                    ],
                },
                existingMetadata: {
                    name: daoObj.name,
                    description:
                        'Meridian is a community-owned protocol for cross-chain liquidity routing.',
                    links: daoObj.links.slice(0, 2),
                },
                proposedMetadata: {
                    name: daoObj.name,
                    description: daoObj.description,
                    links: daoObj.links,
                },
            };
        }
        if (kind === 'addMembers') {
            return {
                type: 'MultisigAddMembers',
                from: daoAddr,
                to: MS_PLUGIN,
                data: '0x',
                value: '0',
                inputData: {
                    function: 'addAddresses',
                    contract: 'Multisig',
                    parameters: [
                        {
                            name: '_members',
                            type: 'address[]',
                            value: [PEOPLE[6].address],
                        },
                    ],
                },
                members: [{ address: PEOPLE[6].address }],
                currentMembers: 5,
            };
        }
        return null;
    });

const ACTIONS = {};
tvProposalDefs.forEach((d) => {
    ACTIONS[`${NET}-${TV_PLUGIN}-${d.id}`] = buildActions(
        d,
        TV_DAO_ADDR,
        TV_DAO,
    );
});
msProposalDefs.forEach((d) => {
    ACTIONS[`${NET}-${MS_PLUGIN}-${d.id}`] = buildActions(
        d,
        MS_DAO_ADDR,
        MS_DAO,
    );
});

// ---------- Votes ----------
const VOTES = {}; // proposalId -> votes
const voteOptionsCycle = [2, 2, 3, 2, 1, 2, 3, 2, 2, 1, 2, 3];
TV_PROPOSALS.forEach((p) => {
    if (p.metrics.votesByOption.length === 0) {
        VOTES[p.id] = [];
        return;
    }
    VOTES[p.id] = PEOPLE.slice(0, 10).map((m, i) => ({
        transactionHash: txh(`vote-${p.id}-${i}`),
        blockTimestamp: p.startDate + (i + 1) * 3 * HOUR,
        member: addrInfo(m),
        network: NET,
        token: TOKENS.MRD,
        votingPower: wei(m.vp),
        voteOption:
            p.incrementalId === 4 && i < 3
                ? 3
                : voteOptionsCycle[(i + p.incrementalId) % 12],
        proposal: p,
    }));
});
MS_PROPOSALS.forEach((p) => {
    VOTES[p.id] = MULTISIG_SIGNERS.slice(0, p.metrics.totalVotes).map(
        (m, i) => ({
            transactionHash: txh(`msvote-${p.id}-${i}`),
            blockTimestamp: p.startDate + (i + 1) * 5 * HOUR,
            member: addrInfo(m),
            network: NET,
            proposal: p,
        }),
    );
});

// ---------- Members ----------
const HEAD_BLOCK = 21_900_000;
const blockAt = (ts) => HEAD_BLOCK - Math.round((NOW - ts) / 12);
const TV_MEMBERS = PEOPLE.map((p, i) => ({
    address: p.address,
    ens: p.ens,
    type: 'token-voting',
    votingPower: wei(p.vp),
    tokenBalance: wei(p.bal),
    firstActive: blockAt(NOW - (380 - i * 20) * DAY),
    lastActive: blockAt(NOW - (i + 1) * DAY),
    metrics: {
        firstActivity: NOW - (380 - i * 20) * DAY,
        lastActivity: NOW - (i + 1) * DAY,
        delegationCount: p.deleg,
    },
}));
const MS_MEMBERS = MULTISIG_SIGNERS.map((p, i) => ({
    address: p.address,
    ens: p.ens,
    type: 'multisig',
    firstActive: blockAt(NOW - (220 - i * 10) * DAY),
    lastActive: blockAt(NOW - (i + 1) * 2 * DAY),
    metrics: {
        firstActivity: NOW - (220 - i * 10) * DAY,
        lastActivity: NOW - (i + 1) * 2 * DAY,
    },
}));

// ---------- Assets ----------
const asset = (sym, amount) => {
    const t = TOKENS[sym];
    return {
        amount: String(amount),
        amountUsd: (amount * Number(t.priceUsd)).toFixed(2),
        token: t,
    };
};
const TV_ASSETS = [
    asset('USDC', 1_852_340.55),
    asset('ETH', 418.274),
    asset('MRD', 1_100_000),
    asset('WETH', 152.5),
    asset('DAI', 231_420.18),
];
const MS_ASSETS = [
    asset('USDC', 412_880.15),
    asset('DAI', 120_000),
    asset('ETH', 25.32),
];

// ---------- Transactions ----------
const txDefs = [
    ['deposit', 'USDC', 250_000, 2, PEOPLE[3].address],
    ['execution', null, 1, 26, null, 3],
    ['withdraw', 'USDC', 180_000, 38, RECIPIENTS.contributors],
    ['execution', null, 1, 38.5, null, 2],
    ['deposit', 'ETH', 75, 45, PEOPLE[1].address],
    ['deposit', 'MRD', 1_100_000, 60, addr('mrd-vesting')],
    ['withdraw', 'DAI', 42_000, 72, RECIPIENTS.events],
    ['deposit', 'WETH', 152.5, 88, PEOPLE[0].address],
    ['deposit', 'DAI', 273_420.18, 120, addr('cow-settlement')],
    ['deposit', 'USDC', 1_782_340.55, 180, addr('treasury-migration')],
    ['deposit', 'ETH', 343.274, 240, addr('treasury-migration')],
];
const buildTxs = (daoAddr, defs) =>
    defs.map(([side, sym, amount, daysAgo, counterparty, propId], i) => {
        const base = {
            network: NET,
            blockNumber: 21_900_000 - Math.round(daysAgo * 7200),
            blockTimestamp: NOW - Math.round(daysAgo * DAY),
            value: '0',
            transactionHash: txh(`${daoAddr}-tx-${i}`),
            id: `${NET}-${txh(`${daoAddr}-tx-${i}`)}-${i}`,
        };
        if (side === 'execution') {
            return {
                ...base,
                fromAddress: TV_PLUGIN,
                toAddress: daoAddr,
                side: 'execution',
                type: 'execution',
                daoAddress: daoAddr,
                source: 'proposal',
                proposalIndex: String(propId - 1),
                actionCount: amount,
            };
        }
        const t = TOKENS[sym];
        return {
            ...base,
            fromAddress: side === 'deposit' ? counterparty : daoAddr,
            toAddress: side === 'deposit' ? daoAddr : counterparty,
            value: String(amount),
            side,
            token: t,
            amountUsd: (amount * Number(t.priceUsd)).toFixed(2),
        };
    });
const TV_TXS = buildTxs(TV_DAO_ADDR, txDefs);
const MS_TXS = buildTxs(MS_DAO_ADDR, [
    ['deposit', 'USDC', 500_000, 4, TV_DAO_ADDR],
    ['withdraw', 'USDC', 40_000, 32, RECIPIENTS.events],
    ['deposit', 'DAI', 120_000, 70, TV_DAO_ADDR],
    ['deposit', 'ETH', 25.32, 150, PEOPLE[2].address],
]);

// ---------- Permissions ----------
const ent = (address, layer, extra = {}) => ({ address, layer, ...extra });
const buildPermissions = (daoAddr, plugin, label) => {
    const daoEnt = ent(daoAddr, 'dao', { label: 'DAO', status: 'installed' });
    const plEnt = ent(plugin.address, 'topLevelPlugin', {
        label,
        interfaceType: plugin.interfaceType,
        status: 'installed',
    });
    const p = (name, who, where) => ({
        permissionId: permId(name),
        whoAddress: who.address,
        whereAddress: where.address,
        who,
        where,
        network: NET,
    });
    return [
        p('EXECUTE_PERMISSION', plEnt, daoEnt),
        p('ROOT_PERMISSION', daoEnt, daoEnt),
        p('UPGRADE_DAO_PERMISSION', daoEnt, daoEnt),
        p('SET_METADATA_PERMISSION', daoEnt, daoEnt),
        p('REGISTER_STANDARD_CALLBACK_PERMISSION', daoEnt, daoEnt),
        p('SET_TRUSTED_FORWARDER_PERMISSION', daoEnt, daoEnt),
        p(
            plugin.interfaceType === 'multisig'
                ? 'UPDATE_MULTISIG_SETTINGS_PERMISSION'
                : 'UPDATE_VOTING_SETTINGS_PERMISSION',
            daoEnt,
            plEnt,
        ),
        p('UPGRADE_PLUGIN_PERMISSION', daoEnt, plEnt),
        p('SET_TARGET_CONFIG_PERMISSION', daoEnt, plEnt),
        p('SET_METADATA_PERMISSION', daoEnt, plEnt),
        ...(plugin.interfaceType === 'tokenVoting'
            ? [
                  p(
                      'MINT_PERMISSION',
                      daoEnt,
                      ent(TOKENS.MRD.address, 'contract', {
                          label: 'Meridian (MRD)',
                      }),
                  ),
              ]
            : []),
    ];
};

const DAOS = {
    [TV_DAO_ADDR]: {
        dao: TV_DAO,
        plugin: tvPlugin,
        proposals: TV_PROPOSALS,
        members: TV_MEMBERS,
        assets: TV_ASSETS,
        txs: TV_TXS,
        permissions: buildPermissions(
            TV_DAO_ADDR,
            tvPlugin,
            'Meridian Token Voting',
        ),
    },
    [MS_DAO_ADDR]: {
        dao: MS_DAO,
        plugin: msPlugin,
        proposals: MS_PROPOSALS,
        members: MS_MEMBERS,
        assets: MS_ASSETS,
        txs: MS_TXS,
        permissions: buildPermissions(
            MS_DAO_ADDR,
            msPlugin,
            'Grants Council Multisig',
        ),
    },
};

module.exports = {
    NOW,
    NET,
    ASSET_HOST,
    TOKENS,
    PEOPLE,
    MULTISIG_SIGNERS,
    DAOS,
    EXPLORE_DAOS,
    VOTES,
    ACTIONS,
    HEAD_BLOCK,
    TV_DAO_ADDR,
    MS_DAO_ADDR,
    TV_PLUGIN,
    MS_PLUGIN,
    addr,
    txh,
};
