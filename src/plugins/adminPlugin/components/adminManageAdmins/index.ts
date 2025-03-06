import dynamic from 'next/dynamic';

export const AdminManageAdmins = dynamic(() => import('./adminManageAdmins').then((mod) => mod.AdminMangeAdmins));

export type { IAdminMangeAdminsProps } from './adminManageAdmins';
