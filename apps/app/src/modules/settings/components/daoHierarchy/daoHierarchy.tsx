import {
    Accordion,
    Card,
    ChainEntityType,
    Collapsible,
    DaoAvatar,
    DefinitionList,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
import type { IDao, ILinkedAccountSummary } from '@/shared/api/daoService';
import { DaoTypeTag } from '@/shared/components/daoTypeTag';
import { ResourceLink } from '@/shared/components/resourceLink';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';

export interface IDaoHierarchyProps {
    /**
     * Primary account (main DAO) object.
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
    /**
     * Link to the permissions page. Only set for the main DAO so the entry
     * renders once.
     */
    permissionsHref?: string;
}

const DaoInfo: React.FC<IDaoInfoProps> = ({ dao, permissionsHref }) => {
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
                    copyValue={dao.address}
                    description={t(
                        'app.settings.daoSettingsInfo.notChangeable',
                    )}
                    link={{
                        href: buildEntityUrl({
                            type: ChainEntityType.ADDRESS,
                            id: dao.address,
                        }),
                        isExternal: true,
                        isOnchainEntity: true,
                    }}
                    term={t('app.settings.daoSettingsInfo.ens')}
                >
                    {dao.ens}
                </DefinitionList.Item>
            ) : (
                <DefinitionList.Item
                    description={t(
                        'app.settings.daoSettingsInfo.notChangeable',
                    )}
                    link={{
                        href: buildEntityUrl({
                            type: ChainEntityType.ADDRESS,
                            id: dao.address,
                        }),
                        isExternal: true,
                        isOnchainEntity: true,
                    }}
                    term={t('app.settings.daoSettingsInfo.address')}
                >
                    {dao.address}
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
                            <ResourceLink
                                isExternal={true}
                                key={link.url}
                                name={link.name}
                                url={link.url}
                            />
                        ))}
                    </div>
                </DefinitionList.Item>
            )}
            {permissionsHref != null && (
                <DefinitionList.Item
                    description={t(
                        'app.settings.daoSettingsInfo.permissionsDescription',
                    )}
                    link={{ href: permissionsHref, isExternal: false }}
                    term={t('app.settings.daoSettingsInfo.permissions')}
                >
                    {t('app.settings.daoSettingsInfo.permissionsLink')}
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

    const permissionsHref = daoUtils.getDaoUrl(dao, 'permissions');

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
                        <DaoInfo dao={dao} permissionsHref={permissionsHref} />
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
            <DaoInfo dao={dao} permissionsHref={permissionsHref} />
        </Card>
    );
};
