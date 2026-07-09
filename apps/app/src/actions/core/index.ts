import { initCreateProposalActionViews } from './createProposal';
import { initExecuteActionViews } from './execute';

export const initCoreActionViews = () => {
    initCreateProposalActionViews();
    initExecuteActionViews();
};
