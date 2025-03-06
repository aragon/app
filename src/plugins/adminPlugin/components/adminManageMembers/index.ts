import dynamic from 'next/dynamic';

export const AdminManageMembers = dynamic(() => import('./adminManageMembers').then((mod) => mod.AdminMangeMembers));

export type { IAdminMangeMembersProps } from './adminManageMembers';
