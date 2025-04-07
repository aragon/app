import { adminPluginDialogs } from '@/plugins/adminPlugin/constants/pluginDialogs';
import { multisigPluginDialogs } from '@/plugins/multisigPlugin/constants/pluginDialogs';
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

export const pluginDialogs = {
    ...tokenPluginDialogs,
    ...adminPluginDialogs,
    ...multisigPluginDialogs,
};
