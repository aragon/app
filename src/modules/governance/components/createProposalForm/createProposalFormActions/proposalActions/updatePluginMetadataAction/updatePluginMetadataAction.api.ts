import type { IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import type {
    IProposalActionUpdatePluginMetadata,
    IProposalActionUpdatePluginMetadataObject,
} from '@/modules/governance/api/governanceService';
import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
import type {
    IIpfsMetadata,
    IProposalActionData,
} from '../../../createProposalFormDefinitions';

export interface IUpdatePluginMetadataFormData
    extends Omit<IProposalActionUpdatePluginMetadataObject, 'links'> {
    /**
     * Resources of the plugin.
     */
    resources?: IResourcesInputResource[];
}

export interface IUpdatePluginMetadataAction
    extends Omit<
        IProposalActionUpdatePluginMetadata,
        'proposedMetadata' | 'data'
    > {
    /**
     * Metadata proposed on the action.
     */
    proposedMetadata: IUpdatePluginMetadataFormData;
    /**
     * The encoded transaction data (populated by background pinning).
     */
    data?: string;
    /**
     * IPFS metadata for the action (optional).
     * Contains pinning state and encoded transaction data.
     */
    ipfsMetadata?: IIpfsMetadata;
}

export interface IUpdatePluginMetadataActionProps
    extends IProposalActionComponentProps<IProposalActionData> {}
