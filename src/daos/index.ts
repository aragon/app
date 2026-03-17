import { initialiseAragonDemo } from './aragonDemo';
import { initialiseAragonDemoPolicies } from './aragonDemoPolicies';
import { initialiseBoundless } from './boundless';
import { initialiseCapitalDistributorTest } from './capitalDistributorTest';
import { initialiseCryptex } from './cryptex';
import { initialiseKatanaCDDemo } from './katanaCDDemo';
import { initialiseKatanaEmissionsTest } from './katanaEmissionsTest';
import { initialiseKatanaVKatManagement } from './katanaVKatManagement';
import { initialiseXmaquina } from './xmaquina';

export const initialiseDaos = () => {
    initialiseAragonDemo();
    initialiseBoundless();
    initialiseCryptex();
    initialiseXmaquina();
    initialiseAragonDemoPolicies();
    initialiseCapitalDistributorTest();
    initialiseKatanaCDDemo();
    initialiseKatanaEmissionsTest();
    initialiseKatanaVKatManagement();
};
