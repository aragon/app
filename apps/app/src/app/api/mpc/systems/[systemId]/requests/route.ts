import { handleCreateRequest, handleListRequests } from '@/modules/mpc/server';

export const GET = handleListRequests;
export const POST = handleCreateRequest;
