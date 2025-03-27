import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
import type { ICompositeAddress } from '@aragon/gov-ui-kit';

export interface ISetupBodyForm<
    TGovernance = unknown,
    TMember extends ICompositeAddress = ICompositeAddress,
    TMembership extends ISetupBodyFormMembership<TMember> = ISetupBodyFormMembership<TMember>,
> {
    /**
     * Name of the body.
     */
    name: string;
    /**
     * Unique ID of the body generated automatically.
     */
    id: string;
    /**
     * Optional description of the voting body.
     */
    description?: string;
    /**
     * Index of the stage the body is associated with, only defined when setting up advanced governance processes.
     */
    stageIndex?: number;
    /**
     * Resources of the body.
     */
    resources: IResourcesInputResource[];
    /**
     * ID of the plugin defining the membership and governance settings of the body.
     */
    plugin: string;
    /**
     * Plugin-specific governance settings of the body.
     */
    governance: TGovernance;
    /**
     * Plugin-specific membership settings of the body.
     */
    membership: TMembership;
}

export interface ISetupBodyFormMembership<TMember extends ICompositeAddress = ICompositeAddress> {
    /**
     * Members of the plugin.
     */
    members: TMember[];
}
