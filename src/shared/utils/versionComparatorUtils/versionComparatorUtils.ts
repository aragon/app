import type { ComparatorArgs, ComparatorInput, IVersion } from './versionComparatorUtils.api';

class VersionComparatorUtils {
    isLessThan = (...args: ComparatorArgs): boolean => this.compareVersions(...args, (diff) => diff < 0);

    isGreaterThan = (...args: ComparatorArgs): boolean => this.compareVersions(...args, (diff) => diff > 0);

    isGreaterOrEqualTo = (...args: ComparatorArgs) => this.compareVersions(...args, (diff) => diff >= 0);

    normaliseComparatorInput = (input: ComparatorInput): IVersion | undefined => {
        if (input == null) {
            return undefined;
        } else if (typeof input === 'string') {
            return this.normaliseStringVersion(input);
        }

        return this.normaliseVersion(input);
    };

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
        const keys: Array<keyof IVersion> = ['release', 'build', 'patch'];

        for (const key of keys) {
            const firstValue = current[key] ?? 0;
            const secondValue = target[key] ?? 0;

            if (firstValue > secondValue) {
                return 1;
            } else if (firstValue < secondValue) {
                return -1;
            }
        }

        return 0;
    };

    private normaliseStringVersion = (version: string): IVersion => {
        const [release, build, patch] = version.split('.');

        return this.normaliseVersion({ release, build, patch });
    };

    private normaliseVersion = (version: IVersion<string> | IVersion): IVersion => {
        const { release, build, patch } = version;
        const normalizedVersion: IVersion = { release: Number(release), build: Number(build) };

        if (patch) {
            normalizedVersion.patch = Number(patch);
        }

        return normalizedVersion;
    };
}

export const versionComparatorUtils = new VersionComparatorUtils();
