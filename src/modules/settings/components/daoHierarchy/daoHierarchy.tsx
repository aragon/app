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
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
import type { IDao, ILinkedAccountSummary } from '@/shared/api/daoService';
import { DaoTypeTag } from '@/shared/components/daoTypeTag';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';

export interface IDaoHierarchyProps {
    /**
     * Main DAO object.
     */
    dao: IDao;
    /**
     * Current DAO ID to determine if we're viewing a linked account.
     */
    currentDaoId: string;
}

interface IDaoInfoProps {
    /**
     * DAO or linked account object.
     */
    dao: IDao | ILinkedAccountSummary;
}

const DaoInfo: React.FC<IDaoInfoProps> = ({ dao }) => {
    const { t } = useTranslations();
    const { id: chainId } = networkDefinitions[dao.network];
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    const hasEns = dao.ens != null && dao.ens !== '';

    return (
        <DefinitionList.Container>
            <DefinitionList.Item
                term={t('app.settings.daoSettingsInfo.blockchain')}
            >
                <div className="flex flex-col gap-1">
                    <p className="text-neutral-500">
                        {networkDefinitions[dao.network].name}
                    </p>
                    <p className="font-normal text-neutral-400 text-sm leading-tight">
                        {t('app.settings.daoSettingsInfo.notChangeable')}
                    </p>
                </div>
            </DefinitionList.Item>
            {hasEns ? (
                <DefinitionList.Item
                    term={t('app.settings.daoSettingsInfo.ens')}
                >
                    <div className="flex flex-col gap-1">
                        <Clipboard copyValue={dao.address}>
                            <Link
                                href={buildEntityUrl({
                                    type: ChainEntityType.ADDRESS,
                                    id: dao.address,
                                })}
                                isExternal={true}
                            >
                                {dao.ens}
                            </Link>
                        </Clipboard>
                        <p className="font-normal text-neutral-400 text-sm leading-tight">
                            {t('app.settings.daoSettingsInfo.notChangeable')}
                        </p>
                    </div>
                </DefinitionList.Item>
            ) : (
                <DefinitionList.Item
                    term={t('app.settings.daoSettingsInfo.address')}
                >
                    <div className="flex flex-col gap-1">
                        <Clipboard copyValue={dao.address}>
                            <Link
                                href={buildEntityUrl({
                                    type: ChainEntityType.ADDRESS,
                                    id: dao.address,
                                })}
                                isExternal={true}
                            >
                                {addressUtils.truncateAddress(dao.address)}
                            </Link>
                        </Clipboard>
                        <p className="font-normal text-neutral-400 text-sm leading-tight">
                            {t('app.settings.daoSettingsInfo.notChangeable')}
                        </p>
                    </div>
                </DefinitionList.Item>
            )}
            {dao.description && (
                <DefinitionList.Item
                    term={t('app.settings.daoSettingsInfo.summary')}
                >
                    <Collapsible
                        buttonLabelClosed={t(
                            'app.settings.daoSettingsInfo.readMore',
                        )}
                        buttonLabelOpened={t(
                            'app.settings.daoSettingsInfo.readLess',
                        )}
                        collapsedLines={4}
                    >
                        <p className="text-neutral-500">{dao.description}</p>
                    </Collapsible>
                </DefinitionList.Item>
            )}
            {dao.links.length > 0 && (
                <DefinitionList.Item
                    term={t('app.settings.daoSettingsInfo.links')}
                >
                    <div className="flex flex-col gap-3">
                        {dao.links.map((link) => (
                            <Link
                                href={link.url}
                                isExternal={true}
                                key={link.url}
                                showUrl={true}
                            >
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

    const isViewingMainDao = dao.id === currentDaoId;
    const hasLinkedAccounts =
        dao.linkedAccounts != null && dao.linkedAccounts.length > 0;

    const getDaoAvatar = (d: IDao | ILinkedAccountSummary) =>
        ipfsUtils.cidToSrc(d.avatar);

    // If viewing main DAO with linked accounts, show accordion structure
    if (isViewingMainDao && hasLinkedAccounts) {
        return (
            <Accordion.Container defaultValue={[dao.id]} isMulti={true}>
                <Accordion.Item value={dao.id}>
                    <Accordion.ItemHeader className="items-center">
                        <div className="flex w-full items-center gap-3">
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                <DaoAvatar
                                    name={dao.name}
                                    size="md"
                                    src={getDaoAvatar(dao)}
                                />
                                <p className="truncate text-lg text-neutral-800 leading-tight">
                                    {dao.name}
                                </p>
                            </div>
                            <DaoTypeTag type="main" />
                        </div>
                    </Accordion.ItemHeader>
                    <Accordion.ItemContent>
                        <DaoInfo dao={dao} />
                    </Accordion.ItemContent>
                </Accordion.Item>
                {dao.linkedAccounts?.map((linkedAccount) => (
                    <Accordion.Item
                        key={linkedAccount.id}
                        value={linkedAccount.id}
                    >
                        <Accordion.ItemHeader className="items-center">
                            <div className="flex w-full items-center gap-3">
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                    <DaoAvatar
                                        name={linkedAccount.name}
                                        size="md"
                                        src={getDaoAvatar(linkedAccount)}
                                    />
                                    <p className="truncate text-lg text-neutral-800 leading-tight">
                                        {linkedAccount.name}
                                    </p>
                                </div>
                                <DaoTypeTag type="sub" />
                            </div>
                        </Accordion.ItemHeader>
                        <Accordion.ItemContent>
                            <DaoInfo dao={linkedAccount} />
                        </Accordion.ItemContent>
                    </Accordion.Item>
                ))}
            </Accordion.Container>
        );
    }

    // Default: regular view for main DAO without linked accounts or when viewing a linked account
    return (
        <Card className="p-6">
            <DaoInfo dao={dao} />
        </Card>
    );
};
