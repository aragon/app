import type { ICreateProcessFormStage } from '@/modules/createDao/components/createProcessForm';
import type { IDao } from '@/shared/api/daoService';
import type { ICompositeAddress } from '@aragon/gov-ui-kit';
import type { ISetupBodyForm, ISetupBodyFormMembership } from '../dialogs/setupBodyDialog';

export interface IBuildPreparePluginInstallDataParams<
    TGovernance = unknown,
    TMember extends ICompositeAddress = ICompositeAddress,
    TMembership extends ISetupBodyFormMembership<TMember> = ISetupBodyFormMembership<TMember>,
> {
    /**
     * The required form data for a body to be installed with a process.
     */
    body: ISetupBodyForm<TGovernance, TMember, TMembership>;
    /**
     * The metadata CID of the process.
     */
    metadataCid: string;
    /**
     * The DAO to install the process to.
     */
    dao: IDao;
    /**
     * The required form data for a stage to be installed with a process.
     */
    stage: ICreateProcessFormStage;
}
