import {
    type ICreateProcessFormBody,
    type ICreateProcessFormProposalCreationBody,
    type ICreateProcessFormStage,
} from '@/modules/createDao/components/createProcessForm';
import { type Hex } from 'viem';

export interface IBuildPrepareInstallDataParams<TStage extends ICreateProcessFormStage = ICreateProcessFormStage> {
    /**
     * The required form data for a body to be installed with a process.
     */
    body: ICreateProcessFormBody;
    /**
     * The metadata CID of the process.
     */
    metadataCid: string;
    /**
     * The DAO address to install the process to.
     */
    daoAddress: Hex;
    /**
     * The permission settings for creating proposals.
     */
    permissionSettings?: ICreateProcessFormProposalCreationBody;
    /**
     * The required form data for a stage to be installed with a process.
     */
    stage: TStage;
}
