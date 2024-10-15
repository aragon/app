import dynamic from 'next/dynamic';

export const AdminMemberInfo = dynamic(() => import('./adminMemberInfo').then((mod) => mod.AdminMemberInfo));
export type { IAdminMemberInfoProps } from './adminMemberInfo';
