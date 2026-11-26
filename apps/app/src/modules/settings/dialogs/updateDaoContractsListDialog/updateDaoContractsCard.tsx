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
        <DataList.Item className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex flex-col gap-1 md:gap-1.5">
                <div className="flex items-center justify-between">
                    <p className="type-title-item--framework-leading text-surface-primary">
                        {name}
                    </p>
                    <AddressOutput
                        address={address}
                        className="type-supporting--framework-leading-large text-surface-secondary"
                        copy={false}
                    />
                </div>
                <p className="type-supporting--framework-leading text-surface-secondary">
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
