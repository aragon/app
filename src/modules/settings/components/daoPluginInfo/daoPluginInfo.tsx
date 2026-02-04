import { Button, DefinitionList } from '@aragon/gov-ui-kit';
import { useDao } from '@/shared/api/daoService';
import { DaoTargetIndicator } from '@/shared/components/daoTargetIndicator';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginInfo } from '@/shared/hooks/useDaoPluginInfo';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { IDaoPlugInfoProps } from './daoPluginInfo.api';
import { DaoPluginInfoMetadata } from './daoPluginInfoMetadata';

export const daoPluginInfoFilterParam = 'plugin';

export const DaoPluginInfo: React.FC<IDaoPlugInfoProps> = (props) => {
    const { plugin, daoId } = props;

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const { t } = useTranslations();

    const { description, links } = plugin;

    const pluginInfo = useDaoPluginInfo({ daoId, address: plugin.address });

    const processLink = daoUtils.getDaoUrl(dao, `settings/${plugin.slug}`);

    const hasSubDaos = (dao?.subDaos?.length ?? 0) > 0;

    return (
        <div className="flex flex-col gap-y-4">
            <DaoPluginInfoMetadata description={description} links={links} />
            <DefinitionList.Container>
                {hasSubDaos && (
                    <DefinitionList.Item
                        term={t('app.settings.daoPluginInfo.targetDao')}
                    >
                        <DaoTargetIndicator dao={dao} plugin={plugin} />
                    </DefinitionList.Item>
                )}
                {pluginInfo.map(({ term, definition, ...other }) => (
                    <DefinitionList.Item key={term} term={term} {...other}>
                        {definition}
                    </DefinitionList.Item>
                ))}
            </DefinitionList.Container>
            {!plugin.isSubPlugin && plugin.isProcess && (
                <Button href={processLink} variant="tertiary">
                    {t('app.settings.daoPluginInfo.viewProcess')}
                </Button>
            )}
        </div>
    );
};
