import type { IGetMemberLocksParams } from './tokenService.api';

export enum TokenServiceKey {
    MEMBER_LOCKS = 'MEMBER_LOCKS',
}

export const tokenServiceKeys = {
    memberLocks: (params: IGetMemberLocksParams) => [
        TokenServiceKey.MEMBER_LOCKS,
        params,
    ],
};
