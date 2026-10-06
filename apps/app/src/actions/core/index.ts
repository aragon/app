import { initCreateProposalActionViews } from './createProposal';
import { initExecuteActionViews } from './execute';
import { initPermissionManagerActionViews } from './permissionManager';
import { initWithdrawTokenActionViews } from './withdrawToken';

export const initCoreActionViews = () => {
    initCreateProposalActionViews();
    initExecuteActionViews();
    initPermissionManagerActionViews();
    initWithdrawTokenActionViews();
};
