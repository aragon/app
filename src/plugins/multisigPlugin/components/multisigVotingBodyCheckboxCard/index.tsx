import dynamic from 'next/dynamic';

export const MultisigVotingBodyCheckboxCard = dynamic(() =>
    import('./multisigVotingBodyCheckboxCard').then((mod) => mod.MultisigVotingBodyCheckboxCard),
);

export type {
    IMultisigCreateProcessFormBody,
    IMultisigVotingBodyCheckboxCardProps,
} from './multisigVotingBodyCheckboxCard.api';
