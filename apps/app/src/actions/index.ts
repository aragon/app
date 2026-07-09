import { initCapitalDistributorActionViews } from './capitalDistributor';
import { capitalDistributorDialogsDefinitions } from './capitalDistributor/constants/capitalDistributorDialogsDefinitions';
import { initCoreActionViews } from './core';
import { initGaugeRegistrarActionViews } from './gaugeRegistrar';
import { gaugeRegistrarDialogsDefinitions } from './gaugeRegistrar/constants/gaugeRegistrarDialogsDefinitions';
import { initGaugeVoterActionViews } from './gaugeVoter';
import { gaugeVoterDialogsDefinitions } from './gaugeVoter/constants/gaugeVoterDialogsDefinitions';

export const initActionViewRegistry = () => {
    initCoreActionViews();
    initGaugeRegistrarActionViews();
    initGaugeVoterActionViews();
    initCapitalDistributorActionViews();
};

export const actionsDialogsDefinitions = {
    ...gaugeRegistrarDialogsDefinitions,
    ...gaugeVoterDialogsDefinitions,
    ...capitalDistributorDialogsDefinitions,
};
