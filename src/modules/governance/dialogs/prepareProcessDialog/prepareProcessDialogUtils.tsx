import type {
    ICreateProcessFormBody,
    ICreateProcessFormData,
    ICreateProcessFormStage,
    ITokenVotingMember,
} from '@/modules/governance/components/createProcessForm';
import { DaoTokenVotingMode } from '@/plugins/tokenPlugin/types';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import type { TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { dateUtils } from '@/shared/utils/dateUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import {
    encodeAbiParameters,
    encodeFunctionData,
    parseEventLogs,
    parseUnits,
    zeroAddress,
    type Hex,
    type TransactionReceipt,
} from 'viem';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import type { IBuildCreateProposalDataParams } from '../../types';
import { multisigPluginSetupAbi } from './abi/multisigPluginSetupAbi';
import { pluginSetupProcessorAbi } from './abi/pluginSetupProcessorAbi';
import { sppPluginSetupAbi } from './abi/sppPluginSetupAbi';
import { tokenPluginSetupAbi } from './abi/tokenPluginSetupAbi';

export interface IPrepareProcessMetadata {
    /**
     * Metadata CID of the proposal.
     */
    proposal: string;
    /**
     * Metadata CID of all process plugins ordered by stage and order of body inside the stage.
     */
    plugins: string[];
    /**
     * Metadata CID for the SPP plugin.
     */
    spp: string;
}

export interface IBuildTransactionParams {
    /**
     * Values of the create-proposal form.
     */
    values: ICreateProcessFormData;
    /**
     * Metadata structure for the process.
     */
    processMetadata: IPrepareProcessMetadata;
    /**
     * Plugin used a target for creating the proposal.
     */
    plugin: IDaoPlugin;
    /**
     * DAO to install the plugins to.
     */
    dao: IDao;
}

export interface IPluginRepoInfo {
    /**
     * Address of the plugin repo.
     */
    address: Hex;
    /**
     * Version of the plugin to be used.
     */
    version: { release: number; build: number };
}

export interface IPluginSetupDataPermission {
    operation: number;
    where: Hex;
    who: Hex;
    condition: Hex;
    permissionId: Hex;
}

export interface IPluginSetupData {
    pluginAddress: Hex;
    pluginSetupRepo: Hex;
    versionTag: { release: number; build: number };
    preparedSetupData: { helpers: readonly Hex[]; permissions: readonly IPluginSetupDataPermission[] };
}

class PrepareProcessDialogUtils {
    private sppRepo: IPluginRepoInfo = {
        address: '0xE67b8E026d190876704292442A38163Ce6945d6b',
        version: { release: 1, build: 5 },
    };

    private multisigRepo: IPluginRepoInfo = {
        address: '0xA0901B5BC6e04F14a9D0d094653E047644586DdE',
        version: { release: 1, build: 5 },
    };

    private tokenRepo: IPluginRepoInfo = {
        address: '0x6241ad0D3f162028d2e0000f1A878DBc4F5c4aD0',
        version: { release: 1, build: 5 },
    };

    private globalExecutor: Hex = '0x67744773b8C29aaDc8a11010C09306c0029219Ff';

    pspRepoAddress: Hex = '0x9e99D11b513dD2cc5e117a5793412106502FF04B';

    prepareProposalMetadata = () => {
        const title = 'Prepare plugin installation';
        const summary = 'This proposal prepares the installation of all plugins';

        return { title, summary };
    };

    preparePluginMetadata = (plugin: ICreateProcessFormBody) => {
        const { name, description, resources: links } = plugin;

        return { name, description, links };
    };

    prepareSppMetadata = (values: ICreateProcessFormData) => {
        const { name, description, resources: links, key: processKey } = values;
        const stageNames = values.stages.map((stage) => stage.name);

        return { name, description, links, processKey, stageNames };
    };

    buildTransaction = (params: IBuildTransactionParams) => {
        const { values, processMetadata, plugin, dao } = params;

        const proposalMetadata = transactionUtils.cidToHex(processMetadata.proposal);

        const buildDataFunction = pluginRegistryUtils.getSlotFunction<IBuildCreateProposalDataParams, Hex>({
            pluginId: plugin.subdomain,
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
        })!;

        const proposalActions = this.buildPrepareInstallActions(values, dao.address as Hex, processMetadata);
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

        return transaction;
    };

    getPluginSetupData = (receipt: TransactionReceipt) => {
        const { logs } = receipt;

        const installationPreparedLogs = parseEventLogs({
            abi: pluginSetupProcessorAbi,
            eventName: 'InstallationPrepared',
            logs,
        });

        const pluginSetupData: IPluginSetupData[] = installationPreparedLogs.map((log) => ({
            pluginAddress: log.args.plugin,
            pluginSetupRepo: log.args.pluginSetupRepo,
            versionTag: log.args.versionTag,
            preparedSetupData: log.args.preparedSetupData,
        }));

        return pluginSetupData;
    };

