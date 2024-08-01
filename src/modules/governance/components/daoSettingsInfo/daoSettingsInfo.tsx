import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import {
    addressUtils,
    Card,
    ChainEntityType,
    Collapsible,
    DaoAvatar,
    DefinitionList,
    IconType,
    Link,
    Tag,
    useBlockExplorer,
} from '@aragon/ods';

export interface IDaoSettingsInfoProps {
    /**
     * Dao Object.
     */
    dao: IDao;
}

export const DaoSettingsInfo: React.FC<IDaoSettingsInfoProps> = (props) => {
    const { dao } = props;
    const { t } = useTranslations();

    const daoAvatar = ipfsUtils.cidToSrc(dao.avatar);

    const chainId = dao ? networkDefinitions[dao.network].chainId : undefined;
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    return (
        <Card className="p-6">
            <DefinitionList.Container>
                <DefinitionList.Item term={t('app.governance.daoSettingsPage.main.daoSettingsInfo.name')}>
                    <div className="flex items-center gap-2">
                        <p>{dao.name}</p>
                        <DaoAvatar src={daoAvatar} name={dao.name} size="md" />
                    </div>
                </DefinitionList.Item>
                <DefinitionList.Item term={t('app.governance.daoSettingsPage.main.daoSettingsInfo.blockchain')}>
                    <div className="flex items-center justify-between">
                        {dao.network && networkDefinitions[dao.network].name}
                        <Tag label={t('app.governance.daoSettingsPage.main.daoSettingsInfo.notChangeable')} />
                    </div>
                </DefinitionList.Item>
                {dao.subdomain && (
                    <DefinitionList.Item term={t('app.governance.daoSettingsPage.main.daoSettingsInfo.ens')}>
                        <div className="flex items-center justify-between">
                            <Link
                                description={addressUtils.truncateAddress(dao.address)}
                                href={buildEntityUrl({ type: ChainEntityType.ADDRESS, id: dao.address })}
                                iconRight={IconType.LINK_EXTERNAL}
                                target="_blank"
                            >
                                {dao.subdomain}
                            </Link>
                            <Tag label={t('app.governance.daoSettingsPage.main.daoSettingsInfo.notChangeable')} />
                        </div>
                    </DefinitionList.Item>
                )}
                <DefinitionList.Item term={t('app.governance.daoSettingsPage.main.daoSettingsInfo.summary')}>
                    <Collapsible
                        collapsedSize="sm"
                        buttonLabelClosed={t('app.governance.daoSettingsPage.main.daoSettingsInfo.readMore')}
                        buttonLabelOpened={t('app.governance.daoSettingsPage.main.daoSettingsInfo.readLess')}
                    >
                        <p>{dao.description}</p>
                    </Collapsible>
                </DefinitionList.Item>
                {dao.links && dao.links.length > 0 && (
                    <DefinitionList.Item term={t('app.governance.daoSettingsPage.main.daoSettingsInfo.links')}>
                        {dao.links.map((link, index) => (
                            <li key={index}>
                                <Link
                                    description={link.url}
                                    iconRight={IconType.LINK_EXTERNAL}
                                    href={link.url}
                                    target="_blank"
                                >
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </DefinitionList.Item>
                )}
            </DefinitionList.Container>
        </Card>
    );
};
