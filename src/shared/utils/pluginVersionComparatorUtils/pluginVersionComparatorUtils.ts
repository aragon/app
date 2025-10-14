import type { IDaoPlugin } from '../../api/daoService';
import { type IVersion, versionComparatorUtils } from '../versionComparatorUtils';

class PluginVersionComparatorUtils {
    isGreaterOrEqualTo = (plugin: IDaoPlugin, version: IVersion) => {
        const normalisedPluginVersion = versionComparatorUtils.normaliseComparatorInput({
            build: plugin.build,
            release: plugin.release,
        });
        const isGreaterOrEqual = versionComparatorUtils.isGreaterOrEqualTo(normalisedPluginVersion, version);

        return isGreaterOrEqual;
    };
}

export const pluginVersionComparatorUtils = new PluginVersionComparatorUtils();
