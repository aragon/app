import type { IDaoSettings } from '@/shared/api/daoService';
import type { ISppStage } from './sppStage';

export interface IDaoSppSettingsObject extends IDaoSettings {
    /**
     * List of stages of the SPP plugin.
     */
    stages: ISppStage[];
}
