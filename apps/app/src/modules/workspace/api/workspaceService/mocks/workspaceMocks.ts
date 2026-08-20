import { Network } from '@/shared/api/daoService';
import type { IBackendApiMock } from '@/shared/types';
import type { IWorkspace, IWorkspaceDetails } from '../domain';
import {
    WorkspaceAccountType,
    WorkspaceGateRequirement,
    WorkspaceScheme,
    WorkspaceStatus,
    WorkspaceTargetStatus,
} from '../domain';

const creator = '0x5F1680d0c2c5E9d3615a036FbDc7432E7bf246FB';
const accessControlDao = '0x652a31c669f9AB37f6040f279139a75D04F2679e';
const ownableDao = '0x1703ed1bFacC04b7eB654b297aA4E52EBC008722';
const externalOperator = '0x9F2eB3a0dC1B4C4f8b0f3C9e9c1a5B7D6E2F1A08';

const readyWorkspace: IWorkspaceDetails = {
    id: 'c7c12107-bc8c-4602-b68d-d0f67b8b6374',
    name: 'test-workspace',
    title: null,
    description: null,
    logo: null,
    creator,
    network: Network.ETHEREUM_MAINNET,
    status: WorkspaceStatus.READY,
    error: null,
    counts: { targets: 2, gates: 3, accounts: 2, capabilities: 15 },
    targets: [
        {
            address: '0x974E865B1BB24AF2a9ef8204AdEA9251Cc7C5FD9',
            status: WorkspaceTargetStatus.DONE,
            schemes: [WorkspaceScheme.ACCESS_CONTROL],
            owner: accessControlDao,
            pendingOwner: null,
            authority: null,
            error: null,
            gates: [
                {
                    requirement: WorkspaceGateRequirement.ROLE,
                    role: '0x71840dc4906352362b0cdaf79870196c8e42acafade72d5d5a6d59291253ceb1',
                    roleName: 'GOVERNANCE_ROLE',
                    inferred: false,
                    holders: [
                        {
                            address: accessControlDao,
                            type: WorkspaceAccountType.DAO,
                            ref: null,
                        },
                    ],
                    selectors: [
                        {
                            selector: '0x68a9f19c',
                            signature: 'addSlasher(address)',
                        },
                        {
                            selector: '0xaac6aa9c',
                            signature: 'removeSlasher(address)',
                        },
                        {
                            selector: '0xf7770b53',
                            signature:
                                'setSlashPolicy(bytes32,(uint256,uint256,bool,address,bool,uint256,bool,bool,uint8))',
                        },
                    ],
                },
                {
                    requirement: WorkspaceGateRequirement.ROLE,
                    role: '0x0000000000000000000000000000000000000000000000000000000000000000',
                    roleName: 'DEFAULT_ADMIN_ROLE',
                    inferred: false,
                    holders: [
                        {
                            address: accessControlDao,
                            type: WorkspaceAccountType.DAO,
                            ref: null,
                        },
                    ],
                    selectors: [
                        {
                            selector: '0x634e93da',
                            signature: 'beginDefaultAdminTransfer(address)',
                        },
                        {
                            selector: '0xd602b9fd',
                            signature: 'cancelDefaultAdminTransfer()',
                        },
                        {
                            selector: '0x649a5ec7',
                            signature: 'changeDefaultAdminDelay(uint48)',
                        },
                        {
                            selector: '0x0aa6220b',
                            signature: 'rollbackDefaultAdminDelay()',
                        },
                        {
                            selector: '0xe59e4695',
                            signature: 'setBondingRegistry(address)',
                        },
                        {
                            selector: '0xfad8e111',
                            signature: 'setCiphernodeRegistry(address)',
                        },
                        {
                            selector: '0x02a3a9c9',
                            signature: 'setE3RefundManager(address)',
                        },
                        {
                            selector: '0x05cbb709',
                            signature: 'setInterfold(address)',
                        },
                    ],
                },
            ],
        },
        {
            address: '0xd0F6F372Ae2b640AE3b3875100Ce301d66f74607',
            status: WorkspaceTargetStatus.DONE,
            schemes: [WorkspaceScheme.OWNABLE],
            owner: ownableDao,
            pendingOwner: null,
            authority: null,
            error: null,
            gates: [
                {
                    requirement: WorkspaceGateRequirement.OWNER,
                    role: null,
                    roleName: null,
                    inferred: false,
                    holders: [
                        {
                            address: ownableDao,
                            type: WorkspaceAccountType.DAO,
                            ref: null,
                        },
                    ],
                    selectors: [
                        {
                            selector: '0x715018a6',
                            signature: 'renounceOwnership()',
                        },
                        {
                            selector: '0xf2fde38b',
                            signature: 'transferOwnership(address)',
                        },
                        {
                            selector: '0x70b62b49',
                            signature: 'updateEstimatedCost(uint256)',
                        },
                        {
                            selector: '0x13ae19b3',
                            signature: 'updateQueueHandler(address)',
                        },
                    ],
                },
            ],
        },
    ],
};

