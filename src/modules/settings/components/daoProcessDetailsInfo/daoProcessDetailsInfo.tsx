import type { ISppPluginSettings } from '@/plugins/sppPlugin/types';
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

    const stageCount = (plugin as IDaoPlugin<ISppPluginSettings>).settings.stages.length;
    const hasStages = stageCount > 0;

    const settings = useDaoPluginInfo({
        daoId: dao.id,
        address: plugin.address,
        settings: [
            {
                term: t('app.settings.daoProcessDetailsPage.aside.pluginName'),
                definition: daoUtils.getPluginName(plugin),
            },
            {
                term: t('app.settings.daoProcessDetailsPage.aside.processKey'),
                definition: plugin.slug.toUpperCase(),
            },
            ...(hasStages
                ? [
                      {
                          term: t('app.settings.daoProcessDetailsPage.aside.stages'),
                          definition: stageCount.toString(),
                      },
                  ]
                : []),
        ],
    });

    const [pluginDefinition, launchedAtDefinition, ...customSettings] = settings;
    const orderedSettings = [...customSettings, pluginDefinition, launchedAtDefinition];

    return (
        <DefinitionList.Container>
            {orderedSettings.map(({ term, definition, description, link, copyValue }) => (
                <DefinitionList.Item key={term} term={term} description={description} link={link} copyValue={copyValue}>
                    {definition}
                </DefinitionList.Item>
            ))}
        </DefinitionList.Container>
    );
};
