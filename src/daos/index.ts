import { initialiseAragonDemo } from './aragonDemo';
import { initialiseAragonDemoPolicies } from './aragonDemoPolicies';
import { initialiseBoundless } from './boundless';
import { initialiseCapitalDistributorTest } from './capitalDistributorTest';
import { gaugeRewardDialogsDefinitions } from './capitalDistributorTest/constants/capitalDistributorTestDialogsDefinitions';
import { initialiseCryptex } from './cryptex';
import { tokenRewardDialogsDefinitions } from './cryptex/constants/cryptexDialogsDefinitions';
import { initialiseKatanaCDDemo } from './katanaCDDemo';
import { initialiseKatanaEmissionsTest } from './katanaEmissionsTest';
import { initialiseXmaquina } from './xmaquina';

export const capitalDistributorDialogsDefinitions = {
    ...gaugeRewardDialogsDefinitions,
    ...tokenRewardDialogsDefinitions,
};

export const initialiseDaos = () => {
    initialiseAragonDemo();
    initialiseBoundless();
    initialiseCryptex();
    initialiseXmaquina();
    initialiseAragonDemoPolicies();
    initialiseCapitalDistributorTest();
    initialiseKatanaCDDemo();
    initialiseKatanaEmissionsTest();
};
