import dynamic from 'next/dynamic';

export const ManageAdminsDialog = dynamic(() => import('./manageAdminsDialog').then((mod) => mod.ManageAdminsDialog));
export type { IManageAdminsDialogProps, IManageAdminsFormData } from './manageAdminsDialog';
