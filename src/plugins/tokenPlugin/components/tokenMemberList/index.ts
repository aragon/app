import dynamic from 'next/dynamic';

export const TokenMemberList = dynamic(() => import('./tokenMemberList').then((mod) => mod.TokenMemberList));
export { type ITokenMemberListProps } from './tokenMemberList';
