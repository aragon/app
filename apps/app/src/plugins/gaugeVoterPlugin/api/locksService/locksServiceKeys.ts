import type { IGetMemberLocksParams } from './locksService.api';

export enum LocksServiceKey {
    MEMBER_LOCKS = 'MEMBER_LOCKS',
}

export const locksServiceKeys = {
    memberLocks: (params: IGetMemberLocksParams) => [
        LocksServiceKey.MEMBER_LOCKS,
        params,
    ],
};
