import type { IProposalActionUpdatePluginMetadataObject } from '@/modules/governance/api/governanceService';
import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';

export interface IUpdatePluginMetadataFormData extends Omit<IProposalActionUpdatePluginMetadataObject, 'links'> {
    /**
     * Resources of the plugin.
     */
    resources?: IResourcesInputResource[];
}
