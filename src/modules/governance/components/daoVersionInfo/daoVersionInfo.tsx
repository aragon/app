import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useApplicationVersion } from '@/shared/hooks/useApplicationVersion';
import { addressUtils, ChainEntityType, DefinitionList, Heading, IconType, Link, useBlockExplorer } from '@aragon/ods';

export interface IDaVersionInfoProps {
    /**
     * Dao Object.
     */
    dao: IDao;
}

export const DaoVersionInfo: React.FC<IDaVersionInfoProps> = (props) => {
    const { dao } = props;
    const { t } = useTranslations();

    const { version, env, versionLabel } = useApplicationVersion();

    const chainId = dao ? networkDefinitions[dao.network].chainId : undefined;
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    return (
        <div className="flex w-full flex-col gap-2">
            <Heading size="h3">{t('app.governance.daoSettingsPage.aside.daoVersionInfo.title')}</Heading>
            <DefinitionList.Container>
                <DefinitionList.Item term={t('app.governance.daoSettingsPage.aside.daoVersionInfo.app')}>
                    <Link href="/" iconRight={IconType.LINK_EXTERNAL}>
                        {t(`app.application.applicationTags.${versionLabel}`, { version, env })}
                    </Link>
                </DefinitionList.Item>
                <DefinitionList.Item term={t('app.governance.daoSettingsPage.aside.daoVersionInfo.osLabel')}>
                    {/* TODO: Fetch this operating system value from backend when available (APP-3484) */}
                    <Link
                        description={addressUtils.truncateAddress(dao.address)}
                        iconRight={IconType.LINK_EXTERNAL}
                        href=""
                        target="_blank"
                    >
                        {t('app.governance.daoSettingsPage.aside.daoVersionInfo.osValue', {
                            os: 'Aragon OSx',
                        })}
                    </Link>
                </DefinitionList.Item>
                <DefinitionList.Item term={t('app.governance.daoSettingsPage.aside.daoVersionInfo.governanceLabel')}>
                    <Link
                        description={addressUtils.truncateAddress(dao.plugins[0].address)}
                        iconRight={IconType.LINK_EXTERNAL}
                        href={buildEntityUrl({ type: ChainEntityType.ADDRESS, id: dao.plugins[0].address })}
                    >
                        {t('app.governance.daoSettingsPage.aside.daoVersionInfo.governanceValue', {
                            name: dao.plugins[0].subdomain,
                            release: dao.plugins[0].release,
                            build: dao.plugins[0].build,
                        })}
                    </Link>
                </DefinitionList.Item>
            </DefinitionList.Container>
        </div>
    );
};
