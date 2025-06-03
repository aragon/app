import type { IGetTokenLocksParams } from '@/plugins/tokenPlugin/api/tokenService/tokenService.api';

export enum TokenServiceKey {
    MEMBER_LOCKS = 'MEMBER_LOCKS',
}

export const tokenServiceKeys = {
    memberLocks: (params: IGetTokenLocksParams) => [TokenServiceKey.MEMBER_LOCKS, params],
};
