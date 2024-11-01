import dynamic from 'next/dynamic';

export const AddMembersAction = dynamic(() => import('./addMembersAction').then((mod) => mod.AddMembersAction));

export type { IAddMembersActionProps } from './addMembersAction';
