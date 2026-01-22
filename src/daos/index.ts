import { initialiseAragonDemo } from './aragonDemo';
import { initialiseAragonDemoPolicies } from './aragonDemoPolicies';
import { initialiseBoundless } from './boundless';
import { initialiseXmaquina } from './xmaquina';

export const initialiseDaos = () => {
    initialiseAragonDemo();
    initialiseBoundless();
    initialiseXmaquina();
    initialiseAragonDemoPolicies();
};
