import dynamic from 'next/dynamic';

export const TokenMemberInfo = dynamic(() => import('./tokenMemberInfo').then((mod) => mod.TokenMemberInfo));
export type { ITokenMemberInfoProps } from './tokenMemberInfo';
