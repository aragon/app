import { initialiseAragonDemo } from './aragonDemo';
import { initialiseAragonDemoPolicies } from './aragonDemoPolicies';
import { initialiseBoundless } from './boundless';
import { initialiseCapitalDistributorTest } from './capitalDistributorTest';
import { initialiseXmaquina } from './xmaquina';

export const initialiseDaos = () => {
    initialiseAragonDemo();
    initialiseBoundless();
    initialiseXmaquina();
    initialiseAragonDemoPolicies();
    initialiseCapitalDistributorTest();
};
