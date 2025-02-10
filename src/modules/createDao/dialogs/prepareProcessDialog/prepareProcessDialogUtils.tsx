import { DaoTokenVotingMode } from '@/plugins/tokenPlugin/types';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import type { TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { dateUtils } from '@/shared/utils/dateUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { encodeAbiParameters, encodeFunctionData, parseUnits, zeroAddress, type Hex } from 'viem';
import { GovernanceSlotId } from '../../../governance/constants/moduleSlots';
import type { IBuildCreateProposalDataParams } from '../../../governance/types';
import {
    ProposalCreationMode,
    type ICreateProcessFormBody,
    type ICreateProcessFormData,
    type ICreateProcessFormProposalCreationBody,
    type ICreateProcessFormStage,
    type ITokenVotingMember,
} from '../../components/createProcessForm';
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

class PrepareProcessDialogUtils {
    private sppRepo: IPluginRepoInfo = {
        address: '0xE67b8E026d190876704292442A38163Ce6945d6b',
        version: { release: 1, build: 8 },
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
        const { name, description, resources: links, processKey } = values;
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

        const proposalActions = this.buildPrepareInstallActions(values, dao, processMetadata);
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

    private buildPrepareInstallActions = (
        values: ICreateProcessFormData,
        dao: IDao,
        processMetadata: IPrepareProcessMetadata,
    ) => {
        const { stages, permissions } = values;
        const { proposalCreationBodies, proposalCreationMode } = permissions;
        const { network } = dao;
        const daoAddress = dao.address as Hex;

        const sppMetadata = transactionUtils.cidToHex(processMetadata.spp);
        const pluginsMetadata = processMetadata.plugins.map((cid) => transactionUtils.cidToHex(cid));

        const sppInstallData = this.buildPrepareSppInstallData(sppMetadata, daoAddress);
        const pluginsInstallData = stages.map((stage) => {
            const installData = stage.bodies.map((body) => {
                const pluginMetadata = pluginsMetadata.shift()!;
                const permissionSettings =
                    proposalCreationMode === ProposalCreationMode.ANY_WALLET
                        ? undefined
                        : proposalCreationBodies.find((bodyPermissions) => bodyPermissions.bodyId === body.id);

                return body.governanceType === 'multisig'
                    ? this.buildPrepareMultisigInstallData(body, pluginMetadata, daoAddress, permissionSettings)
                    : this.buildPrepareTokenInstallData(body, pluginMetadata, daoAddress, stage, permissionSettings);
            });

            return installData;
        });

        const installActions = [sppInstallData, ...pluginsInstallData.flat()].map((data) =>
            pluginTransactionUtils.installDataToAction(data, network),
        );

        return installActions;
    };

    private buildPrepareSppInstallData = (metadataCid: string, daoAddress: Hex) => {
        const sppTarget = { target: daoAddress, operation: 0 };
        const pluginSettingsData = encodeAbiParameters(sppPluginSetupAbi, [metadataCid as Hex, [], [], sppTarget]);

        const transactionData = this.buildPrepareInstallationData(this.sppRepo, pluginSettingsData, daoAddress);

        return transactionData;
    };

    private buildPrepareMultisigInstallData = (
        body: ICreateProcessFormBody,
        metadataCid: string,
        daoAddress: Hex,
        permissionSettings?: ICreateProcessFormProposalCreationBody,
    ) => {
        const { members, multisigThreshold } = body;

        const memberAddresses = members.map((member) => member.address as Hex);
        const multisigTarget = { target: this.globalExecutor, operation: 1 };
        const pluginSettings = { onlyListed: permissionSettings != null, minApprovals: multisigThreshold };

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
        permissionSettings?: ICreateProcessFormProposalCreationBody,
    ) => {
        const {
            voteChange,
            supportThreshold,
            minimumParticipation,
            tokenType,
            importTokenAddress,
            tokenName,
            tokenSymbol,
            members,
        } = body;
        const { earlyStageAdvance, votingPeriod } = stage.timing;
        const { minVotingPower } = permissionSettings ?? {};

        const votingMode = voteChange
            ? DaoTokenVotingMode.VOTE_REPLACEMENT
            : earlyStageAdvance
              ? DaoTokenVotingMode.EARLY_EXECUTION
              : DaoTokenVotingMode.STANDARD;

        const minProposerVotingPower = minVotingPower ? parseUnits(minVotingPower, 18) : BigInt(0);
        const votingSettings = {
            votingMode,
            supportThreshold: supportThreshold * 10 ** 4,
            minParticipation: minimumParticipation * 10 ** 4,
            minDuration: BigInt(dateUtils.durationToSeconds(votingPeriod)),
            minProposerVotingPower: minProposerVotingPower,
        };

        const tokenSettings = {
            addr: tokenType === 'imported' ? (importTokenAddress as Hex) : zeroAddress,
            name: tokenName ?? '',
            symbol: tokenSymbol ?? '',
        };

        const defaultMintSettings = { receivers: [], amounts: [] };
        const mintSettings = members.reduce<{ receivers: Hex[]; amounts: bigint[] }>(
            (current, member) => ({
                receivers: current.receivers.concat(member.address as Hex),
                amounts: current.amounts.concat(parseUnits((member as ITokenVotingMember).tokenAmount.toString(), 18)),
            }),
            defaultMintSettings,
        );

        const tokenTarget = { target: this.globalExecutor, operation: 1 };
        const pluginSettingsData = encodeAbiParameters(tokenPluginSetupAbi, [
            votingSettings,
            tokenSettings,
            tokenType === 'imported' ? defaultMintSettings : mintSettings,
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
}

export const prepareProcessDialogUtils = new PrepareProcessDialogUtils();