// Exercises every risk signal of the aside: an external (EOA) holder, an ownership transfer in
// flight, an inferred gate, a gate nobody holds and a target delegating to an authority contract.
const riskyWorkspace: IWorkspaceDetails = {
    id: '2f8ac0de-91b7-4f1d-9c2e-5a6b3d8e7c41',
    name: 'protocol-treasury',
    title: null,
    description: null,
    logo: null,
    creator,
    network: Network.ETHEREUM_MAINNET,
    status: WorkspaceStatus.READY,
    error: null,
    counts: { targets: 2, gates: 3, accounts: 2, capabilities: 5 },
    targets: [
        {
            address: '0x3A7c4B1E9d2F5a8C6b0E4D7f1A9c3B5e8D2F6a41',
            status: WorkspaceTargetStatus.DONE,
            schemes: [WorkspaceScheme.OWNABLE_2_STEP],
            owner: externalOperator,
            pendingOwner: ownableDao,
            authority: null,
            error: null,
            gates: [
                {
                    requirement: WorkspaceGateRequirement.OWNER,
                    role: null,
                    roleName: null,
                    inferred: false,
                    holders: [
                        {
                            address: externalOperator,
                            type: WorkspaceAccountType.EOA,
                            ref: null,
                        },
                    ],
                    selectors: [
                        {
                            selector: '0xf2fde38b',
                            signature: 'transferOwnership(address)',
                        },
                        { selector: '0x8456cb59', signature: 'pause()' },
                        { selector: '0x3f4ba83a', signature: 'unpause()' },
                    ],
                },
                {
                    requirement: WorkspaceGateRequirement.ROLE,
                    role: '0x9f2b8c1d4e7a3f6b0c5d8e2a7b4f1c9d6e3a8b5f2c7d0e4a9b6f3c1d8e5a2b7f',
                    roleName: 'GUARDIAN_ROLE',
                    inferred: false,
                    holders: [],
                    selectors: [
                        {
                            selector: '0x2f2ff15d',
                            signature: 'grantRole(bytes32,address)',
                        },
                    ],
                },
            ],
        },
        {
            address: '0x6E1d9F3a8C2b5D7e0A4c8B1f6D3a9C5e2B7f4A18',
            status: WorkspaceTargetStatus.DONE,
            schemes: [WorkspaceScheme.ACCESS_MANAGED],
            owner: null,
            pendingOwner: null,
            authority: '0xB4c7E2a9F1d6C3b8A5e0D4f7C2a9B6e3D8f1A574',
            error: null,
            gates: [
                {
                    requirement: WorkspaceGateRequirement.AUTHORITY,
                    role: null,
                    roleName: null,
                    inferred: true,
                    holders: [
                        {
                            address: ownableDao,
                            type: WorkspaceAccountType.DAO,
                            ref: 'Treasury DAO',
                        },
                    ],
                    selectors: [
                        {
                            selector: '0x1e4e0091',
                            signature: 'setAuthority(address)',
                        },
                    ],
                },
            ],
        },
    ],
};

// Exercises the progressive states: the scan is still running and one target could not be resolved.
const scanningWorkspace: IWorkspaceDetails = {
    id: '9b3d5e71-4c8a-42f6-b1d0-7e2a5c9f8b34',
    name: 'staking-contracts',
    title: null,
    description: null,
    logo: null,
    creator,
    network: Network.ETHEREUM_MAINNET,
    status: WorkspaceStatus.SCANNING,
    error: null,
    counts: { targets: 2, gates: 0, accounts: 0, capabilities: 0 },
    targets: [
        {
            address: '0x8C5f2A9e1D4b7C3a6F0e8B2d5A9c1F7e3B6d4A29',
            status: WorkspaceTargetStatus.PENDING,
            schemes: [],
            owner: null,
            pendingOwner: null,
            authority: null,
            error: null,
            gates: [],
        },
        {
            address: '0x4D9a1F6c3B8e5A2d7C0f4B9e1A6d3C8f5B2e7A61',
            status: WorkspaceTargetStatus.UNDETERMINED,
            schemes: [],
            owner: null,
            pendingOwner: null,
            authority: null,
            error: 'Contract source is not verified on Etherscan',
            gates: [],
        },
    ],
};

