import type { Hex } from 'viem';
import { policyPluginRegistryUtils } from '@/modules/capitalFlow/utils/policyPluginRegistryUtils';
import type { IDao, IDaoPlugin, IDaoPolicy } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import { SettingsSlotId } from '../../constants/moduleSlots';
import type { IGetUninstallHelpersParams } from '../../types';

type IUninstallTarget = IDaoPlugin | IDaoPolicy;

class PreparePluginUninstallationDialogUtils {
    getUninstallTargetName = (
        target: IUninstallTarget,
        params?: { includeSlug?: boolean },
    ): string => {
        const { includeSlug = false } = params ?? {};

        if (policyPluginRegistryUtils.isPolicy(target)) {
            if (target.name && target.name.length > 0) {
                return target.name;
            }

            if (target.policyKey && target.policyKey.length > 0) {
                return target.policyKey.toUpperCase();
            }

            return `Policy #${target.address.slice(-4)}`;
        }

        const pluginName = daoUtils.getPluginName(target);
        return includeSlug
            ? `${pluginName} (${target.slug.toUpperCase()})`
            : pluginName;
    };

    buildPrepareUninstallationTransaction = (
        dao: IDao,
        plugin: IUninstallTarget,
    ): Promise<ITransactionRequest> => {
        const { pluginSetupProcessor } =
            networkDefinitions[dao.network].addresses;

        // Retrieve the plugin-specific helper addresses required to build the prepare-uninstallation transaction. The
        // returned array must exactly match the helper addresses that were defined during installation preparation of
        // the plugin.
        const getHelpersFunction = pluginRegistryUtils.getSlotFunction<
            IGetUninstallHelpersParams,
            Hex[]
        >({
            slotId: SettingsSlotId.SETTINGS_GET_UNINSTALL_HELPERS,
            pluginId: plugin.interfaceType,
        });

        const helpers = policyPluginRegistryUtils.isPolicy(plugin)
            ? []
            : (getHelpersFunction?.({ plugin }) ?? []);
        const prepareUninstallData =
            pluginTransactionUtils.buildPrepareUninstallData(
                dao,
                plugin,
                helpers,
                '0x',
            );

        return Promise.resolve({
            data: prepareUninstallData,
            value: BigInt(0),
            to: pluginSetupProcessor,
        });
    };

    prepareApplyUninstallationProposalMetadata = (
        uninstallPlugin: IUninstallTarget,
        proposalPlugin: IDaoPlugin,
    ) => {
        const isPolicy = policyPluginRegistryUtils.isPolicy(uninstallPlugin);
        const uninstallPluginInfo = this.getUninstallTargetName(
            uninstallPlugin,
            {
                includeSlug: true,
            },
        );
        const proposalPluginInfo = `${daoUtils.getPluginName(proposalPlugin)} (${proposalPlugin.slug.toUpperCase()})`;
        const targetTypeLabel = isPolicy ? 'policy' : 'process';

        const title = `Uninstall ${uninstallPluginInfo} ${targetTypeLabel}`;
        const summary = [
            isPolicy
                ? `If approved, this proposal will uninstall the ${uninstallPluginInfo} policy. It will stop this policy from executing automated capital flows on behalf of the DAO.`
                : `If approved, this proposal will uninstall the ${uninstallPluginInfo} plugin. It will revoke the plugin's permission to execute actions on the DAO's behalf.`,
            "Vote in favor only if you're confident this change is safe for the DAO. The current",
            `${proposalPluginInfo} process will not be affected.`,
        ].join(' ');

        return { title, summary };
    };
}

export const preparePluginUninstallationDialogUtils =
    new PreparePluginUninstallationDialogUtils();
