import dynamic from 'next/dynamic';

export const RemoveMembersAction = dynamic(() =>
    import('./removeMembersAction').then((mod) => mod.RemoveMembersAction),
);

export type { IRemoveMembersActionProps } from './removeMembersAction';
