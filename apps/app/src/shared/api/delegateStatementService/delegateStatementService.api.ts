import type { IRequestUrlParams } from '../httpService';

export interface IGetDelegateStatementUrlParams {
    /**
     * IPFS CID of the pinned delegate-statement metadata.
     */
    cid: string;
}

export interface IGetDelegateStatementParams
    extends IRequestUrlParams<IGetDelegateStatementUrlParams> {}
