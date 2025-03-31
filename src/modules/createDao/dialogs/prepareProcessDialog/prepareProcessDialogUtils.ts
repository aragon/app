import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { type IBuildCreateProposalDataParams } from '@/modules/governance/types';
import { sppTransactionUtils } from '@/plugins/sppPlugin/utils/sppTransactionUtils';
import type { IDao } from '@/shared/api/daoService';
import { type TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { type Hex } from 'viem';
import type { ICreateProcessFormData } from '../../components/createProcessForm';
import type { IBuildPreparePluginInstallDataParams } from '../../types';
import type {
    IBuildPrepareInstallActionParams,
    IBuildPrepareInstallPluginActionParams,
    IBuildPrepareInstallPluginsActionParams,
    IBuildTransactionParams,
} from './prepareProcessDialogUtils.api';

class PrepareProcessDialogUtils {
    private proposalMetadata = {
        title: 'Prepare plugin installation',
        summary: 'This proposal prepares the installation of all plugins',
    };

    prepareProposalMetadata = () => this.proposalMetadata;

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
        const { values, processMetadata, plugin, dao } = params;

        const proposalMetadata = transactionUtils.cidToHex(processMetadata.proposal);
        const proposalActions = this.buildPrepareInstallActions({ values, dao, processMetadata });

        const buildProposalDataFunction = pluginRegistryUtils.getSlotFunction<IBuildCreateProposalDataParams, Hex>({
            pluginId: plugin.subdomain,
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
        })!;

        const transactionData = buildProposalDataFunction({
            actions: proposalActions,
            metadata: proposalMetadata,
            values: {} as IBuildCreateProposalDataParams['values'],
        });

        const transaction: TransactionDialogPrepareReturn = { to: plugin.address as Hex, data: transactionData };

        return Promise.resolve(transaction);
    };

    private buildPrepareInstallActions = (params: IBuildPrepareInstallActionParams) => {
        const { values, processMetadata, dao } = params;
        const { processor: processorMetadata, plugins: pluginsMetadata } = processMetadata;

        const processorInstallAction =
            processorMetadata != null ? this.buildPrepareInstallProcessorActionData(processorMetadata, dao) : undefined;

        const pluginInstallActions = this.buildPrepareInstallPluginsActionData({ values, dao, pluginsMetadata });

        const installActions =
            processorInstallAction != null ? [processorInstallAction, ...pluginInstallActions] : pluginInstallActions;

        return installActions.map((actionData) => pluginTransactionUtils.installDataToAction(actionData, dao.network));
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
            const metadata = pluginsMetadata[index];

            return this.buildPrepareInstallPluginActionData({ body, dao, metadata, stageVotingPeriod });
        });

        return installActionsData;
    };

    private buildPrepareInstallPluginActionData = (params: IBuildPrepareInstallPluginActionParams) => {
        const { metadata, dao, body, stageVotingPeriod } = params;

        const metadataCid = transactionUtils.cidToHex(metadata);
        const prepareFunctionParams = { metadataCid, dao, body, stageVotingPeriod };
        const prepareFunction = pluginRegistryUtils.getSlotFunction<IBuildPreparePluginInstallDataParams, Hex>({
            slotId: CreateDaoSlotId.CREATE_DAO_BUILD_PREPARE_PLUGIN_INSTALL_DATA,
            pluginId: body.plugin,
        })!;

        return prepareFunction(prepareFunctionParams);
    };
}

export const prepareProcessDialogUtils = new PrepareProcessDialogUtils();
