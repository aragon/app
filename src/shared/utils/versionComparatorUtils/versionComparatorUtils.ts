import type { ComparatorArgs, ComparatorInput, IVersion } from './versionComparatorUtils.api';

class VersionComparatorUtils {
    isLessThan = (...args: ComparatorArgs): boolean => this.compareVersions(...args, (diff) => diff < 0);

    isGreaterThan = (...args: ComparatorArgs): boolean => this.compareVersions(...args, (diff) => diff > 0);

    isGreaterOrEqualTo = (...args: ComparatorArgs) => this.compareVersions(...args, (diff) => diff >= 0);

    private compareVersions = (
        current: ComparatorInput,
        target: ComparatorInput,
        comparator: (diff: number) => boolean,
    ): boolean => {
        const currentVersion = this.normaliseComparatorInput(current);
        const targetVersion = this.normaliseComparatorInput(target);

        if (currentVersion == null || targetVersion == null) {
            return false;
        }

        const versionDiff = this.getVersionDiff(currentVersion, targetVersion);

        return comparator(versionDiff);
    };

    private getVersionDiff = (current: IVersion, target: IVersion): number => {
        const { release: currentRelease, build: currentBuild } = current;
        const { release: targetRelease, build: targetBuild } = target;

        return currentRelease !== targetRelease ? currentRelease - targetRelease : currentBuild - targetBuild;
    };

    normaliseComparatorInput = (input: ComparatorInput): IVersion | undefined => {
        if (input == null) {
            return undefined;
        } else if (typeof input === 'string') {
            return this.normaliseStringVersion(input);
        }

        return this.normaliseVersion(input);
    };

    private normaliseStringVersion = (version: string): IVersion => {
        const [release, build] = version.split('.');

        return this.normaliseVersion({ release, build });
    };

    private normaliseVersion = (version: IVersion<string> | IVersion): IVersion => {
        const { release, build } = version;

        return { release: Number(release), build: Number(build) };
    };
}

export const versionComparatorUtils = new VersionComparatorUtils();
