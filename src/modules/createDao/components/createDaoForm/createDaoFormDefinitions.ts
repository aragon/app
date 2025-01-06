import type { Network } from '@/shared/api/daoService';
import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';

export interface ICreateDaoFormMetadataData {
    /**
     * Name of the DAO.
     */
    name: string;
    /**
     * Logo of the DAO.
     */
    logo?: File;
    /**
     * Description of the DAO.
     */
    description: string;
    /**
     * Resources of the DAO.
     */
    resources: IResourcesInputResource[];
}

export interface ICreateDaoFormData extends ICreateDaoFormMetadataData {
    /**
     * Network to deploy the DAO.
     */
    network: Network;
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
