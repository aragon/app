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

    const pluginInfo = useDaoPluginInfo({
        daoId: dao.id,
        address: plugin.address,
    });

    const [pluginDefinition, launchedAtDefinition] = pluginInfo;

    return (
        <DefinitionList.Container>
            <DefinitionList.Item term={t('app.settings.daoProcessDetailsPage.aside.pluginName')}>
                <p className="text-neutral-500">{daoUtils.getPluginName(plugin)}</p>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.settings.daoProcessDetailsPage.aside.processKey')}>
                <p className="text-neutral-500">{plugin.slug.toUpperCase()}</p>
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.settings.daoProcessDetailsPage.aside.pluginAddress')}
                copyValue={pluginDefinition.copyValue}
                link={pluginDefinition.link}
                description={pluginDefinition.description}
            >
                {pluginDefinition.definition}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.settings.daoProcessDetailsPage.aside.launchedAt')}
                link={launchedAtDefinition.link}
            >
                {launchedAtDefinition.definition}
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
