import dynamic from 'next/dynamic';

export const GaugeVoterVoteTransactionDialog = dynamic(() =>
    import('./gaugeVoterVoteTransactionDialog').then((mod) => mod.GaugeVoterVoteTransactionDialog)
);

export type {
    IGaugeVoterVoteTransactionDialogParams,
    IGaugeVoterVoteTransactionDialogProps,
} from './gaugeVoterVoteTransactionDialog';
export type { IGaugeVote } from './gaugeVoterVoteTransactionDialogUtils.api';
