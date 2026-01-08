import type { IDaoPlugin } from '../../api/daoService';
import {
    type IVersion,
    versionComparatorUtils,
} from '../versionComparatorUtils';

class PluginMetaUtils {
    isVersionGreaterOrEqualTo = (plugin: IDaoPlugin, version: IVersion) => {
        const normalisedPluginVersion =
            versionComparatorUtils.normaliseComparatorInput({
                build: plugin.build,
                release: plugin.release,
            });
        const isGreaterOrEqual = versionComparatorUtils.isGreaterOrEqualTo(
            normalisedPluginVersion,
            version,
        );

        return isGreaterOrEqual;
    };
}

export const pluginMetaUtils = new PluginMetaUtils();
