import { initialiseDaos } from './daos';
import { initialisePolicyPluginRegistry } from './modules/capitalFlow/utils/policyPluginRegistryUtils';
import { initialisePlugins } from './plugins';

export const initPluginRegistry = () => {
    initialisePlugins();
    initialisePolicyPluginRegistry();
    initialiseDaos();
};
