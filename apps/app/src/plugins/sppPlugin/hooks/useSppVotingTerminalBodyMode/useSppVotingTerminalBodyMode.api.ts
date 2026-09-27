import type { PluginId } from '@/shared/utils/pluginRegistryUtils';
import type { ISppProposal, ISppStage, ISppStagePlugin } from '../../types';

export interface IUseSppVotingTerminalBodyModeParams {
    /**
     * Stage plugin (body) whose rendering mode is resolved.
     */
    plugin: ISppStagePlugin;
    /**
     * Parent proposal of the stage.
     */
    proposal: ISppProposal;
    /**
     * Stage the body belongs to.
     */
    stage: ISppStage;
}

export interface IUseSppVotingTerminalBodyModeReturn {
    /**
     * Plugin interface id every slot of the body renders through.
     */
    pluginId: PluginId;
    /**
     * Whether a settled Safe report could not be found in history, routing the body through the
     * external fallback.
     */
    isHistoryMissing: boolean;
}
