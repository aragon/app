import { type IDaoPageParams } from '@/shared/types';

export interface IDaoProcessPageParams extends IDaoPageParams {
    /**
     * Slug of the process.
     */
    slug: string;
}
