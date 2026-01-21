import { initialiseAragonDemo } from './aragonDemo';
import { initialiseBoundless } from './boundless';
import { initialiseXmaquina } from './xmaquina';
import { initialiseAragonDemoPolicies } from './aragonDemoPolicies';

export const initialiseDaos = () => {
    initialiseAragonDemo();
    initialiseBoundless();
    initialiseXmaquina();
    initialiseAragonDemoPolicies();
};
