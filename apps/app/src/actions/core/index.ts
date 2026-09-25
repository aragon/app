import { initCreateProposalActionViews } from './createProposal';
import { initExecuteActionViews } from './execute';
import { initPermissionManagerActionViews } from './permissionManager';

export const initCoreActionViews = () => {
    initCreateProposalActionViews();
    initExecuteActionViews();
    initPermissionManagerActionViews();
};
