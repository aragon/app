import type { IPluginSettings } from '@/shared/api/daoService';
import type { ISppExternalProposer } from './sppExternalProposer';
import type { ISppStage } from './sppStage';

export interface ISppPluginSettings extends IPluginSettings {
    /**
     * List of stages of the SPP plugin.
     */
    stages: ISppStage[];
    /**
     * Safes granted proposal-creation permission that are not stage bodies of any stage. Undefined
     * until the backend resolves them.
     */
    externalProposers?: ISppExternalProposer[];
}
