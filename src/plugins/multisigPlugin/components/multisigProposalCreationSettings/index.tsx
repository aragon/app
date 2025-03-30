import dynamic from 'next/dynamic';

export const MultisigProposalCreationSettings = dynamic(() =>
    import('./multisigProposalCreationSettings').then((mod) => mod.MultisigProposalCreationSettings),
);

export type { IMultisigProposalCreationSettingsProps } from './multisigProposalCreationSettings';
