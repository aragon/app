import { initialiseMultisigPlugin } from './multisigPlugin';
import { initialiseTokenPlugin } from './tokenPlugin';

export const initialisePlugins = () => {
    initialiseMultisigPlugin();
    initialiseTokenPlugin();
};
