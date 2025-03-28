import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { type IBuildCreateProposalDataParams } from '@/modules/governance/types';
import { sppTransactionUtils } from '@/plugins/sppPlugin/utils/sppTransactionUtils';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import { type TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { type Hex } from 'viem';
import type { ICreateProcessFormData } from '../../components/createProcessForm';
import type { IBuildPreparePluginInstallDataParams } from '../../types';

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

    buildPrepareInstallActions = (
        values: ICreateProcessFormData,
        dao: IDao,
        processMetadata: IPrepareProcessMetadata,
    ) => {
        const { stages } = values;

        const sppMetadata = transactionUtils.cidToHex(processMetadata.spp);
        const pluginsMetadata = processMetadata.plugins.map((cid) => transactionUtils.cidToHex(cid));

        const sppInstallData = sppTransactionUtils.buildPreparePluginInstallData(sppMetadata, dao);

        const pluginsInstallData = stages.map((stage) => {
            const stageBodies = values.bodies.filter((body) => body.stageId === stage.internalId);
            const installData = stageBodies.map((body) => {
                const metadataCid = pluginsMetadata.shift()!;

                const params = { metadataCid, dao, body, stage };
                const prepareFunction = pluginRegistryUtils.getSlotFunction<IBuildPreparePluginInstallDataParams, Hex>({
                    slotId: CreateDaoSlotId.CREATE_DAO_BUILD_PREPARE_PLUGIN_INSTALL_DATA,
                    pluginId: body.plugin,
                })!;

                return prepareFunction(params);
            });

            return installData;
        });

        const installActions = [sppInstallData, ...pluginsInstallData.flat()].map((data) =>
            pluginTransactionUtils.installDataToAction(data, dao.network),
        );

        return installActions;
    };
}

export const prepareProcessDialogUtils = new PrepareProcessDialogUtils();
