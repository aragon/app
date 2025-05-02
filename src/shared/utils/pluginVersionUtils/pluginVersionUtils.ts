import type { IPluginSetupVersionTag } from '../pluginTransactionUtils';

export type Version = IPluginSetupVersionTag | { release: string; build: string } | undefined;

class PluginVersionUtils {
    isLessThan = (current: Version, target: Version) => this.compareVersions(current, target) < 0;
    isGreaterThan = (current: Version, target: Version) => this.compareVersions(current, target) > 0;
    isGreaterOrEqualTo = (current: Version, target: Version) => this.compareVersions(current, target) >= 0;

    private normaliseVersion = (version: Version) => ({
        release: Number(version?.release ?? 0),
        build: Number(version?.build ?? 0),
    });

    private compareVersions = (current?: Version, target?: Version) => {
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
