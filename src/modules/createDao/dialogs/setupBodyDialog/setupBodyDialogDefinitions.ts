import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
import type { ICompositeAddress } from '@aragon/gov-ui-kit';

export enum SetupBodyType {
    NEW = 'NEW',
    EXTERNAL = 'EXTERNAL',
    EXISTING = 'EXISTING',
}

export interface ISetupBodyFormBase {
    /**
     * Internal ID of the body used to reference the body.
     */
    internalId: string;
    /**
     * Type of the body to setup.
     */
    type: SetupBodyType;
    /**
     * ID of the plugin defining the membership and governance settings of the body.
     */
    plugin: string;
}

export interface ISetupBodyFormNew<
    TGovernance = unknown,
    TMember extends ICompositeAddress = ICompositeAddress,
    TMembership extends ISetupBodyFormMembership<TMember> = ISetupBodyFormMembership<TMember>,
> extends ISetupBodyFormBase {
    /**
     * NEW body type.
     */
    type: SetupBodyType.NEW;
    /**
     * Name of the body.
     */
    name: string;
    /**
     * Optional description of the voting body.
     */
    description?: string;
    /**
     * Resources of the body.
     */
    resources: IResourcesInputResource[];
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

export interface ISetupBodyFormExternal extends ISetupBodyFormBase, ICompositeAddress {
    /**
     * EXTERNAL body type.
     */
    type: SetupBodyType.EXTERNAL;
}

export interface ISetupBodyFormExisting<
    TGovernance = unknown,
    TMember extends ICompositeAddress = ICompositeAddress,
    TMembership extends ISetupBodyFormMembership<TMember> = ISetupBodyFormMembership<TMember>,
> extends Pick<
            ISetupBodyFormNew<TGovernance, TMember, TMembership>,
            'internalId' | 'plugin' | 'description' | 'resources' | 'governance' | 'membership' | 'canCreateProposal'
        >,
        Pick<ICompositeAddress, 'address' | 'name'> {
    /**
     * EXISTING body type.
     */
    type: SetupBodyType.EXISTING;
    /**
     * Membership configuration and details.
     */
    membership: TMembership;
    /**
     * Optional name from NEW bodies.
     */
    name?: string;
    /**
     * Address of the plugin contract for read‑only lookup.
     */
    pluginAddress?: string;
}

export type ISetupBodyForm<
    TGovernance = unknown,
    TMember extends ICompositeAddress = ICompositeAddress,
    TMembership extends ISetupBodyFormMembership<TMember> = ISetupBodyFormMembership<TMember>,
> =
    | ISetupBodyFormNew<TGovernance, TMember, TMembership>
    | ISetupBodyFormExisting<TGovernance, TMember, TMembership>
    | ISetupBodyFormExternal;

export interface ISetupBodyFormMembership<TMember extends ICompositeAddress = ICompositeAddress> {
    /**
     * Members of the plugin.
     */
    members: TMember[];
}
