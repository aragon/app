import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import type { IDaoPlugin } from '@/shared/api/daoService';

export enum TokenDelegationSelection {
    YOURSELF = 'YOURSELF',
    OTHER = 'OTHER',
}

export interface ITokenDelegationFormData {
    /**
     * Current selection for the delegate.
     */
    selection: TokenDelegationSelection;
    /**
     * Address to delegate the voting power to.
     */
    delegate?: string;
}

export interface ITokenDelegationFormProps {
    /**
     * DAO plugin for the token delegation.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
    /**
     * ID of the DAO.
     */
    daoId: string;
}
