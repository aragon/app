import dynamic from 'next/dynamic';

export const TokenUpdatePluginMetadataAction = dynamic(() =>
    import('./tokenUpdateMetadataAction').then((mod) => mod.TokenUpdatePluginMetadataAction),
);

export type { ITokenUpdatePluginMetadataActionProps } from './tokenUpdateMetadataAction';
