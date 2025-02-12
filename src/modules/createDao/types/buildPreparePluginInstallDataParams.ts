import {
    type ICreateProcessFormBody,
    type ICreateProcessFormProposalCreationBody,
    type ICreateProcessFormStage,
} from '@/modules/createDao/components/createProcessForm';
import type { IDao } from '@/shared/api/daoService';

export interface IBuildPreparePluginInstallDataParams {
    /**
     * The required form data for a body to be installed with a process.
     */
    body: ICreateProcessFormBody;
    /**
     * The metadata CID of the process.
     */
    metadataCid: string;
    /**
     * The DAO to install the process to.
     */
    dao: IDao;
    /**
     * The permission settings for creating proposals.
     */
    permissionSettings?: ICreateProcessFormProposalCreationBody;
    /**
     * The required form data for a stage to be installed with a process.
     */
    stage: ICreateProcessFormStage;
}
