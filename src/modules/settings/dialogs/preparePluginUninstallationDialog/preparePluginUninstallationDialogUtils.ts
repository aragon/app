import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import type { Hex } from 'viem';

class PreparePluginUninstallationDialogUtils {
    buildPrepareUninstallationTransaction = (dao: IDao, plugin: IDaoPlugin): Promise<ITransactionRequest> => {
        const { proposalCreationConditionAddress } = plugin;
        const { pluginSetupProcessor } = networkDefinitions[dao.network].addresses;

        const helpers = proposalCreationConditionAddress != null ? [proposalCreationConditionAddress as Hex] : [];
        const prepareUninstallData = pluginTransactionUtils.buildPrepareUninstallData(dao, plugin, helpers, '0x');

        return Promise.resolve({ data: prepareUninstallData, value: BigInt(0), to: pluginSetupProcessor });
    };

    prepareApplyUninstallationProposalMetadata = (uninstallPlugin: IDaoPlugin, proposalPlugin: IDaoPlugin) => {
        const uninstallPluginInfo = `${daoUtils.getPluginName(uninstallPlugin)} (${uninstallPlugin.slug})`;
        const proposalPluginInfo = `${daoUtils.getPluginName(proposalPlugin)} (${proposalPlugin.slug})`;

        const title = `Uninstall ${uninstallPluginInfo} process`;
        const summary = `
            If approved, this proposal will uninstall the ${uninstallPluginInfo} plugin. It will revoke the
            plugin's permission to execute actions on the DAO's behalf. Vote in favor only if you're confident other
            installed governance processes are enough for the DAO to function as intended. The current
            ${proposalPluginInfo} process will not be affected.`;

        return { title, summary };
    };
}

export const preparePluginUninstallationDialogUtils = new PreparePluginUninstallationDialogUtils();
