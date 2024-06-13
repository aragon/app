import type { IGetMultisigMemberListParams } from './multisigPluginService.api';

export enum MultisigPluginServiceKey {
    MULTISIG_MEMBER_LIST = 'MULTISIG_MEMBER_LIST',
}

export const multisigPluginServiceKeys = {
    multisigMemberList: (params: IGetMultisigMemberListParams) => [
        MultisigPluginServiceKey.MULTISIG_MEMBER_LIST,
        params,
    ],
};
