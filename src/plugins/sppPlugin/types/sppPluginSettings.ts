import type { IPluginSettings } from '@/shared/api/daoService';
import type { ISppStage } from './sppStage';

export interface ISppPluginSettings extends IPluginSettings {
    /**
     * List of stages of the SPP plugin.
     */
    stages: ISppStage[];
}
