import dynamic from 'next/dynamic';

export const SppUpdatePluginMetadataAction = dynamic(() =>
    import('./sppUpdateMetadataAction').then((mod) => mod.SppUpdatePluginMetadataAction),
);

export type { ISppUpdatePluginMetadataActionProps } from './sppUpdateMetadataAction';
