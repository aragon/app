import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { conditionFactoryAbi } from '@/modules/createDao/dialogs/prepareProcessDialog/conditionFactoryAbi';
import { executeSelectorConditionAbi } from '@/modules/createDao/dialogs/prepareProcessDialog/executeSelectorConditionAbi';
import { proposalActionUtils } from '@/modules/governance/utils/proposalActionUtils';
import { sppTransactionUtils } from '@/plugins/sppPlugin/utils/sppTransactionUtils';
import type { IDao } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import {
    pluginTransactionUtils,
    type IBuildApplyPluginsInstallationActionsParams,
} from '@/shared/utils/pluginTransactionUtils';
import { transactionUtils, type ITransactionRequest } from '@/shared/utils/transactionUtils';
import { encodeFunctionData, parseEventLogs, type Hex, type TransactionReceipt } from 'viem';
import { GovernanceType, ProcessPermission, type ICreateProcessFormData } from '../../components/createProcessForm';
import type { IBuildPreparePluginInstallDataParams } from '../../types';
import { SetupBodyType, type ISetupBodyFormNew } from '../setupBodyDialog';
import type {
    IBuildDeployExecuteSelectorConditionDataParams,
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
        const { governanceType } = values;

        const processorMetadata = prepareProcessDialogUtils.prepareProcessorMetadata(values);

        if (governanceType === GovernanceType.BASIC) {
            return { pluginsMetadata: [processorMetadata] };
        }

        const newStageBodies = values.stages
            .flatMap((stage) => stage.bodies)
            .filter((body) => body.type === SetupBodyType.NEW);
        const pluginsMetadata = newStageBodies.map((body) => prepareProcessDialogUtils.preparePluginMetadata(body));

        return { pluginsMetadata, processorMetadata };
    };

    buildPrepareProcessTransaction = (params: IBuildTransactionParams): Promise<ITransactionRequest> => {
        const { values, processMetadata, dao } = params;
        const { permissionSelectors } = values;

        const { processor: processorMetadata, plugins: pluginsMetadata } = processMetadata;
        const { pluginSetupProcessor, conditionFactory } = networkDefinitions[dao.network].addresses;

        const needsExecuteCondition = values.permissions === ProcessPermission.SELECTED;
        const conditionDeployTransaction = needsExecuteCondition
            ? [
                  {
                      to: conditionFactory,
                      value: BigInt(0),
                      data: this.buildDeployExecuteSelectorConditionData({ dao, permissionSelectors }),
                  },
              ]
            : [];

        const processorInstallAction =
            processorMetadata != null ? this.buildPrepareInstallProcessorActionData(processorMetadata, dao) : undefined;
        const pluginInstallActions = this.buildPrepareInstallPluginsActionData({ values, dao, pluginsMetadata });

        const installActionsData =
            processorInstallAction != null ? [processorInstallAction, ...pluginInstallActions] : pluginInstallActions;

        const actionValues = { to: pluginSetupProcessor, value: BigInt(0) };
        const installActionTransactions = installActionsData.map((data) => ({ ...actionValues, data }));
        const encodedTransaction = transactionUtils.encodeTransactionRequests(
            [...conditionDeployTransaction, ...installActionTransactions],
            dao.network,
        );

        return Promise.resolve(encodedTransaction);
    };

    buildPublishProcessProposalActions = (params: IBuildProcessProposalActionsParams): ITransactionRequest[] => {
        const { values, dao, setupData, executeConditionAddress } = params;

        const isAdvancedGovernance = values.governanceType === 'ADVANCED';

        const processorSetupActions = isAdvancedGovernance
            ? sppTransactionUtils.buildPluginsSetupActions(values, setupData, dao)
            : [];

        const buildActionsParams: IBuildApplyPluginsInstallationActionsParams = {
            dao,
            setupData,
            actions: processorSetupActions,
            executeConditionAddress,
        };
        const proposalActions = pluginTransactionUtils.buildApplyPluginsInstallationActions(buildActionsParams);

        return proposalActions;
    };

    preparePublishProcessProposalMetadata = () => this.publishProcessProposalMetadata;

    getExecuteSelectorConditionAddress = (txReceipt: TransactionReceipt): Hex | undefined => {
        const selectorLogs = parseEventLogs({
            abi: executeSelectorConditionAbi,
            eventName: 'SelectorAllowed',
            logs: txReceipt.logs,
            strict: false,
        });

        return selectorLogs[0]?.address ?? undefined;
    };

    private preparePluginMetadata = (plugin: ISetupBodyFormNew) => {
        const { name, description, resources: links } = plugin;

        return { name, description, links };
    };

    private prepareProcessorMetadata = (values: ICreateProcessFormData) => {
        const { name, description, resources: links, processKey, governanceType } = values;
        const baseMetadata = { name, description, links, processKey };

        return governanceType === GovernanceType.BASIC
            ? baseMetadata
            : { ...baseMetadata, stageNames: values.stages.map((stage) => stage.name) };
    };

    private buildPrepareInstallProcessorActionData = (metadata: string, dao: IDao) => {
        const processorMetadata = transactionUtils.stringToMetadataHex(metadata);
        const processorInstallData = sppTransactionUtils.buildPreparePluginInstallData(processorMetadata, dao);

        return processorInstallData;
    };

    private buildPrepareInstallPluginsActionData = (params: IBuildPrepareInstallPluginsActionParams) => {
        const { values, pluginsMetadata, dao } = params;
        const { governanceType } = values;

        const isAdvancedGovernance = governanceType === GovernanceType.ADVANCED;

        if (!isAdvancedGovernance) {
            const { body } = values;
            return [this.buildPrepareInstallPluginActionData({ body, dao, metadataCid: pluginsMetadata[0] })];
        }

        const newStageBodies = values.stages
            .flatMap((stage, stageIndex) => stage.bodies.map((body) => ({ ...body, stageIndex })))
            .filter((body) => body.type === SetupBodyType.NEW);

        const installData = newStageBodies.map((body, index) => {
            const { votingPeriod: stageVotingPeriod } = values.stages[body.stageIndex].settings;
            const metadataCid = pluginsMetadata[index];

            return this.buildPrepareInstallPluginActionData({ body, dao, metadataCid, stageVotingPeriod });
        });

        return installData;
    };

    private buildPrepareInstallPluginActionData = (params: IBuildPrepareInstallPluginActionParams) => {
        const { metadataCid, dao, body, stageVotingPeriod } = params;

        const metadata = transactionUtils.stringToMetadataHex(metadataCid);
        const prepareFunctionParams = { metadata, dao, body, stageVotingPeriod };
        const prepareFunction = pluginRegistryUtils.getSlotFunction<IBuildPreparePluginInstallDataParams, Hex>({
            slotId: CreateDaoSlotId.CREATE_DAO_BUILD_PREPARE_PLUGIN_INSTALL_DATA,
            pluginId: body.plugin,
        })!;

        return prepareFunction(prepareFunctionParams);
    };

    private buildDeployExecuteSelectorConditionData = (params: IBuildDeployExecuteSelectorConditionDataParams) => {
        const { dao, permissionSelectors } = params;

        const groupedByAddress = Object.groupBy(permissionSelectors, (selector) => selector.to);

        const selectorTargets = Object.entries(groupedByAddress).map(([address, actions]) => ({
            where: address as Hex,
            selectors:
                actions
                    ?.filter((action) => action.inputData != null)
                    .map((action) => proposalActionUtils.actionInputDataToFunctionSelector(action.inputData!)) ?? [],
        }));

        const transactionData = encodeFunctionData({
            abi: conditionFactoryAbi,
            functionName: 'deployExecuteSelectorCondition',
            args: [dao.address as Hex, selectorTargets],
        });

        return transactionData;
    };
}

export const prepareProcessDialogUtils = new PrepareProcessDialogUtils();
