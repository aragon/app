import { useTranslations } from '@/shared/components/translationsProvider';
import type { IContractVersionInfo } from '@/shared/types';
import { versionComparatorUtils, type IVersion } from '@/shared/utils/versionComparatorUtils';
import { addressUtils, DataList, Link } from '@aragon/gov-ui-kit';

export interface IUpdateDaoContractsCardProps {
    /**
     * Name of the update.
     */
    name: string;
    /**
     * Name of the smart contract.
     */
    smartContractName: string;
    /**
     * Address of the contract.
     */
    address: string;
    /**
     * Current installed version of the contract.
     */
    currentVersion: IVersion<string> | string;
    /**
     * Information about the new version to be installed.
     */
    newVersion: IContractVersionInfo;
}

export const UpdateDaoContractsCard: React.FC<IUpdateDaoContractsCardProps> = (props) => {
    const { name, smartContractName, address, currentVersion, newVersion } = props;

    const { t } = useTranslations();

    const processedCurrentVersion = versionComparatorUtils.normaliseComparatorInput(currentVersion)!;
    const { release: currentRelease, build: currentBuild } = processedCurrentVersion;
    const { release: newRelease, build: newBuild } = newVersion;

    const fromVersion = `${smartContractName} v${currentRelease.toString()}.${currentBuild.toString()}`;
    const toVersion = `${smartContractName} v${newRelease.toString()}.${newBuild.toString()}`;

    return (
        <DataList.Item className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex flex-col gap-1 md:gap-1.5">
                <div className="flex items-center justify-between">
                    <p className="text-base text-neutral-800 md:text-lg">{name}</p>
                    <p className="text-base text-neutral-500 md:text-lg">{addressUtils.truncateAddress(address)}</p>
                </div>
                <p className="text-sm text-neutral-500 md:text-base">
                    {t('app.settings.updateDaoContractsCard.versionUpdate', { from: fromVersion, to: toVersion })}
                </p>
            </div>
            <Link href={newVersion.releaseNotes} isExternal={true}>
                {t('app.settings.updateDaoContractsCard.releaseNotes')}
            </Link>
        </DataList.Item>
    );
};
