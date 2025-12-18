import { addressUtils, ChainEntityType, DefinitionList } from '@aragon/gov-ui-kit';
import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { daoUtils } from '@/shared/utils/daoUtils';

export interface IDaoVersionInfoProps {
    /**
     * Dao to display the info for.
     */
    dao: IDao;
}

export const DaoVersionInfo: React.FC<IDaoVersionInfoProps> = (props) => {
    const { dao } = props;
    const { t } = useTranslations();

    const { buildEntityUrl } = useDaoChain({ network: dao.network });

    const daoLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: dao.address });
    const processPlugins = useDaoPlugins({ daoId: dao.id, includeSubPlugins: true });

    return (
        <DefinitionList.Container>
            <DefinitionList.Item
                copyValue={dao.address}
                description={t('app.settings.daoVersionInfo.osValue', { version: dao.version })}
                link={{ href: daoLink, isExternal: false }}
                term={t('app.settings.daoVersionInfo.osLabel')}
            >
                {addressUtils.truncateAddress(dao.address)}
            </DefinitionList.Item>
            {processPlugins?.map((plugin) => (
                <DefinitionList.Item
                    copyValue={plugin.meta.address}
                    description={t('app.settings.daoVersionInfo.governanceValue', {
                        name: daoUtils.getPluginName(plugin.meta),
                        release: plugin.meta.release,
                        build: plugin.meta.build,
                    })}
                    key={plugin.uniqueId}
                    link={{ href: buildEntityUrl({ type: ChainEntityType.ADDRESS, id: plugin.meta.address }) }}
                    term={daoUtils.getPluginName(plugin.meta)}
                >
                    {addressUtils.truncateAddress(plugin.meta.address)}
                </DefinitionList.Item>
            ))}
        </DefinitionList.Container>
    );
};
