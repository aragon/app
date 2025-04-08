import { sppTransactionUtils } from '@/plugins/sppPlugin/utils/sppTransactionUtils';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { pluginTransactionUtils, type IPluginSetupData } from '@/shared/utils/pluginTransactionUtils';
import { transactionUtils, type ITransactionRequest } from '@/shared/utils/transactionUtils';
import { type Hex } from 'viem';
import { GovernanceSlotId } from '../../../governance/constants/moduleSlots';
import type { IBuildCreateProposalDataParams } from '../../../governance/types';
import { type ICreateProcessFormData } from '../../components/createProcessForm';

export interface IBuildTransactionParams {
    /**
     * Create-process form values.
     */
    values: ICreateProcessFormData;
    /**
     * DAO to install the plugins for.
     */
    dao: IDao;
    /**
     * Plugin used a target for creating the proposal.
     */
    plugin: IDaoPlugin;
    /**
     * Address list of the plugins to be installed.
     */
    setupData: IPluginSetupData[];
    /**
     * CID of the proposal metadata pinned on IPFS.
     */
    metadataCid: string;
}

class PublishProcessDialogUtils {
    private proposalMetadata = {
        title: 'Apply plugin installation',
        summary: 'This proposal applies the plugin installation to create the new process',
    };

    prepareProposalMetadata = () => this.proposalMetadata;

    buildTransaction = (params: IBuildTransactionParams): Promise<ITransactionRequest> => {
        const { values, dao, setupData, plugin, metadataCid } = params;

        const proposalMetadata = transactionUtils.cidToHex(metadataCid);
        const isAdvancedGovernance = values.governanceType === 'ADVANCED';

        const buildDataFunction = pluginRegistryUtils.getSlotFunction<IBuildCreateProposalDataParams, Hex>({
            pluginId: plugin.subdomain,
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
        })!;

        const processorSetupActions = isAdvancedGovernance
            ? sppTransactionUtils.buildPluginsSetupActions(values, setupData, dao)
            : [];

        const buildActionsParams = { dao, setupData, actions: processorSetupActions };
        const proposalActions = pluginTransactionUtils.buildApplyPluginsInstallationActions(buildActionsParams);

        const transactionData = buildDataFunction({
            actions: proposalActions,
            metadata: proposalMetadata,
            values: {} as IBuildCreateProposalDataParams['values'],
        });

        const transaction = { to: plugin.address as Hex, data: transactionData, value: BigInt(0) };

        return Promise.resolve(transaction);
    };
}

export const publishProcessDialogUtils = new PublishProcessDialogUtils();
