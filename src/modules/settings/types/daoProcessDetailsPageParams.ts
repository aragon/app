import { type IDaoPageParams } from '@/shared/types';

export interface IDaoProcessDetailsPageParams extends IDaoPageParams {
    /**
     * Slug of the process.
     */
    slug: string;
}
