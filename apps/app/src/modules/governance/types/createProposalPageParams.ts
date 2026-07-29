import type { IDaoPageParams } from '@/shared/types';

export interface ICreateProposalPageParams extends IDaoPageParams {
    /**
     * Address of the plugin to create the proposal for.
     */
    pluginAddress: string;
}
