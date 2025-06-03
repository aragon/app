import type { IGetMemberLocksParams } from '@/plugins/tokenPlugin/api/tokenService/tokenService.api';

export enum TokenServiceKey {
    MEMBER_LOCKS = 'MEMBER_LOCKS',
}

export const tokenServiceKeys = {
    memberLocks: (params: IGetMemberLocksParams) => [TokenServiceKey.MEMBER_LOCKS, params],
};
