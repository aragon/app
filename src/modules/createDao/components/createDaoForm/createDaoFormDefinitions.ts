import type { Network } from '@/shared/api/daoService';
import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
import type { IInputFileAvatarValue } from '@aragon/gov-ui-kit';

export interface ICreateDaoFormMetadataData {
    /**
     * Name of the DAO.
     */
    name: string;
    /**
     * ENS subdomain of the DAO. Empty string if not set.
     */
    ens: string;
    /**
     * Avatar of the DAO.
     */
    avatar?: IInputFileAvatarValue;
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
}
