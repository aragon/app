import dynamic from 'next/dynamic';

export const MultisigUpdateSettingsAction = dynamic(() =>
    import('./multisigUpdateSettingsAction').then((mod) => mod.MultisigUpdateSettingsAction),
);

export type { IMultisigUpdateSettingsActionProps } from './multisigUpdateSettingsAction';
