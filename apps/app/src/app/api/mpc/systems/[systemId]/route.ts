import {
    handleDeleteSystem,
    handleGetSystem,
    handleUpdateSystem,
} from '@/modules/mpc/server';

export const GET = handleGetSystem;
export const PATCH = handleUpdateSystem;
export const DELETE = handleDeleteSystem;
