import { initialiseMultisigPlugin } from './multisigPlugin';
import { initialiseSppPlugin } from './sppPlugin';
import { initialiseTokenPlugin } from './tokenPlugin';

export const initialisePlugins = () => {
    initialiseMultisigPlugin();
    initialiseTokenPlugin();
    initialiseSppPlugin();
};
