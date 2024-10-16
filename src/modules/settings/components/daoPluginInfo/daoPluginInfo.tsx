import { type IDaoPlugin } from '@/shared/api/daoService';
import { IResource } from '@/shared/api/daoService/domain/resource';

import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { PluginType } from '@/shared/types';
import { addressUtils, DateFormat, DefinitionList, formatterUtils, IconType, Link } from '@aragon/ods';

export interface IDaoPlugInfoProps {
    /**
     * The DAO plugin to display information for.
     */
    plugin: IDaoPlugin;
    /**
     * The type of plugin.
     */
    type: PluginType;
}

export const DaoPluginInfo: React.FC<IDaoPlugInfoProps> = (props) => {
    const { plugin, type } = props;

    const { t } = useTranslations();

    return (
        <Page.Section
            title={t('app.governance.daoProposalsPage.aside.details.title')}
            inset={false}
            className="gap-y-4"
        >
            {type === PluginType.PROCESS && (
                <>
                    <p className="text-neutral-500">{plugin.description}</p>
                    {plugin.resources?.map((resource: IResource, index: number) => (
                        <div key={index}>
                            <Link href={resource.url} target="_blank" iconRight={IconType.LINK_EXTERNAL}>
                                {resource.name}
                            </Link>
                            <p className="truncate">{resource.url}</p>
                        </div>
                    ))}
                    <DefinitionList.Container>
                        <DefinitionList.Item term={t('Process name')}>{plugin.name}</DefinitionList.Item>
                        <DefinitionList.Item term={t('Process key')} className="text-neutral-500">
                            <p className="text-neutral-500"> {plugin.processKey}</p>
                        </DefinitionList.Item>
                        <DefinitionList.Item term={t('Plugin')}>
                            <Link className="capitalize" href="/" iconRight={IconType.LINK_EXTERNAL}>
                                {plugin.subdomain}
                            </Link>
                            <p className="text-neutral-500">{addressUtils.truncateAddress(plugin.address)}</p>
                        </DefinitionList.Item>
                        <DefinitionList.Item term="Launched at">
                            <Link href="/" target="_blank" iconRight={IconType.LINK_EXTERNAL}>
                                {formatterUtils.formatDate(plugin.blockTimestamp * 1000, {
                                    format: DateFormat.YEAR_MONTH,
                                })}
                            </Link>
                        </DefinitionList.Item>
                    </DefinitionList.Container>
                </>
            )}
            {type === PluginType.BODY && (
                <>
                    <p className="text-neutral-500">{plugin.description}</p>
                    {plugin.resources?.map((resource: IResource, index: number) => (
                        <div key={index}>
                            <Link href={resource.url} target="_blank" iconRight={IconType.LINK_EXTERNAL}>
                                {resource.name}
                            </Link>
                            <p className="truncate">{resource.url}</p>
                        </div>
                    ))}
                    <DefinitionList.Container>
                        <DefinitionList.Item term={t('Body Name')}>{plugin.name}</DefinitionList.Item>
                        <DefinitionList.Item term={t('Plugin')}>
                            <Link className="capitalize" href="/" iconRight={IconType.LINK_EXTERNAL}>
                                {plugin.subdomain}
                            </Link>
                            <p className="text-neutral-500">{addressUtils.truncateAddress(plugin.address)}</p>
                        </DefinitionList.Item>
                        <DefinitionList.Item term="Launched at">
                            <Link href="/" target="_blank" iconRight={IconType.LINK_EXTERNAL}>
                                {formatterUtils.formatDate(plugin.blockTimestamp * 1000, {
                                    format: DateFormat.YEAR_MONTH,
                                })}
                            </Link>
                        </DefinitionList.Item>
                    </DefinitionList.Container>
                </>
            )}
        </Page.Section>
    );
};
