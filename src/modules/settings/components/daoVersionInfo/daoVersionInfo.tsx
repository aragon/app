import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { addressUtils, ChainEntityType, DefinitionList, IconType, Link, useBlockExplorer } from '@aragon/gov-ui-kit';

export interface IDaoVersionInfoProps {
    /**
     * Dao to display the info for.
     */
    dao: IDao;
}

export const DaoVersionInfo: React.FC<IDaoVersionInfoProps> = (props) => {
    const { dao } = props;
    const { t } = useTranslations();

    const { id: chainId } = networkDefinitions[dao.network];
    const { buildEntityUrl } = useBlockExplorer();

    const processPlugins = useDaoPlugins({ daoId: dao.id, type: PluginType.PROCESS, includeSubPlugins: true });

    return (
        <DefinitionList.Container>
            <DefinitionList.Item term={t('app.settings.daoVersionInfo.osLabel')}>
                <Link
                    description={addressUtils.truncateAddress(dao.address)}
                    iconRight={IconType.LINK_EXTERNAL}
                    href={buildEntityUrl({ type: ChainEntityType.ADDRESS, id: dao.address, chainId })}
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
