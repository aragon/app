import dynamic from 'next/dynamic';

export const UserDialog = dynamic(() => import('./userDialog').then((mod) => mod.UserDialog));
export type { IUserDialogProps } from './userDialog';
