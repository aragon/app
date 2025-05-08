import type { IProposalCreate } from '@/modules/governance/dialogs/publishProposalDialog';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type { IPluginInfo } from '@/shared/types';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { transactionUtils, type ITransactionRequest } from '@/shared/utils/transactionUtils';
import { versionComparatorUtils } from '@/shared/utils/versionComparatorUtils';
import { invariant } from '@aragon/gov-ui-kit';
import { encodeFunctionData, type Hex } from 'viem';
import { SettingsSlotId } from '../../constants/moduleSlots';
import type { IBuildPreparePluginUpdateDataParams } from '../../types';
import { pluginSetupProcessorAbi } from './pluginSetupProcessorAbi';
import type {
    IBuildPrepareUpdatePluginsTransactionParams,
    IGetApplyUpdateProposalParams,
} from './prepareDaoContractsUpdateDialogUtils.api';

class PrepareDaoContractsUpdateDialogUtils {
    buildPrepareUpdatePluginsTransaction = (
        params: IBuildPrepareUpdatePluginsTransactionParams,
    ): Promise<ITransactionRequest> => {
        const { dao, plugins } = params;
        const pluginUpdateData = plugins.map((plugin) => this.buildPrepareUpdateTransaction(dao, plugin));
        const { pluginSetupProcessor } = networkDefinitions[dao.network].addresses;

        const transactionParams = { to: pluginSetupProcessor, value: BigInt(0) };
        const pluginUpdateTransactions = pluginUpdateData.map((data) => ({ ...transactionParams, data }));
        const transaction = transactionUtils.encodeTransactionRequests(pluginUpdateTransactions, dao.network);

        return Promise.resolve(transaction);
    };

    getApplyUpdateProposal = (params: IGetApplyUpdateProposalParams): IProposalCreate => {
        const actions = this.buildApplyUpdateTransactions(params);
        const metadata = this.buildApplyUpdateMetadata(params);

        return { ...metadata, actions, resources: [] };
    };

    private buildPrepareUpdateTransaction = (dao: IDao, plugin: IDaoPlugin) => {
        const pluginInfo = pluginRegistryUtils.getPlugin(plugin.subdomain) as IPluginInfo;

        const currentVersionTag = versionComparatorUtils.normaliseComparatorInput(plugin)!;
        const { installVersion: newVersionTag } = pluginInfo;
        const pluginSetupRepo = pluginInfo.repositoryAddresses[dao.network];
        const setupPayload = this.buildPluginSetupPayload(dao, plugin);

        const data = encodeFunctionData({
            abi: pluginSetupProcessorAbi,
            functionName: 'prepareUpdate',
            args: [dao.address as Hex, { currentVersionTag, newVersionTag, pluginSetupRepo, setupPayload }],
        });

        return data;
    };

    private buildPluginSetupPayload = (dao: IDao, plugin: IDaoPlugin) => {
        const { address, subdomain, preparedSetupData } = plugin;

        const currentHelpers = preparedSetupData.helpers as Hex[];
        const updateDataBuilder = pluginRegistryUtils.getSlotFunction<IBuildPreparePluginUpdateDataParams, Hex>({
            slotId: SettingsSlotId.SETTINGS_BUILD_PREPARE_PLUGIN_UPDATE_DATA,
            pluginId: subdomain,
        });

        invariant(updateDataBuilder != null, 'PrepareDaoContractsUpdateDialogUtils: builder function does not exist.');
        const initializeData = updateDataBuilder({ dao, plugin });

        return { plugin: address as Hex, currentHelpers, data: initializeData };
    };

    private buildApplyUpdateTransactions = (params: IGetApplyUpdateProposalParams): ITransactionRequest[] => {
        const { dao, plugins, prepareUpdateReceipt, osxUpdate } = params;
        const transactions: ITransactionRequest[] = [];

        if (osxUpdate) {
            const osxAction = this.buildOsxUpdateAction();
            transactions.push(osxAction);
        }

        if (prepareUpdateReceipt) {
            const setupData = pluginTransactionUtils.getPluginUpdateSetupData(prepareUpdateReceipt);
            const updateActions = pluginTransactionUtils.buildApplyPluginsUpdateActions({ dao, plugins, setupData });
            transactions.push(...updateActions);
        }

        return transactions;
    };

    // TODO
    private buildOsxUpdateAction = () => ({ to: '0x' as Hex, data: '' as Hex, value: BigInt(0) });

    private buildApplyUpdateMetadata = (
        params: IGetApplyUpdateProposalParams,
    ): Pick<IProposalCreate, 'title' | 'summary' | 'body'> => {
        const summary = this.getApplyUpdateSummaryMetadata(params.dao);
        const body = this.getApplyUpdateBodyMetadata(params);

        return { title: 'Aragon OSx contract upgrade', summary, body };
    };

    private getApplyUpdateSummaryMetadata = (dao: IDao) =>
        `This proposal is an Aragon OSx Update for ${dao.name}. The title, summary, and description text are automatically generated by the Aragon App.`;

    private getApplyUpdateBodyMetadata = (params: IGetApplyUpdateProposalParams): string => {
        const { dao, plugins, osxUpdate } = params;
        const osxUpdateEntry = osxUpdate ? this.getOsxUpdateDetails(dao) : '';
        const pluginsUpdateEntry = plugins.map((plugin) => this.getPluginUpdateDetails(plugin)).join(' ');

        return `
            <p>
                This proposal contains on-chain transactions that would upgrade specific smart contract components as
                follows:
            </p>
            <ol>${osxUpdateEntry}${pluginsUpdateEntry}</ol>
            <p>
                It is essential to consider the implications of upgrades before voting. Read the above release notes and
                confirm that all of the addresses in the actions correspond with the proposed upgrade.
            </p>
        `;
    };

    private getOsxUpdateDetails = (dao: IDao) => {
        const { release, build, releaseNotes, description } = networkDefinitions[dao.network].protocolVersion;
        const updatedVersion = `${release.toString()}.${build.toString()}.0`;
        const { version: currentVersion } = dao;

        return `
            <li>
                <strong>Aragon OSx ${updatedVersion}</strong>
                <ol>
                    <li><strong>Current version</strong>: ${currentVersion}}</li>
                    <li><strong>Upgrade description</strong>: ${description}}</li>
                    <li><strong>Note</strong>: The DAO's address will never change</li>
                    <li><a href=${releaseNotes}} target="_blank" rel="noopener noreferrer">View Release Notes</a></li>
                </ol>
            </li>
        `;
    };

    private getPluginUpdateDetails = (plugin: IDaoPlugin) => {
        const { subdomain, release: currentRelease, build: currentBuild } = plugin;
        const { release, build } = (pluginRegistryUtils.getPlugin(subdomain) as IPluginInfo).installVersion;

        const updatedVersion = `${release.toString()}.${build.toString()}`;
        const currentVersion = `${currentRelease}.${currentBuild}`;

        return `
            <li>
                <strong>${updatedVersion}}</strong>
                <ol>
                    <li><strong>Current version</strong>: ${currentVersion}}</li>
                    <li><strong>Upgrade description</strong>: {{description}}</li>
                    <li><a href={{releaseNotesLink}} target="_blank" rel="noopener noreferrer">View Release Notes</a></li>
                </ol>
            </li>
        `;
    };
}

export const prepareDaoContractsUpdateDialogUtils = new PrepareDaoContractsUpdateDialogUtils();
