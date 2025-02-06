import {
    type ICreateProcessFormBody,
    type ICreateProcessFormProposalCreationBody,
    type ICreateProcessFormStage,
} from '@/modules/createDao/components/createProcessForm';
import { type Hex } from 'viem';

export interface IBuildPrepareInstallDataParams<TStage extends ICreateProcessFormStage = ICreateProcessFormStage> {
    body: ICreateProcessFormBody;
    metadataCid: string;
    daoAddress: Hex;
    permissionSettings?: ICreateProcessFormProposalCreationBody;
    stage: TStage;
}
