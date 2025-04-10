import { initialiseAdminPlugin } from './adminPlugin';
import { adminPluginDialogsDefinitions } from './adminPlugin/constants/adminPluginDialogsDefinitions';
import { initialiseMultisigPlugin } from './multisigPlugin';
import { multisigPluginDialogsDefinitions } from './multisigPlugin/constants/multisigPluginDialogsDefinitions';
import { initialiseSppPlugin } from './sppPlugin';
import { sppPluginDialogsDefinitions } from './sppPlugin/constants/sppPluginDialogsDefinitions';
import { initialiseTokenPlugin } from './tokenPlugin';
import { tokenPluginDialogsDefinitions } from './tokenPlugin/constants/tokenPluginDialogsDefinitions';

export const initialisePlugins = () => {
    initialiseMultisigPlugin();
    initialiseTokenPlugin();
    initialiseSppPlugin();
    initialiseAdminPlugin();
};

export const pluginDialogsDefinitions = {
    ...tokenPluginDialogsDefinitions,
    ...adminPluginDialogsDefinitions,
    ...multisigPluginDialogsDefinitions,
    ...sppPluginDialogsDefinitions,
};
