import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useApplicationVersion } from '@/shared/hooks/useApplicationVersion';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { addressUtils, ChainEntityType, DefinitionList, IconType, Link, useBlockExplorer } from '@aragon/ods';

export interface IDaoVersionInfoProps {
    /**
     * Dao to display the info for.
     */
    dao: IDao;
}

export const DaoVersionInfo: React.FC<IDaoVersionInfoProps> = (props) => {
    const { dao } = props;
    const { t } = useTranslations();

    const chainId = networkDefinitions[dao.network].chainId;
    const { buildEntityUrl } = useBlockExplorer();

    const processPlugins = useDaoPlugins({ daoId: dao.id, type: PluginType.PROCESS });

    const version = useApplicationVersion();

    return (
        <DefinitionList.Container>
            <DefinitionList.Item term={t('app.settings.daoVersionInfo.app')}>
                <Link href="/" iconRight={IconType.LINK_EXTERNAL} target="_blank">
                    {version}
                </Link>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.settings.daoVersionInfo.osLabel')}>
                <Link
                    description={addressUtils.truncateAddress(dao.address)}
                    iconRight={IconType.LINK_EXTERNAL}
                    href=""
                    target="_blank"
                >
                    {t('app.settings.daoVersionInfo.osValue', { version: dao.version })}
                </Link>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.settings.daoVersionInfo.governanceLabel')}>
                <div className="flex flex-col gap-3">
                    {processPlugins?.map((plugin) => (
                        <Link
                            key={plugin.uniqueId}
                            description={addressUtils.truncateAddress(plugin.meta.address)}
                            iconRight={IconType.LINK_EXTERNAL}
                            href={buildEntityUrl({ type: ChainEntityType.ADDRESS, id: plugin.meta.address, chainId })}
                            target="_blank"
                        >
                            {t('app.settings.daoVersionInfo.governanceValue', {
                                name: daoUtils.getPluginName(plugin.meta),
                                release: plugin.meta.release,
                                build: plugin.meta.build,
                            })}
                        </Link>
                    ))}
                </div>
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
