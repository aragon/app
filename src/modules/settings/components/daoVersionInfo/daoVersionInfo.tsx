import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { daoUtils } from '@/shared/utils/daoUtils';
import { addressUtils, ChainEntityType, DefinitionList } from '@aragon/gov-ui-kit';

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
                term={t('app.settings.daoVersionInfo.osLabel')}
                description={t('app.settings.daoVersionInfo.osValue', { version: dao.version })}
                copyValue={dao.address}
                link={{ href: daoLink, isExternal: false }}
            >
                {addressUtils.truncateAddress(dao.address)}
            </DefinitionList.Item>
            {processPlugins?.map((plugin) => (
                <DefinitionList.Item
                    key={plugin.uniqueId}
                    term={daoUtils.getPluginName(plugin.meta)}
                    copyValue={plugin.meta.address}
                    link={{ href: buildEntityUrl({ type: ChainEntityType.ADDRESS, id: plugin.meta.address }) }}
                    description={t('app.settings.daoVersionInfo.governanceValue', {
                        name: daoUtils.getPluginName(plugin.meta),
                        release: plugin.meta.release,
                        build: plugin.meta.build,
                    })}
                >
                    {addressUtils.truncateAddress(plugin.meta.address)}
                </DefinitionList.Item>
            ))}
        </DefinitionList.Container>
    );
};
