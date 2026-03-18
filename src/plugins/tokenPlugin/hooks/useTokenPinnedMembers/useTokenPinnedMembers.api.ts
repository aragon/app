import type { IToken } from '@/modules/finance/api/financeService';

export interface IUseTokenPinnedMembersParams {
    daoId: string;
    pluginAddress: string;
    token: IToken;
    enableDelegation?: boolean;
}
