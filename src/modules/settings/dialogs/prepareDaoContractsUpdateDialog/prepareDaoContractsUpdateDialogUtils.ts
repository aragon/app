import type { IProposal } from '@/modules/governance/api/governanceService';
import type { IProposalCreate } from '@/modules/governance/dialogs/publishProposalDialog';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type { IPluginInfo } from '@/shared/types';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { transactionUtils, type ITransactionRequest } from '@/shared/utils/transactionUtils';
import { versionComparatorUtils } from '@/shared/utils/versionComparatorUtils';
import { encodeFunctionData, type Hex } from 'viem';
import { pluginSetupProcessorAbi } from './pluginSetupProcessorAbi';

export interface IBuildPrepareUpdatePluginTransactionsParams {
    /**
     * The DAO to update the plugins for.
     */
    dao: IDao;
    /**
     * The plugins to be updated.
     */
    plugins: IDaoPlugin[];
}

class PrepareDaoContractsUpdateDialogUtils {
    buildPrepareUpdatePluginsTransaction = (dao: IDao, plugins: IDaoPlugin[]): Promise<ITransactionRequest> => {
        const pluginUpdateData = plugins.map((plugin) => this.buildPrepareUpdateTransaction(dao, plugin));
        const { pluginSetupProcessor } = networkDefinitions[dao.network].addresses;

        const transactionParams = { to: pluginSetupProcessor, value: BigInt(0) };
        const pluginUpdateTransactions = pluginUpdateData.map((data) => ({ ...transactionParams, data }));
        const transaction = transactionUtils.encodeTransactionRequests(pluginUpdateTransactions, dao.network);

        return Promise.resolve(transaction);
    };

    getApplyUpdateProposal = (): IProposalCreate => {
        const actions = this.buildApplyUpdateTransactions();
        const metadata = this.buildApplyUpdateMetadata();

        return { ...metadata, actions, resources: [] };
    };

    private buildPrepareUpdateTransaction = (dao: IDao, plugin: IDaoPlugin) => {
        const pluginInfo = pluginRegistryUtils.getPlugin(plugin.subdomain) as IPluginInfo;

        const currentVersionTag = versionComparatorUtils.normaliseComparatorInput(plugin)!;
        const { installVersion: newVersionTag } = pluginInfo;
        const pluginSetupRepo = pluginInfo.repositoryAddresses[dao.network];
        const setupPayload = this.buildPluginSetupPayload(plugin);

        const data = encodeFunctionData({
            abi: pluginSetupProcessorAbi,
            functionName: 'prepareUpdate',
            args: [dao.address as Hex, { currentVersionTag, newVersionTag, pluginSetupRepo, setupPayload }],
        });

        return data;
    };

    private buildPluginSetupPayload = (plugin: IDaoPlugin) => {
        const { address, preparedSetupData } = plugin;

        const currentHelpers = preparedSetupData.helpers as Hex[];
        const initializeData = '0x' as Hex;

        return { plugin: address as Hex, currentHelpers, data: initializeData };
    };

    private buildApplyUpdateTransactions = (): ITransactionRequest[] => {
        return [{ data: '0x' as Hex, to: '0x01' as Hex, value: BigInt(0) }];
    };

    private buildApplyUpdateMetadata = (): Pick<IProposal, 'title' | 'summary' | 'description'> => {
        return { title: '', summary: '', description: '' };
    };
}

export const prepareDaoContractsUpdateDialogUtils = new PrepareDaoContractsUpdateDialogUtils();
