import type { IGetTokenMemberListParams } from './tokenPluginService.api';

export enum TokenPluginServiceKey {
    TOKEN_MEMBER_LIST = 'TOKEN_MEMBER_LIST',
}

export const tokenPluginServiceKeys = {
    tokenMemberList: (params: IGetTokenMemberListParams) => [TokenPluginServiceKey.TOKEN_MEMBER_LIST, params],
};
