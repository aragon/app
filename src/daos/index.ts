import { initialiseAragonDemo } from './aragonDemo';
import { initialiseAragonDemoPolicies } from './aragonDemoPolicies';
import { initialiseBoundless } from './boundless';
import { initialiseCryptex } from './cryptex';
import { cryptexRewardsDialogsDefinitions } from './cryptex/rewards';
import { initialiseKatana } from './katana';
import { katanaRewardsDialogsDefinitions } from './katana/rewards';
import { initialiseXmaquina } from './xmaquina';

export const capitalDistributorDialogsDefinitions = {
    ...katanaRewardsDialogsDefinitions,
    ...cryptexRewardsDialogsDefinitions,
};

export const initialiseDaos = () => {
    initialiseAragonDemo();
    initialiseBoundless();
    initialiseCryptex();
    initialiseXmaquina();
    initialiseAragonDemoPolicies();
    initialiseKatana();
};
