import { initialiseAdminPlugin } from './adminPlugin';
import { initialiseMultisigPlugin } from './multisigPlugin';
import { initialiseSppPlugin } from './sppPlugin';
import { initialiseTokenPlugin } from './tokenPlugin';
import { tokenPluginDialogs } from './tokenPlugin/constants/pluginDialogs';

export const initialisePlugins = () => {
    initialiseMultisigPlugin();
    initialiseTokenPlugin();
    initialiseSppPlugin();
    initialiseAdminPlugin();
};

// collect all dialogs and reexport
export const pluginDialogs = {
    ...tokenPluginDialogs,
};
