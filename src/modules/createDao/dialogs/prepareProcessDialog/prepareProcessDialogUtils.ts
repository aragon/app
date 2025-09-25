import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { conditionFactoryAbi } from '@/modules/createDao/dialogs/prepareProcessDialog/conditionFactoryAbi';
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
import {
    createProcessFormUtils,
    GovernanceType,
    ProcessPermission,
    type ICreateProcessFormData,
} from '../../components/createProcessForm';
import type { IBuildPreparePluginInstallDataParams } from '../../types';
import { BodyType } from '../../types/enum';
import type { ISetupBodyFormExternal, ISetupBodyFormNew } from '../setupBodyDialog';
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
            .filter((body) => body.type === BodyType.NEW);
        const pluginsMetadata = newStageBodies.map((body) => prepareProcessDialogUtils.preparePluginMetadata(body));

        return { pluginsMetadata, processorMetadata };
    };

    buildPrepareProcessTransaction = (params: IBuildTransactionParams): Promise<ITransactionRequest> => {
        const { values, processMetadata, dao } = params;
        const { permissionSelectors } = values;

        const { processor: processorMetadata, plugins: pluginsMetadata } = processMetadata;
        const { pluginSetupProcessor, conditionFactory } = networkDefinitions[dao.network].addresses;

        const deployExecuteSelectorConditionData = this.buildDeployExecuteSelectorConditionData({
            dao,
            permissionSelectors,
        });
        const executeConditionDeployTransaction =
            values.permissions === ProcessPermission.SELECTED
                ? [{ to: conditionFactory, value: BigInt(0), data: deployExecuteSelectorConditionData }]
                : [];

        const processorInstallAction =
            processorMetadata != null ? this.buildPrepareInstallProcessorActionData(processorMetadata, dao) : undefined;
        const pluginInstallActions = this.buildPrepareInstallPluginsActionData({ values, dao, pluginsMetadata });
        const safeConditionsDeployData = this.buildSafeConditionsDeployData({ values, dao, pluginsMetadata });

        const installActionsData =
            processorInstallAction != null ? [processorInstallAction, ...pluginInstallActions] : pluginInstallActions;

        const installActionTransactions = installActionsData.map((data) => ({
            to: pluginSetupProcessor,
            value: BigInt(0),
            data,
        }));
        const safeConditionsDeployTransactions = safeConditionsDeployData.map((data) => ({
            to: conditionFactory,
            value: BigInt(0),
            data,
        }));
        const encodedTransaction = transactionUtils.encodeTransactionRequests(
            [...executeConditionDeployTransaction, ...installActionTransactions, ...safeConditionsDeployTransactions],
            dao.network,
        );

        return Promise.resolve(encodedTransaction);
    };

    buildPublishProcessProposalActions = (params: IBuildProcessProposalActionsParams): ITransactionRequest[] => {
        const { values, dao, setupData, executeConditionAddress, safeConditionAddresses = [] } = params;

        const isAdvancedGovernance = values.governanceType === 'ADVANCED';

        const processorSetupActions = isAdvancedGovernance
            ? sppTransactionUtils.buildPluginsSetupActions(values, setupData, dao, safeConditionAddresses)
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
            abi: conditionFactoryAbi,
            eventName: 'ExecuteSelectorConditionDeployed',
            logs: txReceipt.logs,
            strict: false,
        });

        return selectorLogs[0]?.args.newContract;
    };

    getSafeConditionAddresses = (txReceipt: TransactionReceipt): Hex[] | undefined => {
        const safeConditionLogs = parseEventLogs({
            abi: conditionFactoryAbi,
            eventName: 'SafeOwnerConditionDeployed',
            logs: txReceipt.logs,
            strict: false,
        });

        return safeConditionLogs.map((log) => log.args.newContract).filter((value) => value != null);
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
            .filter((body) => body.type === BodyType.NEW);

        const installData = newStageBodies.map((body, index) => {
            const { votingPeriod: stageVotingPeriod } = values.stages[body.stageIndex].settings;
            const metadataCid = pluginsMetadata[index];

            return this.buildPrepareInstallPluginActionData({ body, dao, metadataCid, stageVotingPeriod });
        });

        return installData;
    };

    private buildSafeConditionsDeployData = (params: IBuildPrepareInstallPluginsActionParams) => {
        const { values } = params;
        const { governanceType } = values;

        const isAdvancedGovernance = governanceType === GovernanceType.ADVANCED;

        if (!isAdvancedGovernance) {
            return [];
        }

        const safeBodies = values.stages
            .flatMap((stage) => stage.bodies)
            .filter(
                (body) => body.canCreateProposal && createProcessFormUtils.isBodySafe(body),
            ) as ISetupBodyFormExternal[];

        const safeInstallData = safeBodies.map((body) =>
            encodeFunctionData({
                abi: conditionFactoryAbi,
                functionName: 'deploySafeOwnerCondition',
                args: [body.address as Hex],
            }),
        );

        return safeInstallData;
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

        const groupedSelectors = Object.groupBy(permissionSelectors, (selector) => selector.to);
        const selectorTargets = Object.entries(groupedSelectors).map(([address, actions = []]) => ({
            where: address as Hex,
            selectors: actions.map((action) => proposalActionUtils.actionToFunctionSelector(action)) as Hex[],
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
