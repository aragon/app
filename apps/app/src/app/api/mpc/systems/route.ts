import { handleCreateSystem, handleListSystems } from '@/modules/mpc/server';

export const GET = handleListSystems;
export const POST = handleCreateSystem;
