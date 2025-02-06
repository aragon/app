import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import type { IBuildPrepareInstallDataParams } from '@/modules/createDao/types/buildPrepareInstallDataParams';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { type IBuildCreateProposalDataParams } from '@/modules/governance/types';
import { sppTransactionUtils } from '@/plugins/sppPlugin/utils/sppTransactionUtils';
import { type TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { type IBuildTransactionParams } from '@/shared/utils/pluginTransactionUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { type Hex } from 'viem';
import {
    ProposalCreationMode,
    type ICreateProcessFormBody,
    type ICreateProcessFormData,
} from '../../components/createProcessForm';

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

        return Promise.resolve(transaction);
    };

    buildPrepareInstallActions = (
        values: ICreateProcessFormData,
        daoAddress: Hex,
        processMetadata: IPrepareProcessMetadata,
    ) => {
        const { stages, permissions } = values;
        const { proposalCreationBodies, proposalCreationMode } = permissions;

        const sppMetadata = transactionUtils.cidToHex(processMetadata.spp);

        const pluginsMetadata = processMetadata.plugins.map((cid) => transactionUtils.cidToHex(cid));

        const sppInstallData = sppTransactionUtils.buildPrepareSppInstallData(sppMetadata, daoAddress);

        const pluginsInstallData = stages.map((stage) => {
            const installData = stage.bodies.map((body) => {
                const metadataCid = pluginsMetadata.shift()!;

                const permissionSettings =
                    proposalCreationMode === ProposalCreationMode.ANY_WALLET
                        ? undefined
                        : proposalCreationBodies.find((bodyPermissions) => bodyPermissions.bodyId === body.id);

                const params: IBuildPrepareInstallDataParams = {
                    metadataCid,
                    daoAddress,
                    permissionSettings,
                    body,
                    stage,
                };

                return pluginRegistryUtils.getSlotFunction<IBuildPrepareInstallDataParams, Hex>({
                    slotId: CreateDaoSlotId.CREATE_DAO_BUILD_PREPARE_INSTALL_ACTIONS,
                    pluginId: body.governanceType.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
                })?.(params);
            });

            return installData;
        });

        const installActions = [sppInstallData, ...pluginsInstallData.flat()].map((data) =>
            this.installDataToAction(data!),
        );

        return installActions;
    };

    private installDataToAction = (data: Hex) => ({ to: this.pspRepoAddress, data, value: '0' });
}

export const prepareProcessDialogUtils = new PrepareProcessDialogUtils();
