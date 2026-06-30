import { initialiseDaos } from './daos';
import { initialisePolicyPluginRegistry } from './modules/capitalFlow/utils/policyPluginRegistryUtils';
import { initialiseConditionRegistry } from './modules/settings/initConditionRegistry';
import { initialisePlugins } from './plugins';

export const initPluginRegistry = () => {
    initialisePlugins();
    initialisePolicyPluginRegistry();
    initialiseDaos();
    initialiseConditionRegistry();
};
