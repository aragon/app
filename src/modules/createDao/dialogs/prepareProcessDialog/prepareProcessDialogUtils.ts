import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { sppTransactionUtils } from '@/plugins/sppPlugin/utils/sppTransactionUtils';
import type { IDao } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { type Hex } from 'viem';
import type { ICreateProcessFormData } from '../../components/createProcessForm';
import type { IBuildPreparePluginInstallDataParams } from '../../types';
import type {
    IBuildPrepareInstallPluginActionParams,
    IBuildPrepareInstallPluginsActionParams,
    IBuildTransactionParams,
} from './prepareProcessDialogUtils.api';

class PrepareProcessDialogUtils {
    preparePluginMetadata = (plugin: ICreateProcessFormData['bodies'][number]) => {
        const { name, description, resources: links } = plugin;

        return { name, description, links };
    };

    prepareProcessorMetadata = (values: ICreateProcessFormData) => {
        const { name, description, resources: links, processKey } = values;
        const stageNames = values.stages.map((stage) => stage.name);

        return { name, description, links, processKey, stageNames };
    };

    buildTransaction = (params: IBuildTransactionParams) => {
        const { values, processMetadata, dao } = params;

        const { processor: processorMetadata, plugins: pluginsMetadata } = processMetadata;
        const { pluginSetupProcessor } = networkDefinitions[dao.network].addresses;

        const processorInstallAction =
            processorMetadata != null ? this.buildPrepareInstallProcessorActionData(processorMetadata, dao) : undefined;
        const pluginInstallActions = this.buildPrepareInstallPluginsActionData({ values, dao, pluginsMetadata });

        const installActionsData =
            processorInstallAction != null ? [processorInstallAction, ...pluginInstallActions] : pluginInstallActions;

        const installActionTransactions = installActionsData.map((data) => ({
            to: pluginSetupProcessor,
            data,
            value: BigInt(0),
        }));
        const encodedTransaction = transactionUtils.encodeTransactionRequests(installActionTransactions, dao.network);

        return Promise.resolve(encodedTransaction);
    };

    private buildPrepareInstallProcessorActionData = (metadata: string, dao: IDao) => {
        const processorMetadata = transactionUtils.cidToHex(metadata);
        const processorInstallData = sppTransactionUtils.buildPreparePluginInstallData(processorMetadata, dao);

        return processorInstallData;
    };

    private buildPrepareInstallPluginsActionData = (params: IBuildPrepareInstallPluginsActionParams) => {
        const { values, pluginsMetadata, dao } = params;
        const { bodies, stages } = values;

        const installActionsData = bodies.map((body, index) => {
            const stage = stages.find(({ internalId }) => internalId === body.stageId);
            const { votingPeriod: stageVotingPeriod } = stage?.timing ?? {};
            const metadataCid = pluginsMetadata[index];

            return this.buildPrepareInstallPluginActionData({ body, dao, metadataCid, stageVotingPeriod });
        });

        return installActionsData;
    };

    private buildPrepareInstallPluginActionData = (params: IBuildPrepareInstallPluginActionParams) => {
        const { metadataCid, dao, body, stageVotingPeriod } = params;

        const metadata = transactionUtils.cidToHex(metadataCid);
        const prepareFunctionParams = { metadata, dao, body, stageVotingPeriod };
        const prepareFunction = pluginRegistryUtils.getSlotFunction<IBuildPreparePluginInstallDataParams, Hex>({
            slotId: CreateDaoSlotId.CREATE_DAO_BUILD_PREPARE_PLUGIN_INSTALL_DATA,
            pluginId: body.plugin,
        })!;

        return prepareFunction(prepareFunctionParams);
    };
}

export const prepareProcessDialogUtils = new PrepareProcessDialogUtils();
