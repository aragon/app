import type { IDaoPlugin } from '@/shared/api/daoService';
import type { IPluginInfo } from '@/shared/types';
import { pluginRegistryUtils } from '../pluginRegistryUtils';
import type { IPluginSetupVersionTag } from '../pluginTransactionUtils';

class PluginVersionUtils {
    compareVersions(current: IPluginSetupVersionTag, target: IPluginSetupVersionTag) {
        const diff =
            current.release !== target.release ? current.release - target.release : current.build - target.build;

        return {
            isEqual: diff === 0,
            isLessThan: diff < 0,
            isGreaterThan: diff > 0,
        };
    }

    needsUpgrade(plugin: IDaoPlugin) {
        const current = {
            release: Number(plugin.release),
            build: Number(plugin.build),
        };

        const target = pluginRegistryUtils.getPlugin(plugin.subdomain) as IPluginInfo | undefined;

        if (!target) {
            return false;
        }

        const { isLessThan } = this.compareVersions(current, target.installVersion);

        return isLessThan;
    }
}

export const pluginVersionUtils = new PluginVersionUtils();
