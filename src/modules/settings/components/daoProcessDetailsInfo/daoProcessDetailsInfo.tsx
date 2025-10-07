import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginInfo } from '@/shared/hooks/useDaoPluginInfo';
import { daoUtils } from '@/shared/utils/daoUtils';
import { DefinitionList } from '@aragon/gov-ui-kit';

export interface IDaoProcessDetailsInfoProps {
    /**
     * The DAO plugin associated with the process details.
     */
    plugin: IDaoPlugin;
    /**
     * The DAO associated with the process details.
     */
    dao: IDao;
}

export const DaoProcessDetailsInfo: React.FC<IDaoProcessDetailsInfoProps> = (props) => {
    const { plugin, dao } = props;

    const { t } = useTranslations();

    const pluginInfoSettings = [
        { term: t('app.settings.daoProcessDetailsInfo.pluginName'), definition: daoUtils.getPluginName(plugin) },
        { term: t('app.settings.daoProcessDetailsInfo.processKey'), definition: plugin.slug.toUpperCase() },
    ];

    const { id: daoId } = dao;
    const settings = useDaoPluginInfo({ daoId, address: plugin.address, settings: pluginInfoSettings });

    const [pluginDefinition, launchedAtDefinition, ...customSettings] = settings;
    const orderedSettings = [...customSettings, pluginDefinition, launchedAtDefinition];

    return (
        <div className="flex flex-col gap-6">
            <DefinitionList.Container>
                {orderedSettings.map(({ term, definition, ...setting }) => (
                    <DefinitionList.Item key={term} term={term} {...setting}>
                        {definition}
                    </DefinitionList.Item>
                ))}
            </DefinitionList.Container>
        </div>
    );
};
