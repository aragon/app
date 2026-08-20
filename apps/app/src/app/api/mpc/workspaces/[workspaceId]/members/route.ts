import {
    handleAddWorkspaceMember,
    handleListWorkspaceMembers,
} from '@/modules/mpc/server';

export const GET = handleListWorkspaceMembers;
export const POST = handleAddWorkspaceMember;
