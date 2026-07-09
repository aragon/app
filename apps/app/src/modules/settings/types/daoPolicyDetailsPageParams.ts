import type { IDaoPageParams } from '@/shared/types';

export interface IDaoPolicyDetailsPageParams extends IDaoPageParams {
    /**
     * Policy address (id).
     */
    id: string;
}
