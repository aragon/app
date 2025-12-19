import dynamic from 'next/dynamic';

export const GaugeVoterVoteDialog = dynamic(() =>
    import('./gaugeVoterVoteDialog').then((mod) => mod.GaugeVoterVoteDialog),
);

export type {
    IGaugeVoterVoteDialogParams,
    IGaugeVoterVoteDialogProps,
} from './gaugeVoterVoteDialog';
