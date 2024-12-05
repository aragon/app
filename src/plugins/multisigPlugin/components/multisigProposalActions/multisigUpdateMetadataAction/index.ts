import dynamic from 'next/dynamic';

export const MultisigUpdatePluginMetadataAction = dynamic(() =>
    import('./multisigUpdateMetadataAction').then((mod) => mod.MultisigUpdatePluginMetadataAction),
);

export type { IMultisigUpdatePluginMetadataActionProps } from './multisigUpdateMetadataAction';
