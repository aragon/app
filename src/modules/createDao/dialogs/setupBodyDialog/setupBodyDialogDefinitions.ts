import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
import type { ICompositeAddress } from '@aragon/gov-ui-kit';

export interface ISetupBodyForm<
    TGovernance = unknown,
    TMember extends ICompositeAddress = ICompositeAddress,
    TMembership extends ISetupBodyFormMembership<TMember> = ISetupBodyFormMembership<TMember>,
> {
    /**
     * Internal ID of the body used to reference the body.
     */
    internalId: string;
    /**
     * Name of the body.
     */
    name: string;
    /**
     * Address of the body, only set when selecting existing / external bodies.
     */
    address?: string;
    /**
     * Optional description of the voting body.
     */
    description?: string;
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
    /**
     * Generic boolean which reflects the internal plugin-specific proposal creation settings, used for validation and
     * for setting the correct condition rules when the plugin is installed as SPP sub-plugin.
     */
    canCreateProposal: boolean;
}

export interface ISetupBodyFormMembership<TMember extends ICompositeAddress = ICompositeAddress> {
    /**
     * Members of the plugin.
     */
    members: TMember[];
}
