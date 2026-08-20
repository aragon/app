import {
    handleDeleteWorkspacePolicy,
    handleGetWorkspacePolicy,
    handleUpdateWorkspacePolicy,
} from '@/modules/mpc/server';

export const GET = handleGetWorkspacePolicy;
export const PUT = handleUpdateWorkspacePolicy;
export const DELETE = handleDeleteWorkspacePolicy;
