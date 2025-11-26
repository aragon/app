import { initialiseAragonDemo } from './aragonDemo';
import { initialiseBoundless } from './boundless';
import { initialiseXmaquina } from './xmaquina';

export const initialiseDaos = () => {
    initialiseAragonDemo();
    initialiseBoundless();
    initialiseXmaquina();
};
