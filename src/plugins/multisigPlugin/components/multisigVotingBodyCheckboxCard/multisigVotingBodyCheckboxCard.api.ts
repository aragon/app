import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
import type { ICompositeAddress } from '@aragon/gov-ui-kit';

export interface IMultisigCreateProcessFormBody {
    /**
     * Name of the body.
     */
    name: string;
    /**
     * ID of the body generated internally to reference bodies to permissions.
     */
    id: string;
    /**
     * Optional description of the voting body.
     */
    description?: string;
    /**
     * Resources of the body.
     */
    resources: IResourcesInputResource[];
    /**
     * Members of the voting body.
     */
    members: ICompositeAddress[];
    /**
     * Amount of addresses in the authorized list that must approve a proposal for it to pass.
     */
    minApprovals: number;
}

export interface IMultisigVotingBodyCheckboxCardProps {
    /**
     * Body to render the checkbox card for.
     */
    body: IMultisigCreateProcessFormBody;
    /**
     * Callback called on body checkbox change.
     */
    onChange: (bodyId: string, checked: boolean) => void;
    /**
     * Defines if the body is checked or not.
     */
    checked: boolean;
}
