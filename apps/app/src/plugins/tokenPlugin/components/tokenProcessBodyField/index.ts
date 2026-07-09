import dynamic from 'next/dynamic';

export const TokenProcessBodyField = dynamic(() =>
    import('./tokenProcessBodyField').then((mod) => mod.TokenProcessBodyField),
);

export type { ITokenProcessBodyFieldProps } from './tokenProcessBodyField';
