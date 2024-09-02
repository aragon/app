import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useApplicationVersion } from '@/shared/hooks/useApplicationVersion';
import { daoUtils } from '@/shared/utils/daoUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { addressUtils, ChainEntityType, DefinitionList, IconType, Link, useBlockExplorer } from '@aragon/ods';

export interface IDaoVersionInfoProps {
    /**
     * Dao Object.
     */
    dao: IDao;
}

export const DaoVersionInfo: React.FC<IDaoVersionInfoProps> = (props) => {
    const { dao } = props;
    const { t } = useTranslations();

    const chainId = networkDefinitions[dao.network].chainId;
    const { buildEntityUrl } = useBlockExplorer();

    const supportedPlugin = dao.plugins.find((plugin) => pluginRegistryUtils.getPlugin(plugin.subdomain) != null);
    const pluginLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: supportedPlugin?.address, chainId });

    const version = useApplicationVersion();

    return (
        <DefinitionList.Container>
            <DefinitionList.Item term={t('app.settings.daoVersionInfo.app')}>
                <Link href="/" iconRight={IconType.LINK_EXTERNAL} target="_blank">
                    {version}
                </Link>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.settings.daoVersionInfo.osLabel')}>
                {/* TODO: Fetch this operating system value from backend when available (APP-3484) */}
                <Link
                    description={addressUtils.truncateAddress(dao.address)}
                    iconRight={IconType.LINK_EXTERNAL}
                    href=""
                    target="_blank"
                >
                    {t('app.settings.daoVersionInfo.osValue')}
                </Link>
            </DefinitionList.Item>
            {supportedPlugin && (
                <DefinitionList.Item term={t('app.settings.daoVersionInfo.governanceLabel')}>
                    <Link
                        description={addressUtils.truncateAddress(supportedPlugin.address)}
                        iconRight={IconType.LINK_EXTERNAL}
                        href={pluginLink}
                        target="_blank"
                    >
                        {t('app.settings.daoVersionInfo.governanceValue', {
                            name: daoUtils.formatPluginName(supportedPlugin.subdomain),
                            release: supportedPlugin.release,
                            build: supportedPlugin.build,
                        })}
                    </Link>
                </DefinitionList.Item>
            )}
        </DefinitionList.Container>
    );
};
