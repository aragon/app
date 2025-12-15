import type { IDao, ISubDaoSummary } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import {
    Accordion,
    addressUtils,
    Card,
    ChainEntityType,
    Clipboard,
    Collapsible,
    DaoAvatar,
    DefinitionList,
    Link,
    Tag,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';

export interface IDaoHierarchyProps {
    /**
     * Main DAO object.
     */
    dao: IDao;
    /**
     * Current DAO ID to determine if we're viewing a SubDAO.
     */
    currentDaoId: string;
}

interface IDaoInfoProps {
    /**
     * DAO or SubDAO object.
     */
    dao: IDao | ISubDaoSummary;
    /**
     * Whether the DAO is the main DAO.
     */
    isMainDao: boolean;
}

const DaoInfo: React.FC<IDaoInfoProps> = ({ dao, isMainDao }) => {
    const { t } = useTranslations();
    const { id: chainId } = networkDefinitions[dao.network];
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    const hasEns = dao.ens != null && dao.ens !== '';

    return (
        <DefinitionList.Container>
            <DefinitionList.Item term={t('app.settings.daoSettingsInfo.type')}>
                <div className="flex">
                    <Tag
                        label={
                            isMainDao
                                ? t('app.settings.daoHierarchy.mainDaoLabel')
                                : t('app.settings.daoHierarchy.subDaoLabel')
                        }
                        variant={isMainDao ? 'primary' : 'neutral'}
                    />
                </div>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.settings.daoSettingsInfo.blockchain')}>
                <div className="flex flex-col gap-1">
                    <p className="text-neutral-500">{networkDefinitions[dao.network].name}</p>
                    <p className="text-sm leading-tight font-normal text-neutral-400">
                        {t('app.settings.daoSettingsInfo.notChangeable')}
                    </p>
                </div>
            </DefinitionList.Item>
            {hasEns ? (
                <DefinitionList.Item term={t('app.settings.daoSettingsInfo.ens')}>
                    <div className="flex flex-col gap-1">
                        <Clipboard copyValue={dao.address}>
                            <Link
                                href={buildEntityUrl({ type: ChainEntityType.ADDRESS, id: dao.address })}
                                isExternal={true}
                            >
                                {dao.ens}
                            </Link>
                        </Clipboard>
                        <p className="text-sm leading-tight font-normal text-neutral-400">
                            {t('app.settings.daoSettingsInfo.notChangeable')}
                        </p>
                    </div>
                </DefinitionList.Item>
            ) : (
                <DefinitionList.Item term={t('app.settings.daoSettingsInfo.address')}>
                    <div className="flex flex-col gap-1">
                        <Clipboard copyValue={dao.address}>
                            <Link
                                href={buildEntityUrl({ type: ChainEntityType.ADDRESS, id: dao.address })}
                                isExternal={true}
                            >
                                {addressUtils.truncateAddress(dao.address)}
                            </Link>
                        </Clipboard>
                        <p className="text-sm leading-tight font-normal text-neutral-400">
                            {t('app.settings.daoSettingsInfo.notChangeable')}
                        </p>
                    </div>
                </DefinitionList.Item>
            )}
            {dao.description && (
                <DefinitionList.Item term={t('app.settings.daoSettingsInfo.summary')}>
                    <Collapsible
                        collapsedLines={4}
                        buttonLabelClosed={t('app.settings.daoSettingsInfo.readMore')}
                        buttonLabelOpened={t('app.settings.daoSettingsInfo.readLess')}
                    >
                        <p className="text-neutral-500">{dao.description}</p>
                    </Collapsible>
                </DefinitionList.Item>
            )}
            {dao.links.length > 0 && (
                <DefinitionList.Item term={t('app.settings.daoSettingsInfo.links')}>
                    <div className="flex flex-col gap-3">
                        {dao.links.map((link) => (
                            <Link key={link.url} href={link.url} isExternal={true} showUrl={true}>
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </DefinitionList.Item>
            )}
        </DefinitionList.Container>
    );
};

export const DaoHierarchy: React.FC<IDaoHierarchyProps> = (props) => {
    const { dao, currentDaoId } = props;
    const { t } = useTranslations();

    const isViewingMainDao = dao.id === currentDaoId;
    const hasSubDaos = dao.subDaos != null && dao.subDaos.length > 0;

    const getDaoAvatar = (d: IDao | ISubDaoSummary) => ipfsUtils.cidToSrc(d.avatar);

    // If viewing main DAO with SubDAOs, show accordion structure
    if (isViewingMainDao && hasSubDaos) {
        return (
            <Accordion.Container isMulti={true} defaultValue={[dao.id]}>
                <Accordion.Item value={dao.id}>
                    <Accordion.ItemHeader className="items-center">
                        <div className="flex w-full items-center gap-3">
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                <DaoAvatar src={getDaoAvatar(dao)} name={dao.name} size="md" />
                                <p className="truncate text-lg leading-tight text-neutral-800">{dao.name}</p>
                            </div>
                            <p className="text-lg leading-tight text-neutral-500">
                                {t('app.settings.daoHierarchy.mainDaoLabel')}
                            </p>
                        </div>
                    </Accordion.ItemHeader>
                    <Accordion.ItemContent>
                        <DaoInfo dao={dao} isMainDao={true} />
                    </Accordion.ItemContent>
                </Accordion.Item>
                {dao.subDaos?.map((subDao) => (
                    <Accordion.Item key={subDao.id} value={subDao.id}>
                        <Accordion.ItemHeader className="items-center">
                            <div className="flex w-full items-center gap-3">
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                    <DaoAvatar src={getDaoAvatar(subDao)} name={subDao.name} size="md" />
                                    <p className="truncate text-lg leading-tight text-neutral-800">{subDao.name}</p>
                                </div>
                                <p className="text-lg leading-tight text-neutral-500">
                                    {t('app.settings.daoHierarchy.subDaoLabel')}
                                </p>
                            </div>
                        </Accordion.ItemHeader>
                        <Accordion.ItemContent>
                            <DaoInfo dao={subDao} isMainDao={false} />
                        </Accordion.ItemContent>
                    </Accordion.Item>
                ))}
            </Accordion.Container>
        );
    }

    // Default: regular view for main DAO without SubDAOs or when viewing a SubDAO
    return (
        <Card className="p-6">
            <DaoInfo dao={dao} isMainDao={isViewingMainDao} />
        </Card>
    );
};
