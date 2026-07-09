import type { IProposal } from '@/modules/governance/api/governanceService';
import type { IDaoPlugin } from '@/shared/api/daoService';

export interface IPermissionCheckGuardParams<
    TPlugin extends IDaoPlugin = IDaoPlugin,
> {
    /**
     * Plugin to check permissions for.
     */
    plugin: TPlugin;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Proposal to check permissions for.
     */
    proposal?: IProposal<TPlugin['settings']>;
    /**
     * Whether to show the connected user's permissions info.
     * @default true
     */
    useConnectedUserInfo?: boolean;
}
