import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
import type { ICompositeAddress } from '@aragon/gov-ui-kit';
import type { BodyType } from '../../types/enum';

export interface ISetupBodyFormBase {
    /**
     * Internal ID of the body used to reference the body.
     */
    internalId: string;
    /**
     * Type of the body to setup.
     */
    type: BodyType;
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
    type: BodyType.NEW;
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

export interface ISetupBodyFormExternal
    extends ISetupBodyFormBase,
        ICompositeAddress,
        Pick<ISetupBodyFormNew, 'canCreateProposal'> {
    /**
     * EXTERNAL body type.
     */
    type: BodyType.EXTERNAL;
    /**
     * Is given address a Safe multisig address.
     */
    isSafe: boolean;
}

export interface ISetupBodyFormExisting<
    TGovernance = unknown,
    TMember extends ICompositeAddress = ICompositeAddress,
    TMembership extends ISetupBodyFormMembership<TMember> = ISetupBodyFormMembership<TMember>,
> extends Pick<
        ISetupBodyFormNew<TGovernance, TMember, TMembership>,
        'internalId' | 'plugin' | 'description' | 'resources' | 'governance' | 'membership' | 'canCreateProposal'
    > {
    /**
     * EXISTING body type.
     */
    type: BodyType.EXISTING;
    /**
     * Name of existing body, optional as not set for existing but external bodies.
     */
    name?: string;
    /**
     * Address of the existing body.
     */
    address: string;
    /**
     * Build of the existing body.
     */
    build?: string;
    /**
     * Release of the existing body.
     */
    release?: string;
    /**
     * Address of the create proposal condition of the body.
     */
    proposalCreationConditionAddress?: string;
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
