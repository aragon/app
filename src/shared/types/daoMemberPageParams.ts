import { type IDaoPageParams } from './daoPageParams';

export interface IDaoMemberPageParams extends IDaoPageParams {
    /**
     * Address of the DAO member.
     */
    address: string;
}
