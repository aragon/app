import type { ProposalActionComponent } from '@aragon/gov-ui-kit';
import { ProposalActionType } from '@/modules/governance/api/governanceService';
import { actionComposerUtils } from '../../actionComposer';
import type { IProposalActionData } from '../createProposalFormDefinitions';
import { TransferAssetAction } from './proposalActions/transferAssetAction';
import { UpdateDaoMetadataAction } from './proposalActions/updateDaoMetadataAction';
import { UpdatePluginMetadataAction } from './proposalActions/updatePluginMetadataAction';

/**
 * Core action components rendered by the proposal and direct-execute action
 * editors, keyed by action type. Each consumer merges these with its DAO's
 * plugin and permission action components.
 */
export const coreCustomActionComponents: Record<
    string,
    ProposalActionComponent<IProposalActionData>
> = {
    [ProposalActionType.TRANSFER]: TransferAssetAction,
    [actionComposerUtils.transferActionLocked]: TransferAssetAction,
    [ProposalActionType.METADATA_UPDATE]: UpdateDaoMetadataAction,
    [ProposalActionType.METADATA_PLUGIN_UPDATE]: UpdatePluginMetadataAction,
};
