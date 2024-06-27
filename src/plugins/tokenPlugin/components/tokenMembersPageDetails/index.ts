import dynamic from 'next/dynamic';

export const TokenMembersPageDetails = dynamic(() =>
    import('./tokenMembersPageDetails').then((mod) => mod.TokenMembersPageDetails),
);
export type { ITokenMembersPageDetailsProps } from './tokenMembersPageDetails';
