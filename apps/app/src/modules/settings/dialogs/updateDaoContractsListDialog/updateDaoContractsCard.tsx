import { AddressOutput, DataList, Link } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IContractVersionInfo } from '@/shared/types';
import {
    type IVersion,
    versionComparatorUtils,
} from '@/shared/utils/versionComparatorUtils';

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

export const UpdateDaoContractsCard: React.FC<IUpdateDaoContractsCardProps> = (
    props,
) => {
    const { name, smartContractName, address, currentVersion, newVersion } =
        props;

    const { t } = useTranslations();

    const processedCurrentVersion =
        versionComparatorUtils.normaliseComparatorInput(currentVersion)!;
    const { release: currentRelease, build: currentBuild } =
        processedCurrentVersion;
    const { release: newRelease, build: newBuild } = newVersion;

    const fromVersion = `${smartContractName} v${currentRelease.toString()}.${currentBuild.toString()}`;
    const toVersion = `${smartContractName} v${newRelease.toString()}.${newBuild.toString()}`;

    return (
        <DataList.Item className="flex flex-col gap-group-stepped py-inset-item--16-24">
            <div className="flex flex-col gap-tight--4-6">
                <div className="flex items-center justify-between">
                    <p className="text-base text-surface-primary md:text-lg">
                        {name}
                    </p>
                    <AddressOutput
                        address={address}
                        className="text-base text-surface-secondary md:text-lg"
                        copy={false}
                    />
                </div>
                <p className="text-sm text-surface-secondary md:text-base">
                    {t('app.settings.updateDaoContractsCard.versionUpdate', {
                        from: fromVersion,
                        to: toVersion,
                    })}
                </p>
            </div>
            <Link href={newVersion.releaseNotes} isExternal={true}>
                {t('app.settings.updateDaoContractsCard.releaseNotes')}
            </Link>
        </DataList.Item>
    );
};
