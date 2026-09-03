import { initialiseAdminPlugin } from './adminPlugin';
import { adminPluginDialogsDefinitions } from './adminPlugin/constants/adminPluginDialogsDefinitions';
import { initialiseCapitalDistributorPlugin } from './capitalDistributorPlugin';
import { capitalDistributorPluginDialogsDefinitions } from './capitalDistributorPlugin/constants/capitalDistributorPluginDialogsDefinitions';
import { initialiseCrossChainControllerPlugin } from './crossChainControllerPlugin';
import { initialiseGaugeVoterPlugin } from './gaugeVoterPlugin';
import { gaugeVoterPluginDialogsDefinitions } from './gaugeVoterPlugin/constants/gaugeVoterPluginDialogsDefinitions';
import { initialiseLockToVotePlugin } from './lockToVotePlugin';
import { lockToVotePluginDialogsDefinitions } from './lockToVotePlugin/constants/lockToVotePluginDialogsDefinitions';
import { initialiseMultisigPlugin } from './multisigPlugin';
import { multisigPluginDialogsDefinitions } from './multisigPlugin/constants/multisigPluginDialogsDefinitions';
import { initialiseSafeMultisigPlugin } from './safeMultisigPlugin';
import { safeMultisigPluginDialogsDefinitions } from './safeMultisigPlugin/constants/safeMultisigPluginDialogsDefinitions';
import { initialiseSppPlugin } from './sppPlugin';
import { sppPluginDialogsDefinitions } from './sppPlugin/constants/sppPluginDialogsDefinitions';
import { initialiseTokenPlugin } from './tokenPlugin';
import { tokenPluginDialogsDefinitions } from './tokenPlugin/constants/tokenPluginDialogsDefinitions';

export const initialisePlugins = () => {
    initialiseMultisigPlugin();
    initialiseTokenPlugin();
    initialiseAdminPlugin();
    initialiseCapitalDistributorPlugin();
    initialiseLockToVotePlugin();
    initialiseSppPlugin();
    initialiseSafeMultisigPlugin();
    initialiseGaugeVoterPlugin();
    initialiseCrossChainControllerPlugin();
};

export const pluginDialogsDefinitions = {
    ...adminPluginDialogsDefinitions,
    ...capitalDistributorPluginDialogsDefinitions,
    ...lockToVotePluginDialogsDefinitions,
    ...multisigPluginDialogsDefinitions,
    ...sppPluginDialogsDefinitions,
    ...safeMultisigPluginDialogsDefinitions,
    ...tokenPluginDialogsDefinitions,
    ...gaugeVoterPluginDialogsDefinitions,
};
