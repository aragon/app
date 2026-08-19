import type {
    IMpcGetActivityServiceParams,
    IMpcGetBalanceServiceParams,
    IMpcGetMembersServiceParams,
    IMpcGetRequestsServiceParams,
    IMpcGetSystemServiceParams,
} from './mpcService.api';

export enum MpcServiceKey {
    SESSION = 'MPC_SESSION',
    SYSTEMS = 'MPC_SYSTEMS',
    SYSTEM = 'MPC_SYSTEM',
    MEMBERS = 'MPC_MEMBERS',
    REQUESTS = 'MPC_REQUESTS',
    ACTIVITY = 'MPC_ACTIVITY',
    BALANCE = 'MPC_BALANCE',
    DEVICE_SHARE = 'MPC_DEVICE_SHARE',
}

const PREFIX = 'mpc';

export const mpcServiceKeys = {
    session: () => [PREFIX, MpcServiceKey.SESSION],
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
    /**
     * Prefix keys used by mutations to invalidate every query of a kind (e.g. all systems).
     */
    prefix: (key: MpcServiceKey) => [PREFIX, key],
    all: () => [PREFIX],
};
