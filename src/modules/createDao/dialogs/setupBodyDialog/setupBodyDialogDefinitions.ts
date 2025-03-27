import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';

export interface ISetupBodyForm<TGovernance = unknown, TMembership = unknown> {
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
