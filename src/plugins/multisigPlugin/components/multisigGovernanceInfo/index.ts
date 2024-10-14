import dynamic from 'next/dynamic';

export const MultisigGovernanceInfo = dynamic(() =>
    import('./multisigGovernanceInfo').then((mod) => mod.MultisigGovernanceInfo),
);
export type { IMultisigGovernanceInfoProps } from './multisigGovernanceInfo';
