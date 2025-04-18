import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { sppTransactionUtils } from '@/plugins/sppPlugin/utils/sppTransactionUtils';
import type { IDao } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { type ITransactionRequest, transactionUtils } from '@/shared/utils/transactionUtils';
import { type Hex } from 'viem';
import { GovernanceType, type ICreateProcessFormData } from '../../components/createProcessForm';
import type { IBuildPreparePluginInstallDataParams } from '../../types';
import type { ISetupBodyForm } from '../setupBodyDialog';
import type {
    IBuildPrepareInstallPluginActionParams,
    IBuildPrepareInstallPluginsActionParams,
    IBuildProcessProposalActionsParams,
    IBuildTransactionParams,
} from './prepareProcessDialogUtils.api';

class PrepareProcessDialogUtils {
    private publishProcessProposalMetadata = {
        title: 'Apply plugin installation',
        summary: 'This proposal applies the plugin installation to create the new process',
    };

    preparePluginsMetadata = (values: ICreateProcessFormData) => {
        const { governanceType, stages, bodies } = values;

        const isAdvancedGovernance = governanceType === GovernanceType.ADVANCED;
        const activePlugins = isAdvancedGovernance ? stages.flatMap((stage) => stage.bodies) : bodies;
        const processorMetadata = prepareProcessDialogUtils.prepareProcessorMetadata(values);

        const pluginsMetadata = activePlugins
            .filter((body) => body.address != null)
            .map((plugin) =>
                isAdvancedGovernance ? prepareProcessDialogUtils.preparePluginMetadata(plugin) : processorMetadata,
            );

        return { pluginsMetadata, processorMetadata: isAdvancedGovernance ? processorMetadata : undefined };
    };

    buildPrepareProcessTransaction = (params: IBuildTransactionParams): Promise<ITransactionRequest> => {
        const { values, processMetadata, dao } = params;

        const { processor: processorMetadata, plugins: pluginsMetadata } = processMetadata;
        const { pluginSetupProcessor } = networkDefinitions[dao.network].addresses;

        const processorInstallAction =
            processorMetadata != null ? this.buildPrepareInstallProcessorActionData(processorMetadata, dao) : undefined;
        const pluginInstallActions = this.buildPrepareInstallPluginsActionData({ values, dao, pluginsMetadata });

        const installActionsData =
            processorInstallAction != null ? [processorInstallAction, ...pluginInstallActions] : pluginInstallActions;

        const actionValues = { to: pluginSetupProcessor, value: BigInt(0) };
        const installActionTransactions = installActionsData.map((data) => ({ ...actionValues, data }));
        const encodedTransaction = transactionUtils.encodeTransactionRequests(installActionTransactions, dao.network);

        return Promise.resolve(encodedTransaction);
    };

    buildPublishProcessProposalActions = (params: IBuildProcessProposalActionsParams): ITransactionRequest[] => {
        const { values, dao, setupData } = params;

        const isAdvancedGovernance = values.governanceType === 'ADVANCED';

        const processorSetupActions = isAdvancedGovernance
            ? sppTransactionUtils.buildPluginsSetupActions(values, setupData, dao)
            : [];

        const buildActionsParams = { dao, setupData, actions: processorSetupActions };
        const proposalActions = pluginTransactionUtils.buildApplyPluginsInstallationActions(buildActionsParams);

        return proposalActions;
    };

    preparePublishProcessProposalMetadata = () => this.publishProcessProposalMetadata;

    private preparePluginMetadata = (plugin: ICreateProcessFormData['bodies'][number]) => {
        const { name, description, resources: links } = plugin;

        return { name, description, links };
    };

    private prepareProcessorMetadata = (values: ICreateProcessFormData) => {
        const { name, description, resources: links, processKey } = values;
        const stageNames = values.stages.map((stage) => stage.name);

        return { name, description, links, processKey, stageNames };
    };

    private buildPrepareInstallProcessorActionData = (metadata: string, dao: IDao) => {
        const processorMetadata = transactionUtils.cidToHex(metadata);
        const processorInstallData = sppTransactionUtils.buildPreparePluginInstallData(processorMetadata, dao);

        return processorInstallData;
    };

    private buildPrepareInstallPluginsActionData = (params: IBuildPrepareInstallPluginsActionParams) => {
        const { values, pluginsMetadata, dao } = params;
        const { governanceType, bodies, stages } = values;

        const isAdvancedGovernance = governanceType === GovernanceType.ADVANCED;
        const installBodies = isAdvancedGovernance ? stages.flatMap((stage) => stage.bodies) : bodies;

        const installData = installBodies
            .filter((body) => body.address == null)
            .map((body, index) => {
                const stageVotingPeriod = this.getBodyStageVotingPeriod(body, stages);
                const metadataCid = pluginsMetadata[index];

                return this.buildPrepareInstallPluginActionData({ body, dao, metadataCid, stageVotingPeriod });
            });

        return installData;
    };

    private getBodyStageVotingPeriod = (body: ISetupBodyForm, stages: ICreateProcessFormData['stages']) => {
        const stage = stages.find((stage) =>
            stage.bodies.flatMap((stageBody) => stageBody.internalId).includes(body.internalId),
        );

        return stage?.timing.votingPeriod;
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
