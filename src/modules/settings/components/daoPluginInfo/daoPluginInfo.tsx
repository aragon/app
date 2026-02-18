import {
    addressUtils,
    Button,
    ChainEntityType,
    DefinitionList,
} from '@aragon/gov-ui-kit';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useDaoPluginInfo } from '@/shared/hooks/useDaoPluginInfo';
import { daoTargetUtils } from '@/shared/utils/daoTargetUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { IDaoPlugInfoProps } from './daoPluginInfo.api';
import { DaoPluginInfoMetadata } from './daoPluginInfoMetadata';

export const daoPluginInfoFilterParam = 'plugin';

export const DaoPluginInfo: React.FC<IDaoPlugInfoProps> = (props) => {
    const { plugin, daoId } = props;

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const { t } = useTranslations();
    const { buildEntityUrl } = useDaoChain({ network: dao?.network });

    const { description, links } = plugin;

    const pluginInfo = useDaoPluginInfo({ daoId, address: plugin.address });

    const processLink = daoUtils.getDaoUrl(dao, `settings/${plugin.slug}`);

    const hasSubDaos = (dao?.subDaos?.length ?? 0) > 0;

    const targetAddress = plugin.daoAddress ?? dao?.address;
    const targetName =
        hasSubDaos && targetAddress != null && dao != null
            ? daoTargetUtils.findTargetDao({ dao, targetAddress })?.name
            : undefined;

    // Split plugin info: [pluginDefinition, launchedAt, ...rest]
    const [pluginDefinition, launchedAtDefinition, ...restSettings] =
        pluginInfo;

    return (
        <div className="flex flex-col gap-y-4">
            <DaoPluginInfoMetadata description={description} links={links} />
            <DefinitionList.Container>
                {/* Plugin address */}
                {pluginDefinition != null && (
                    <DefinitionList.Item
                        copyValue={pluginDefinition.copyValue}
                        description={pluginDefinition.description}
                        key={pluginDefinition.term}
                        link={pluginDefinition.link}
                        term={pluginDefinition.term}
                    >
                        {pluginDefinition.definition}
                    </DefinitionList.Item>
                )}

                {/* Target */}
                {hasSubDaos && targetAddress != null && (
                    <DefinitionList.Item
                        copyValue={targetAddress}
                        description={targetName}
                        link={{
                            href: buildEntityUrl({
                                type: ChainEntityType.ADDRESS,
                                id: targetAddress,
                            }),
                            isExternal: true,
                        }}
                        term={t('app.settings.daoPolicyDetailsInfo.target')}
                    >
                        {addressUtils.truncateAddress(targetAddress)}
                    </DefinitionList.Item>
                )}

                {/* Launched */}
                {launchedAtDefinition != null && (
                    <DefinitionList.Item
                        key={launchedAtDefinition.term}
                        link={launchedAtDefinition.link}
                        term={launchedAtDefinition.term}
                    >
                        {launchedAtDefinition.definition}
                    </DefinitionList.Item>
                )}

                {/* Additional settings */}
                {restSettings.map(({ term, definition, ...other }) => (
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
