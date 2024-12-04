import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
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
} from '@aragon/gov-ui-kit';

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

    const chainId = networkDefinitions[dao.network].chainId;
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    return (
        <Card className="p-6">
            <DefinitionList.Container>
                <DefinitionList.Item term={t('app.settings.daoSettingsInfo.name')}>
                    <div className="flex items-center gap-2">
                        <p className="text-neutral-500">{dao.name}</p>
                        <DaoAvatar src={daoAvatar} name={dao.name} size="md" />
                    </div>
                </DefinitionList.Item>
                <DefinitionList.Item term={t('app.settings.daoSettingsInfo.blockchain')}>
                    <div className="flex items-center justify-between">
                        <p className="text-neutral-500">{networkDefinitions[dao.network].name}</p>
                        <Tag label={t('app.settings.daoSettingsInfo.notChangeable')} />
                    </div>
                </DefinitionList.Item>
                {dao.subdomain && (
                    <DefinitionList.Item term={t('app.settings.daoSettingsInfo.ens')}>
                        <div className="flex items-center justify-between">
                            <Link
                                description={addressUtils.truncateAddress(dao.address)}
                                href={buildEntityUrl({ type: ChainEntityType.ADDRESS, id: dao.address })}
                                iconRight={IconType.LINK_EXTERNAL}
                                target="_blank"
                            >
                                {daoUtils.getDaoEns(dao)}
                            </Link>
                            <Tag label={t('app.settings.daoSettingsInfo.notChangeable')} />
                        </div>
                    </DefinitionList.Item>
                )}
                <DefinitionList.Item term={t('app.settings.daoSettingsInfo.summary')}>
                    <Collapsible
                        collapsedSize="sm"
                        customCollapsedHeight={60}
                        buttonLabelClosed={t('app.settings.daoSettingsInfo.readMore')}
                        buttonLabelOpened={t('app.settings.daoSettingsInfo.readLess')}
                    >
                        <p className="text-neutral-500">{dao.description}</p>
                    </Collapsible>
                </DefinitionList.Item>
                {dao.links.length > 0 && (
                    <DefinitionList.Item term={t('app.settings.daoSettingsInfo.links')}>
                        <div className="flex flex-col gap-3">
                            {dao.links.map((link) => (
                                <Link
                                    key={link.url}
                                    description={link.url}
                                    iconRight={IconType.LINK_EXTERNAL}
                                    href={link.url}
                                    target="_blank"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </DefinitionList.Item>
                )}
            </DefinitionList.Container>
        </Card>
    );
};
