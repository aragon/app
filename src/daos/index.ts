import { initialiseAragonDemo } from './aragonDemo';
import { initialiseAragonDemoPolicies } from './aragonDemoPolicies';
import { initialiseBoundless } from './boundless';
import { initialiseCryptex } from './cryptex';
import { initialiseKatana } from './katana';
import { initialiseKatanaVKatManagement } from './katana/katanaVKatManagement';
import { initialiseXmaquina } from './xmaquina';

export const initialiseDaos = () => {
    initialiseAragonDemo();
    initialiseBoundless();
    initialiseCryptex();
    initialiseXmaquina();
    initialiseAragonDemoPolicies();
    initialiseKatana();
    initialiseKatanaVKatManagement();
};
