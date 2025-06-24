import { initialiseDaos } from './daos';
import { initialisePlugins } from './plugins';

export const initPluginRegistry = () => {
    initialisePlugins();
    initialiseDaos();
};
