import { initialiseAdminPlugin } from './adminPlugin';
import { adminPluginDialogs } from './adminPlugin/constants/adminPluginDialogsDefinitions';
import { initialiseMultisigPlugin } from './multisigPlugin';
import { multisigPluginDialogs } from './multisigPlugin/constants/pluginDialogs';
import { initialiseSppPlugin } from './sppPlugin';
import { sppPluginDialogs } from './sppPlugin/constants/pluginDialogs';
import { initialiseTokenPlugin } from './tokenPlugin';
import { tokenPluginDialogs } from './tokenPlugin/constants/pluginDialogs';

export const initialisePlugins = () => {
    initialiseMultisigPlugin();
    initialiseTokenPlugin();
    initialiseSppPlugin();
    initialiseAdminPlugin();
};

export const pluginDialogs = {
    ...tokenPluginDialogs,
    ...adminPluginDialogs,
    ...multisigPluginDialogs,
    ...sppPluginDialogs,
};
