import { initialiseAdminPlugin } from './adminPlugin';
import { adminPluginDialogsDefinitions } from './adminPlugin/constants/adminPluginDialogsDefinitions';
import { initialiseCapitalDistributorPlugin } from './capitalDistributorPlugin';
import { capitalDistributorPluginDialogsDefinitions } from './capitalDistributorPlugin/constants/capitalDistributorPluginDialogsDefinitions';
import { initialiseLockToVotePlugin } from './lockToVotePlugin';
import { lockToVotePluginDialogsDefinitions } from './lockToVotePlugin/constants/lockToVotePluginDialogsDefinitions';
import { initialiseMultisigPlugin } from './multisigPlugin';
import { multisigPluginDialogsDefinitions } from './multisigPlugin/constants/multisigPluginDialogsDefinitions';
import { initialiseSppPlugin } from './sppPlugin';
import { sppPluginDialogsDefinitions } from './sppPlugin/constants/sppPluginDialogsDefinitions';
import { initialiseTokenPlugin } from './tokenPlugin';
import { tokenPluginDialogsDefinitions } from './tokenPlugin/constants/tokenPluginDialogsDefinitions';

export const initialisePlugins = () => {
    initialiseAdminPlugin();
    initialiseCapitalDistributorPlugin();
    initialiseLockToVotePlugin();
    initialiseMultisigPlugin();
    initialiseSppPlugin();
    initialiseTokenPlugin();
};

export const pluginDialogsDefinitions = {
    ...adminPluginDialogsDefinitions,
    ...capitalDistributorPluginDialogsDefinitions,
    ...lockToVotePluginDialogsDefinitions,
    ...multisigPluginDialogsDefinitions,
    ...sppPluginDialogsDefinitions,
    ...tokenPluginDialogsDefinitions,
};
