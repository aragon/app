import type { IGetTokenLocksParams } from './tokenService.api';

export enum TokenServiceKey {
    TOKEN_LOCKS = 'TOKEN_LOCKS',
}

export const tokenServiceKeys = {
    tokenLocks: (params: IGetTokenLocksParams) => [TokenServiceKey.TOKEN_LOCKS, params],
};
