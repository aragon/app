import { initialiseAragonDemo } from './aragonDemo';
import { initialiseAragonDemoPolicies } from './aragonDemoPolicies';
import { initialiseBoundless } from './boundless';
import { initialiseCapitalDistributorTest } from './capitalDistributorTest';
import { initialiseKatanaCDDemo } from './katanaCDDemo';
import { initialiseKatanaEmissionsTest } from './katanaEmissionsTest';
import { initialiseXmaquina } from './xmaquina';

export const initialiseDaos = () => {
    initialiseAragonDemo();
    initialiseBoundless();
    initialiseXmaquina();
    initialiseAragonDemoPolicies();
    initialiseCapitalDistributorTest();
    initialiseKatanaCDDemo();
    initialiseKatanaEmissionsTest();
};
