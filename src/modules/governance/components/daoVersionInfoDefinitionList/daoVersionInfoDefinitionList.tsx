import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { addressUtils, ChainEntityType, DefinitionList, Heading, IconType, Link, useBlockExplorer } from '@aragon/ods';

export interface IDaVersionInfoDefinitionListProps {
    /**
     * Dao data for version info definition list.
     */
    dao?: IDao;
}

const envLabel: Record<string, string | undefined> = {
    development: 'DEV',
    staging: 'STG',
};

export const DaoVersionInfoDefinitionList: React.FC<IDaVersionInfoDefinitionListProps> = (props) => {
    const { dao } = props;
    const { t } = useTranslations();

    const version = process.env.version!;

    const env = envLabel[process.env.NEXT_PUBLIC_ENV!];
    const versionLabel = env != null ? 'versionEnv' : 'version';

    const chainId = dao ? networkDefinitions[dao.network].chainId : undefined;
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    return (
        <div className="flex w-full flex-col gap-2">
            <Heading size="h3">Version info</Heading>
            <DefinitionList.Container>
                <DefinitionList.Item term={t('app.governance.daoSettingsPage.aside.daoVersionInfo.app')}>
                    <Link href="/" iconRight={IconType.LINK_EXTERNAL}>
                        {t(`app.application.applicationTags.${versionLabel}`, { version, env })}
                    </Link>
                </DefinitionList.Item>
                <DefinitionList.Item term={t('app.governance.daoSettingsPage.aside.daoVersionInfo.os')}>
                    {/* TODO: Fetch this operating system value from backend when available */}
                    <Link
                        description={addressUtils.truncateAddress(dao?.address)}
                        iconRight={IconType.LINK_EXTERNAL}
                        href=""
                    >
                        Aragon OSx v0.00
                    </Link>
                </DefinitionList.Item>
                <DefinitionList.Item term={t('app.governance.daoSettingsPage.aside.daoVersionInfo.governance')}>
                    <Link
                        description={addressUtils.truncateAddress(dao?.plugins[0].address)}
                        iconRight={IconType.LINK_EXTERNAL}
                        href={buildEntityUrl({ type: ChainEntityType.ADDRESS, id: dao?.plugins[0].address })}
                    >
                        {t('app.governance.daoSettingsPage.aside.daoVersionInfo.governanceLabel', {
                            name: dao?.plugins[0].subdomain,
                            release: dao?.plugins[0].release,
                            build: dao?.plugins[0].build,
                        })}
                    </Link>
                </DefinitionList.Item>
            </DefinitionList.Container>
        </div>
    );
};
