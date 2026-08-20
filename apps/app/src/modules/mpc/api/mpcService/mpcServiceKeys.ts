import type {
    IMpcGetActivityServiceParams,
    IMpcGetBalanceServiceParams,
    IMpcGetMembersServiceParams,
    IMpcGetRequestsServiceParams,
    IMpcGetSystemServiceParams,
    IMpcGetWorkspaceMembersServiceParams,
    IMpcGetWorkspacePoliciesServiceParams,
    IMpcGetWorkspacePolicyServiceParams,
    IMpcGetWorkspaceServiceParams,
    IMpcGetWorkspaceSystemsServiceParams,
} from './mpcService.api';

export enum MpcServiceKey {
    SESSION = 'MPC_SESSION',
    TOTP_SETUP = 'MPC_TOTP_SETUP',
    SYSTEMS = 'MPC_SYSTEMS',
    SYSTEM = 'MPC_SYSTEM',
    MEMBERS = 'MPC_MEMBERS',
    REQUESTS = 'MPC_REQUESTS',
    ACTIVITY = 'MPC_ACTIVITY',
    BALANCE = 'MPC_BALANCE',
    DEVICE_SHARE = 'MPC_DEVICE_SHARE',
    WORKSPACES = 'MPC_WORKSPACES',
    WORKSPACE = 'MPC_WORKSPACE',
    WORKSPACE_POLICIES = 'MPC_WORKSPACE_POLICIES',
    WORKSPACE_POLICY = 'MPC_WORKSPACE_POLICY',
    WORKSPACE_SYSTEMS = 'MPC_WORKSPACE_SYSTEMS',
    WORKSPACE_MEMBERS = 'MPC_WORKSPACE_MEMBERS',
    POLICY_CATALOG = 'MPC_POLICY_CATALOG',
}

const PREFIX = 'mpc';

export const mpcServiceKeys = {
    session: () => [PREFIX, MpcServiceKey.SESSION],
    totpSetup: () => [PREFIX, MpcServiceKey.TOTP_SETUP],
    systems: () => [PREFIX, MpcServiceKey.SYSTEMS],
    system: (params: IMpcGetSystemServiceParams) => [
        PREFIX,
        MpcServiceKey.SYSTEM,
        params,
    ],
    members: (params: IMpcGetMembersServiceParams) => [
        PREFIX,
        MpcServiceKey.MEMBERS,
        params,
    ],
    requests: (params: IMpcGetRequestsServiceParams) => [
        PREFIX,
        MpcServiceKey.REQUESTS,
        params,
    ],
    activity: (params: IMpcGetActivityServiceParams) => [
        PREFIX,
        MpcServiceKey.ACTIVITY,
        params,
    ],
    balance: (params: IMpcGetBalanceServiceParams) => [
        PREFIX,
        MpcServiceKey.BALANCE,
        params,
    ],
    /**
     * Presence of the device share in this browser (client-side storage, not an API call).
     */
    deviceShare: (systemId: string) => [
        PREFIX,
        MpcServiceKey.DEVICE_SHARE,
        systemId,
    ],
    workspaces: () => [PREFIX, MpcServiceKey.WORKSPACES],
    workspace: (params: IMpcGetWorkspaceServiceParams) => [
        PREFIX,
        MpcServiceKey.WORKSPACE,
        params,
    ],
    workspacePolicies: (params: IMpcGetWorkspacePoliciesServiceParams) => [
        PREFIX,
        MpcServiceKey.WORKSPACE_POLICIES,
        params,
    ],
    workspacePolicy: (params: IMpcGetWorkspacePolicyServiceParams) => [
        PREFIX,
        MpcServiceKey.WORKSPACE_POLICY,
        params,
    ],
    workspaceSystems: (params: IMpcGetWorkspaceSystemsServiceParams) => [
        PREFIX,
        MpcServiceKey.WORKSPACE_SYSTEMS,
        params,
    ],
    workspaceMembers: (params: IMpcGetWorkspaceMembersServiceParams) => [
        PREFIX,
        MpcServiceKey.WORKSPACE_MEMBERS,
        params,
    ],
    policyCatalog: () => [PREFIX, MpcServiceKey.POLICY_CATALOG],
    /**
     * Prefix keys used by mutations to invalidate every query of a kind (e.g. all systems).
     */
    prefix: (key: MpcServiceKey) => [PREFIX, key],
    all: () => [PREFIX],
};