    private buildPrepareInstallActions = (
        values: ICreateProcessFormData,
        daoAddress: Hex,
        processMetadata: IPrepareProcessMetadata,
    ) => {
        const sppMetadata = transactionUtils.cidToHex(processMetadata.spp);
        const pluginsMetadata = processMetadata.plugins.map((cid) => transactionUtils.cidToHex(cid));

        const sppInstallData = this.buildPrepareSppInstallData(sppMetadata, daoAddress);
        const pluginsInstallData = values.stages.map((stage) => {
            const installData = stage.bodies.map((body) => {
                const pluginMetadata = pluginsMetadata.shift()!;

                return body.governanceType === 'multisig'
                    ? this.buildPrepareMultisigInstallData(body, pluginMetadata, daoAddress)
                    : this.buildPrepareTokenInstallData(body, pluginMetadata, daoAddress, stage);
            });

            return installData;
        });

        const installActions = [sppInstallData, ...pluginsInstallData.flat()].map((data) =>
            this.installDataToAction(data),
        );

        return installActions;
    };

    private buildPrepareSppInstallData = (metadataCid: string, daoAddress: Hex) => {
        const sppTarget = { target: daoAddress, operation: 0 };
        const pluginSettingsData = encodeAbiParameters(sppPluginSetupAbi, [metadataCid as Hex, [], [], sppTarget]);

        const transactionData = this.buildPrepareInstallationData(this.sppRepo, pluginSettingsData, daoAddress);

        return transactionData;
    };

    private buildPrepareMultisigInstallData = (body: ICreateProcessFormBody, metadataCid: string, daoAddress: Hex) => {
        const { members, multisigThreshold } = body;

        const memberAddresses = members.map((member) => member.address as Hex);
        const multisigTarget = { target: this.globalExecutor, operation: 1 };
        const pluginSettings = { onlyListed: true, minApprovals: multisigThreshold };

        const pluginSettingsData = encodeAbiParameters(multisigPluginSetupAbi, [
            memberAddresses,
            pluginSettings,
            multisigTarget,
            metadataCid as Hex,
        ]);

        const transactionData = this.buildPrepareInstallationData(this.multisigRepo, pluginSettingsData, daoAddress);

        return transactionData;
    };

    private buildPrepareTokenInstallData = (
        body: ICreateProcessFormBody,
        metadataCid: string,
        daoAddress: Hex,
        stage: ICreateProcessFormStage,
    ) => {
        const { voteChange, supportThreshold, minimumParticipation, tokenName, tokenSymbol, members } = body;

        const votingMode = voteChange
            ? DaoTokenVotingMode.VOTE_REPLACEMENT
            : stage.earlyStageAdvance
              ? DaoTokenVotingMode.EARLY_EXECUTION
              : DaoTokenVotingMode.STANDARD;

        const votingSettings = {
            votingMode,
            supportThreshold: supportThreshold * 10 ** 4,
            minParticipation: minimumParticipation * 10 ** 4,
            minDuration: dateUtils.durationToSeconds(stage.votingPeriod),
            minProposerVotingPower: BigInt(0),
        };

        const tokenSettings = { addr: zeroAddress, name: tokenName, symbol: tokenSymbol };
        const mintSettings = members.reduce<{ receivers: Hex[]; amounts: bigint[] }>(
            (current, member) => ({
                receivers: current.receivers.concat(member.address as Hex),
                amounts: current.amounts.concat(parseUnits((member as ITokenVotingMember).tokenAmount.toString(), 18)),
            }),
            { receivers: [], amounts: [] },
        );

        const tokenTarget = { target: this.globalExecutor, operation: 1 };
        const pluginSettingsData = encodeAbiParameters(tokenPluginSetupAbi, [
            votingSettings,
            tokenSettings,
            mintSettings,
            tokenTarget,
            BigInt(0),
            metadataCid as Hex,
        ]);

        const transactionData = this.buildPrepareInstallationData(this.tokenRepo, pluginSettingsData, daoAddress);

        return transactionData;
    };

    private buildPrepareInstallationData = (pluginRepo: IPluginRepoInfo, data: Hex, daoAddress: Hex) => {
        const pluginSetupRef = { pluginSetupRepo: pluginRepo.address, versionTag: pluginRepo.version };
        const transactionData = encodeFunctionData({
            abi: pluginSetupProcessorAbi,
            functionName: 'prepareInstallation',
            args: [daoAddress, { pluginSetupRef, data }],
        });

        return transactionData;
    };

    private installDataToAction = (data: Hex) => ({ to: this.pspRepoAddress, data, value: '0' });
}

export const prepareProcessDialogUtils = new PrepareProcessDialogUtils();
