import { type IDaoPlugin } from '@/shared/api/daoService';
import { type IResource } from '@/shared/api/daoService/domain/resource';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    addressUtils,
    ChainEntityType,
    DateFormat,
    DefinitionList,
    formatterUtils,
    IconType,
    Link,
    useBlockExplorer,
} from '@aragon/ods';

export interface IDaoPlugInfoProps {
    /**
     * The DAO plugin to display information for.
     */
    plugin: IDaoPlugin;
    /**
     * The type of plugin.
     */
    type: PluginType;
    /**
     * The DAO ID.
     */
    daoId: string;
}

export const DaoPluginInfo: React.FC<IDaoPlugInfoProps> = (props) => {
    const { plugin, type, daoId } = props;

    const { t } = useTranslations();

    const chainId = networkDefinitions[daoUtils.getNetwork(daoId)].chainId;
    const { buildEntityUrl } = useBlockExplorer();

    return (
        <Page.Section
            title={t('app.governance.daoProposalsPage.aside.details.title')}
            inset={false}
            className="gap-y-4"
        >
            <p className="text-neutral-500">{plugin.description}</p>
            {plugin.resources?.map((resource: IResource, index: number) => (
                <div key={index}>
                    <Link
                        description={resource.url}
                        href={resource.url}
                        target="_blank"
                        iconRight={IconType.LINK_EXTERNAL}
                    >
                        {resource.name}
                    </Link>
                </div>
            ))}
            <DefinitionList.Container>
                <DefinitionList.Item term={t(type === PluginType.PROCESS ? 'Process name' : 'Body Name')}>
                    {plugin.name}
                </DefinitionList.Item>
                {type === PluginType.PROCESS && (
                    <DefinitionList.Item term={t('Process key')} className="text-neutral-500">
                        <p className="text-neutral-500"> {plugin.processKey}</p>
                    </DefinitionList.Item>
                )}
                <DefinitionList.Item term={t('Plugin')}>
                    <Link
                        description={addressUtils.truncateAddress(plugin.address)}
                        iconRight={IconType.LINK_EXTERNAL}
                        href={buildEntityUrl({ type: ChainEntityType.ADDRESS, id: plugin.address, chainId })}
                        target="_blank"
                    >
                        {t('app.settings.daoVersionInfo.governanceValue', {
                            name: daoUtils.getPluginName(plugin),
                            release: plugin.release,
                            build: plugin.build,
                        })}
                    </Link>
                </DefinitionList.Item>
                <DefinitionList.Item term="Launched at">
                    <Link href="/" target="_blank" iconRight={IconType.LINK_EXTERNAL}>
                        {formatterUtils.formatDate(plugin.blockTimestamp * 1000, {
                            format: DateFormat.YEAR_MONTH,
                        })}
                    </Link>
                </DefinitionList.Item>
            </DefinitionList.Container>
        </Page.Section>
    );
};
