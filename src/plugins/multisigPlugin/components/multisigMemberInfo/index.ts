import dynamic from 'next/dynamic';

export const MultisigMemberInfo = dynamic(() => import('./multisigMemberInfo').then((mod) => mod.MultisigMemberInfo));
export type { IMultisigMemberInfoProps } from './multisigMemberInfo';
