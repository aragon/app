import type {
    IProposalAction,
    IProposalActionUpdatePluginMetadata,
    IProposalActionUpdatePluginMetadataObject,
} from '@/modules/governance/api/governanceService';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
import type { IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import type { IProposalActionData } from '../../../createProposalFormDefinitions';

export interface IUpdatePluginMetadataFormData extends Omit<IProposalActionUpdatePluginMetadataObject, 'links'> {
    /**
     * Resources of the plugin.
     */
    resources?: IResourcesInputResource[];
}

export interface IUpdatePluginMetadataAction extends Omit<IProposalActionUpdatePluginMetadata, 'proposedMetadata'> {
    /**
     * Metadata proposed on the action.
     */
    proposedMetadata: IUpdatePluginMetadataFormData;
}

export interface IUpdatePluginMetadataActionProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction, IDaoPlugin>> {}
