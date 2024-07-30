import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import {
    addressUtils,
    ChainEntityType,
    Collapsible,
    DaoAvatar,
    DefinitionList,
    IconType,
    Link,
    Tag,
    useBlockExplorer,
} from '@aragon/ods';

export interface IDaoDefinitionListProps {
    /**
     * Dao data for definition list.
     */
    dao?: IDao;
}

function capitalizeAndSplit(str?: string) {
    if (!str) return;
    return str
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export const DaoDefinitionList: React.FC<IDaoDefinitionListProps> = (props) => {
    const { dao } = props;

    const { t } = useTranslations();

    const daoAvatar = ipfsUtils.cidToSrc(dao?.avatar);

    const chainId = dao ? networkDefinitions[dao.network].chainId : undefined;
    const { buildEntityUrl } = useBlockExplorer({ chainId });
    return (
        <DefinitionList.Container className="rounded-2xl border border-neutral-100 bg-neutral-0 p-6">
            <DefinitionList.Item term={t('app.governance.daoSettingsPage.main.daoDefinitionList.name')}>
                <div className="flex items-center gap-2">
                    <p>{dao?.name}</p>
                    {dao?.avatar && <DaoAvatar src={daoAvatar} name={dao?.name} size="md" />}
                </div>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.governance.daoSettingsPage.main.daoDefinitionList.blockchain')}>
                <div className="flex items-center justify-between">
                    {capitalizeAndSplit(dao?.network)}
                    <Tag label={t('app.governance.daoSettingsPage.main.daoDefinitionList.notChangeable')} />
                </div>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.governance.daoSettingsPage.main.daoDefinitionList.ens')}>
                <div className="flex items-center justify-between">
                    <Link
                        description={addressUtils.truncateAddress(dao?.address)}
                        href={buildEntityUrl({ type: ChainEntityType.ADDRESS, id: dao?.address })}
                        iconRight={IconType.LINK_EXTERNAL}
                    >
                        {dao?.subdomain}
                    </Link>
                    <Tag label={t('app.governance.daoSettingsPage.main.daoDefinitionList.notChangeable')} />
                </div>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.governance.daoSettingsPage.main.daoDefinitionList.summary')}>
                <Collapsible
                    collapsedSize="sm"
                    buttonLabelClosed={t('app.governance.daoSettingsPage.main.daoDefinitionList.readMore')}
                    buttonLabelOpened={t('app.governance.daoSettingsPage.main.daoDefinitionList.readLess')}
                >
                    <p>{dao?.description}</p>
                </Collapsible>
            </DefinitionList.Item>
            {dao?.links && dao.links.length > 0 && (
                <DefinitionList.Item term={t('app.governance.daoSettingsPage.main.daoDefinitionList.links')}>
                    {dao?.links.map((link, index) => (
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
    );
};
