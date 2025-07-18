import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginInfo } from '@/shared/hooks/useDaoPluginInfo';
import { Button, DefinitionList } from '@aragon/gov-ui-kit';
import { type IDaoPlugInfoProps } from './daoPluginInfo.api';
import { DaoPluginInfoMetadata } from './daoPluginInfoMetadata';

export const daoPluginInfoFilterParam = 'plugin';

export const DaoPluginInfo: React.FC<IDaoPlugInfoProps> = (props) => {
    const { plugin, daoId } = props;

    const { t } = useTranslations();

    const { description, links } = plugin;

    const pluginInfo = useDaoPluginInfo({ daoId, address: plugin.address });

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
            <Button variant="tertiary">{t('app.settings.daoPluginInfo.viewProcess')}</Button>
        </div>
    );
};
