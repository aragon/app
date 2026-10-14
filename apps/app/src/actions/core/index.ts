import { initCreateProposalActionViews } from './createProposal';
import { initExecuteActionViews } from './execute';
import { initPermissionManagerActionViews } from './permissionManager';
import { initUpdateMetadataActionViews } from './updateMetadata';
import { initWithdrawTokenActionViews } from './withdrawToken';

export const initCoreActionViews = () => {
    initCreateProposalActionViews();
    initExecuteActionViews();
    initPermissionManagerActionViews();
    initUpdateMetadataActionViews();
    initWithdrawTokenActionViews();
};
