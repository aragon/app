import { Network } from '@/shared/api/daoService';
import { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';

export interface ICreateDaoFormData {
    /**
     * Name of the DAO.
     */
    name: string;
    /**
     * Description of the DAO.
     */
    description: string;
    /**
     * Network to deploy the DAO.
     */
    network: Network;
    /**
     * Resources of the DAO.
     */
    resources: IResourcesInputResource[];
    /**
     * Factory address to use for creating the DAO. This field is used for the initial create-dao process implementation
     * and will be removed soon.
     */
    factoryAddress: string;
    /**
     * Repository address of the admin plugin to be used. This field is used for the initial create-dao process
     * implementation and will be removed soon.
     */
    adminPluginRepo: string;
}
