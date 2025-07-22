import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginInfo } from '@/shared/hooks/useDaoPluginInfo';
import { daoUtils } from '@/shared/utils/daoUtils';
import { Button, DefinitionList } from '@aragon/gov-ui-kit';
import { type IDaoPlugInfoProps } from './daoPluginInfo.api';
import { DaoPluginInfoMetadata } from './daoPluginInfoMetadata';

export const daoPluginInfoFilterParam = 'plugin';

export const DaoPluginInfo: React.FC<IDaoPlugInfoProps> = (props) => {
    const { plugin, daoId } = props;

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const { t } = useTranslations();

    const { description, links } = plugin;

    const pluginInfo = useDaoPluginInfo({ daoId, address: plugin.address });

    const processLink = daoUtils.getDaoUrl(dao, `settings/${plugin.slug}`);

    return (
        <div className="flex flex-col gap-y-4">
            <DaoPluginInfoMetadata description={description} links={links} />
            <DefinitionList.Container>
                {pluginInfo.map(({ term, definition, ...other }) => (
                    <DefinitionList.Item key={term} term={term} {...other}>
                        {definition}
                    </DefinitionList.Item>
                ))}
            </DefinitionList.Container>
            {!plugin.isSubPlugin && plugin.isProcess && (
                <Button variant="tertiary" href={processLink}>
                    {t('app.settings.daoPluginInfo.viewProcess')}
                </Button>
            )}
        </div>
    );
};
