import type { IDaoPlugin } from '@/shared/api/daoService';
import type { TranslationFunction } from '@/shared/components/translationsProvider';

export interface IPluginActionsParams {
    /**
     * Plugin to build the action composer data for.
     */
    plugin: IDaoPlugin;
    /**
     * The translation function for internationalization.
     */
    t: TranslationFunction;
}
