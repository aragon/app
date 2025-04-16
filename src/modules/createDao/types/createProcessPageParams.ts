import type { IDaoPageParams } from '../../../shared/types';

export interface ICreateProcessPageParams extends IDaoPageParams {
    /**
     * Plugin address used to create a proposal for adding a new process.
     */
    pluginAddress: string;
}
