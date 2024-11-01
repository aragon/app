import dynamic from 'next/dynamic';

export const RemoveMembersDialog = dynamic(() => import('./removeMemberDialog').then((mod) => mod.RemoveMembersDialog));

export type { IRemoveMemberDialogParams, IRemoveMemberDialogProps } from './removeMemberDialog';
