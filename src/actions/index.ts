import { initGaugeRegistrarActionViews } from './gaugeRegistrar';
import { gaugeRegistrarDialogsDefinitions } from './gaugeRegistrar/constants/gaugeRegistrarDialogsDefinitions';

export const initActionViewRegistry = () => {
    initGaugeRegistrarActionViews();
};

export const actionsDialogsDefinitions = {
    ...gaugeRegistrarDialogsDefinitions,
};
