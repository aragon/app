import type { IDao } from '@/shared/api/daoService';
import type { IDateDuration } from '@/shared/utils/dateUtils';
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
     * Voting period of the plugin stage, only set when setting up advanced governance processes. The parameter is also
     * used to properly set the executor target configuration for the plugin:
     * - Target is global executor when plugin is setup as an advanced governance process (stageVotingPeriod is defined)
     * - Target is DAO address when plugin is setup as a simple governance process (stageVotingPeriod is not defined)
     */
    stageVotingPeriod?: IDateDuration;
}
