import dynamic from 'next/dynamic';

export const MultisigProcessBodyField = dynamic(() =>
    import('./multisigProcessBodyField').then((mod) => mod.MultisigProcessBodyField),
);

export type { IMultisigProcessBodyFieldProps, IMultisigProcessBody } from './multisigProcessBodyField';
