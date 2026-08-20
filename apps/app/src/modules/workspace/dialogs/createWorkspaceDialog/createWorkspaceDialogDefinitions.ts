import type { ICompositeAddress } from '@aragon/gov-ui-kit';
import type { Network } from '@/shared/api/daoService';

export interface ICreateWorkspaceFormTarget {
    /**
     * Address of the contract to track, set once the address input resolves it.
     */
    value?: ICompositeAddress;
}

export interface ICreateWorkspaceFormData {
    /**
     * Name of the workspace.
     */
    name: string;
    /**
     * Network of the workspace.
     */
    network: Network;
    /**
     * Contracts to be tracked by the workspace.
     */
    targets: ICreateWorkspaceFormTarget[];
}
