import type { IPluginSetupVersionTag } from '../pluginTransactionUtils';

class PluginVersionUtils {
    compareVersions(current: IPluginSetupVersionTag, target: IPluginSetupVersionTag) {
        let result;

        if (current.release > target.release) {
            result = 1;
        } else if (current.release < target.release) {
            result = -1;
        } else if (current.build > target.build) {
            result = 1;
        } else if (current.build < target.build) {
            result = -1;
        } else {
            result = 0;
        }

        return {
            isEqual: result === 0,
            isLessThan: result === -1,
            isGreaterThan: result === 1,
        };
    }
}

export const pluginVersionUtils = new PluginVersionUtils();
