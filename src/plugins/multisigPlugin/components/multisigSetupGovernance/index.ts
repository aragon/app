import dynamic from 'next/dynamic';

export const MultisigSetupGovernance = dynamic(() =>
    import('./multisigSetupGovernance').then((mod) => mod.MultisigSetupGovernance),
);

export type { IMultisigSetupGovernanceForm, IMultisigSetupGovernanceProps } from './multisigSetupGovernance.api';
