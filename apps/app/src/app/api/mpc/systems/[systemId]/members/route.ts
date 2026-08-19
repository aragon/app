import { handleAddMember, handleListMembers } from '@/modules/mpc/server';

export const GET = handleListMembers;
export const POST = handleAddMember;
