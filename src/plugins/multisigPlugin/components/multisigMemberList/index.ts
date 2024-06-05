import dynamic from 'next/dynamic';

export const MultisigMemberList = dynamic(() => import('./multisigMemberList').then((mod) => mod.MultisigMemberList));
export { type IMultisigMemberListProps } from './multisigMemberList';
