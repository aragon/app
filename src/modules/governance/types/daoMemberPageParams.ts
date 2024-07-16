import { type IDaoPageParams } from '@/shared/types';

export interface IDaoMemberPageParams extends IDaoPageParams {
    /**
     * Address of the DAO member.
     */
    address: string;
}
