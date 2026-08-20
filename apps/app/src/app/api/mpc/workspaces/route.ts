import {
    handleCreateWorkspace,
    handleListWorkspaces,
} from '@/modules/mpc/server';

export const GET = handleListWorkspaces;
export const POST = handleCreateWorkspace;
