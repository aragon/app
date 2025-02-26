import dynamic from 'next/dynamic';

export const TokenMemberPanel = dynamic(() => import('./tokenMemberPanel').then((mod) => mod.TokenMemberPanel));
export type { ITokenMemberPanelProps } from './tokenMemberPanel';
