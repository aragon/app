import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import type { TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { type Hex } from 'viem';
import { GovernanceSlotId } from '../../../governance/constants/moduleSlots';
import type { IBuildCreateProposalDataParams } from '../../../governance/types';
import { type ICreateProcessFormData } from '../../components/createProcessForm';
import { type IPluginSetupData } from '../prepareProcessDialog/prepareProcessDialogUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';

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
    prepareProposalMetadata = () => {
        const title = 'Apply plugin installation';
        const summary = 'This proposal applies the plugin installation to create the new process';

        return { title, summary };
    };

    buildTransaction = (params: IBuildTransactionParams) => {
        const { values, dao, setupData, plugin, metadataCid } = params;

        const proposalMetadata = transactionUtils.cidToHex(metadataCid);

        const buildDataFunction = pluginRegistryUtils.getSlotFunction<IBuildCreateProposalDataParams, Hex>({
            pluginId: plugin.subdomain,
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
        })!;

        const proposalActions = pluginTransactionUtils.buildInstallActions(values, setupData, dao.address as Hex);

        const buildDataParams: IBuildCreateProposalDataParams = {
            actions: proposalActions,
            metadata: proposalMetadata,
            values: {} as IBuildCreateProposalDataParams['values'],
        };

        const transactionData = buildDataFunction(buildDataParams);

        const transaction: TransactionDialogPrepareReturn = {
            to: plugin.address as Hex,
            data: transactionData,
        };

        return Promise.resolve(transaction);
    };
}

export const publishProcessDialogUtils = new PublishProcessDialogUtils();