// A workspace on another network, fully resolved and held by DAOs only.
const vaultsWorkspace: IWorkspaceDetails = {
    id: '7d4e2b98-3a15-4c67-8e0b-1f9d6c4a2e83',
    name: 'defi-vaults',
    title: null,
    description: null,
    logo: null,
    creator,
    network: Network.BASE_MAINNET,
    status: WorkspaceStatus.READY,
    error: null,
    counts: { targets: 2, gates: 2, accounts: 2, capabilities: 5 },
    targets: [
        {
            address: '0x5B8e1D4a7C2f9E6b3A0d8C5f2B7e4A1d9C6f3B58',
            status: WorkspaceTargetStatus.DONE,
            schemes: [WorkspaceScheme.OWNABLE],
            owner: accessControlDao,
            pendingOwner: null,
            authority: null,
            error: null,
            gates: [
                {
                    requirement: WorkspaceGateRequirement.OWNER,
                    role: null,
                    roleName: null,
                    inferred: false,
                    holders: [
                        {
                            address: accessControlDao,
                            type: WorkspaceAccountType.DAO,
                            ref: 'Vaults DAO',
                        },
                    ],
                    selectors: [
                        {
                            selector: '0x6817031b',
                            signature: 'setVault(address)',
                        },
                        {
                            selector: '0xab033ea9',
                            signature: 'setFeeRecipient(address)',
                        },
                        {
                            selector: '0x2b7ac3f3',
                            signature: 'setPerformanceFee(uint256)',
                        },
                    ],
                },
            ],
        },
        {
            address: '0xC2f7B9e4A1d8C5f3B0e6A9d2C7f4B1e8A5d3C976',
            status: WorkspaceTargetStatus.DONE,
            schemes: [WorkspaceScheme.ACCESS_CONTROL_ENUMERABLE],
            owner: null,
            pendingOwner: null,
            authority: null,
            error: null,
            gates: [
                {
                    requirement: WorkspaceGateRequirement.ROLE,
                    role: '0x4c9f8b2e1d7a3f6b0c5d8e2a9c4f7b1e6d3a8c5f2b9e4d7a1c6f3b8e5d2a9c47',
                    roleName: 'KEEPER_ROLE',
                    inferred: false,
                    holders: [
                        {
                            address: ownableDao,
                            type: WorkspaceAccountType.PLUGIN,
                            ref: 'multisig',
                        },
                    ],
                    selectors: [
                        { selector: '0x4641257d', signature: 'harvest()' },
                        { selector: '0x853828b6', signature: 'withdrawAll()' },
                    ],
                },
            ],
        },
    ],
};

// A workspace whose scan failed outright.
const failedWorkspace: IWorkspaceDetails = {
    id: 'b6e93f52-8d47-41ac-9f18-2c5a7e0b4d69',
    name: 'nft-royalties',
    title: null,
    description: null,
    logo: null,
    creator,
    network: Network.POLYGON_MAINNET,
    status: WorkspaceStatus.FAILED,
    error: 'RPC provider timed out while scanning the targets',
    counts: { targets: 1, gates: 0, accounts: 0, capabilities: 0 },
    targets: [
        {
            address: '0xA9d3C6f1B8e5A2d7C0f4B9e6A3d1C8f5B2e7A940',
            status: WorkspaceTargetStatus.FAILED,
            schemes: [],
            owner: null,
            pendingOwner: null,
            authority: null,
            error: 'RPC provider timed out',
            gates: [],
        },
    ],
};

// Returned by the create endpoint, which answers 202 before the scan starts.
const createdWorkspace: IWorkspaceDetails = {
    id: 'f1a8c34d-6b29-4e75-8c01-9d3f7a2e5b48',
    name: 'new-workspace',
    title: null,
    description: null,
    logo: null,
    creator,
    network: Network.ETHEREUM_MAINNET,
    status: WorkspaceStatus.PENDING,
    error: null,
    counts: { targets: 0, gates: 0, accounts: 0, capabilities: 0 },
    targets: [],
};

const workspaces = [
    readyWorkspace,
    riskyWorkspace,
    vaultsWorkspace,
    scanningWorkspace,
    failedWorkspace,
];

const createdAtByWorkspaceId: Record<string, string> = {
    [readyWorkspace.id]: '2026-08-14T09:12:00.000Z',
    [riskyWorkspace.id]: '2026-08-12T16:40:00.000Z',
    [vaultsWorkspace.id]: '2026-08-08T11:05:00.000Z',
    [scanningWorkspace.id]: '2026-08-19T07:30:00.000Z',
    [failedWorkspace.id]: '2026-07-29T13:22:00.000Z',
    [createdWorkspace.id]: '2026-08-20T08:00:00.000Z',
};

const toSummary = (workspace: IWorkspaceDetails): IWorkspace => ({
    id: workspace.id,
    name: workspace.name,
    title: workspace.title,
    description: workspace.description,
    logo: workspace.logo,
    creator: workspace.creator,
    network: workspace.network,
    status: workspace.status,
    targets: workspace.targets.length,
    createdAt: createdAtByWorkspaceId[workspace.id],
});

const toCreated = ({
    id,
    name,
    creator: owner,
    network,
    status,
}: IWorkspaceDetails) => ({
    id,
    name,
    creator: owner,
    network,
    status,
});

/**
 * Mocked responses for the workspace endpoints, consumed by the fetch interceptor when the
 * `useMocks` feature flag is enabled. Mirrors the shapes of the aragon-workspace service so the UI
 * can be worked on without it running.
 */
export const workspaceApiMocks: IBackendApiMock[] = [
    ...[...workspaces, createdWorkspace].map((workspace) => ({
        url: new RegExp(`/workspace/${workspace.id}`),
        method: 'GET',
        type: 'replace' as const,
        data: workspace,
    })),
    {
        url: /\/workspace(\?|$)/,
        method: 'POST',
        type: 'replace',
        data: toCreated(createdWorkspace),
    },
    {
        url: /\/workspace(\?|$)/,
        method: 'GET',
        type: 'replace',
        data: workspaces.map(toSummary),
    },
];
