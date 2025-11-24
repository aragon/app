import type { IDao, ISubDaoSummary } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import {
    Accordion,
    Card,
    ChainEntityType,
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

const DaoInfo: React.FC<{ dao: IDao | ISubDaoSummary }> = ({ dao }) => {
    const { t } = useTranslations();
    const daoAvatar = ipfsUtils.cidToSrc(dao.avatar);
    const { id: chainId } = networkDefinitions[dao.network];
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    // Helper to get ENS for both IDao and ISubDaoSummary
    const getDaoEns = (dao: IDao | ISubDaoSummary): string | undefined => {
        if ('ens' in dao && dao.ens != null && dao.ens !== '') {
            return dao.ens;
        }
        return undefined;
    };

    return (
        <DefinitionList.Container>
            <DefinitionList.Item term={t('app.settings.daoSettingsInfo.name')}>
                <div className="flex items-center gap-2">
                    <p className="text-neutral-500">{dao.name}</p>
                    <DaoAvatar src={daoAvatar} name={dao.name} size="md" />
                </div>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.settings.daoSettingsInfo.chain')}>
                <div className="flex flex-col gap-1">
                    <p className="text-neutral-500">{networkDefinitions[dao.network].name}</p>
                    <p className="text-sm leading-tight font-normal text-neutral-400">
                        {t('app.settings.daoSettingsInfo.notChangeable')}
                    </p>
                </div>
            </DefinitionList.Item>
            {getDaoEns(dao) && (
                <DefinitionList.Item term={t('app.settings.daoSettingsInfo.ens')}>
                    <div className="flex flex-col gap-1">
                        <Link
                            href={buildEntityUrl({ type: ChainEntityType.ADDRESS, id: dao.address })}
                            isExternal={true}
                        >
                            {getDaoEns(dao)}
                        </Link>
                        <p className="text-sm leading-tight font-normal text-neutral-400">
                            {t('app.settings.daoSettingsInfo.notChangeable')}
                        </p>
                    </div>
                </DefinitionList.Item>
            )}
            <DefinitionList.Item term={t('app.settings.daoSettingsInfo.summary')}>
                <Collapsible
                    collapsedLines={4}
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

    // If viewing main DAO with SubDAOs, show accordion structure
    if (isViewingMainDao && hasSubDaos) {
        return (
            <Accordion.Container isMulti={true} defaultValue={[dao.id]}>
                <Accordion.Item value={dao.id}>
                    <Accordion.ItemHeader>
                        <div className="flex items-center gap-2">
                            <p className="font-medium">{dao.name}</p>
                            <Tag label={t('app.settings.daoHierarchy.mainDaoLabel')} />
                        </div>
                    </Accordion.ItemHeader>
                    <Accordion.ItemContent>
                        <DaoInfo dao={dao} />
                    </Accordion.ItemContent>
                </Accordion.Item>
                {dao.subDaos?.map((subDao) => (
                    <Accordion.Item key={subDao.id} value={subDao.id}>
                        <Accordion.ItemHeader>
                            <div className="flex items-center gap-2">
                                <p className="font-medium">{subDao.name}</p>
                                <Tag label={t('app.settings.daoHierarchy.subDaoLabel')} />
                            </div>
                        </Accordion.ItemHeader>
                        <Accordion.ItemContent>
                            <DaoInfo dao={subDao} />
                        </Accordion.ItemContent>
                    </Accordion.Item>
                ))}
            </Accordion.Container>
        );
    }

    // Default: regular view for main DAO without SubDAOs or when viewing a SubDAO
    return (
        <Card className="p-6">
            <DaoInfo dao={dao} />
        </Card>
    );
};
