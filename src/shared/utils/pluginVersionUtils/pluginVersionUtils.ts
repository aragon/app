export interface IPluginVersion {
    /**
     * The release of the plugin.
     */
    release: string | number;
    /**
     * The build of the plugin.
     */
    build: string | number;
}

class PluginVersionUtils {
    isLessThan = (current?: IPluginVersion, target?: IPluginVersion) => {
        if (!current || !target) {
            return false;
        }

        return this.compareVersions(current, target) < 0;
    };
    isGreaterThan = (current?: IPluginVersion, target?: IPluginVersion) => {
        if (!current || !target) {
            return false;
        }

        return this.compareVersions(current, target) > 0;
    };
    isGreaterOrEqualTo = (current?: IPluginVersion, target?: IPluginVersion) => {
        if (!current || !target) {
            return false;
        }

        return this.compareVersions(current, target) >= 0;
    };

    private normaliseVersion = (version: IPluginVersion) => ({
        release: Number(version.release),
        build: Number(version.build),
    });

    private compareVersions = (current: IPluginVersion, target: IPluginVersion) => {
        const currentVersion = this.normaliseVersion(current);
        const targetVersion = this.normaliseVersion(target);

        const diff =
            currentVersion.release !== targetVersion.release
                ? currentVersion.release - targetVersion.release
                : currentVersion.build - targetVersion.build;

        return diff;
    };
}

export const pluginVersionUtils = new PluginVersionUtils();
