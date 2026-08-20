import {
    handleCreateWorkspacePolicy,
    handleListWorkspacePolicies,
} from '@/modules/mpc/server';

export const GET = handleListWorkspacePolicies;
export const POST = handleCreateWorkspacePolicy;
