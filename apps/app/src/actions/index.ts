import { initCapitalDistributorActionViews } from './capitalDistributor';
import { capitalDistributorDialogsDefinitions } from './capitalDistributor/constants/capitalDistributorDialogsDefinitions';
import { initCoreActionViews } from './core';
import { initCrossChainControllerActionViews } from './crossChainController';
import { initGaugeRegistrarActionViews } from './gaugeRegistrar';
import { gaugeRegistrarDialogsDefinitions } from './gaugeRegistrar/constants/gaugeRegistrarDialogsDefinitions';
import { initGaugeVoterActionViews } from './gaugeVoter';
import { gaugeVoterDialogsDefinitions } from './gaugeVoter/constants/gaugeVoterDialogsDefinitions';
import { initTokenActionViews } from './token';

export const initActionViewRegistry = () => {
    initCoreActionViews();
    initCrossChainControllerActionViews();
    initGaugeRegistrarActionViews();
    initGaugeVoterActionViews();
    initCapitalDistributorActionViews();
    initTokenActionViews();
};

export const actionsDialogsDefinitions = {
    ...gaugeRegistrarDialogsDefinitions,
    ...gaugeVoterDialogsDefinitions,
    ...capitalDistributorDialogsDefinitions,
};
