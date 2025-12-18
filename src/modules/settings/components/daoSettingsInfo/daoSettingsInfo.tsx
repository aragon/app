import { Card, ChainEntityType, Collapsible, DaoAvatar, DefinitionList, Link, Tag } from '@aragon/gov-ui-kit';
import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';

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

    const { buildEntityUrl } = useDaoChain({ network: dao.network });

    return (
        <Card className="p-6">
            <DefinitionList.Container>
                <DefinitionList.Item term={t('app.settings.daoSettingsInfo.name')}>
                    <div className="flex items-center gap-2">
                        <p className="text-neutral-500">{dao.name}</p>
                        <DaoAvatar name={dao.name} size="md" src={daoAvatar} />
                    </div>
                </DefinitionList.Item>
                <DefinitionList.Item term={t('app.settings.daoSettingsInfo.chain')}>
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-neutral-500">{networkDefinitions[dao.network].name}</p>
                        <Tag className="shrink-0" label={t('app.settings.daoSettingsInfo.notChangeable')} />
                    </div>
                </DefinitionList.Item>
                {dao.ens && (
                    <DefinitionList.Item term={t('app.settings.daoSettingsInfo.ens')}>
                        <div className="flex items-center justify-between gap-2">
                            <Link href={buildEntityUrl({ type: ChainEntityType.ADDRESS, id: dao.address })} isExternal={true}>
                                {daoUtils.getDaoEns(dao)}
                            </Link>
                            <Tag className="shrink-0" label={t('app.settings.daoSettingsInfo.notChangeable')} />
                        </div>
                    </DefinitionList.Item>
                )}
                <DefinitionList.Item term={t('app.settings.daoSettingsInfo.summary')}>
                    <Collapsible
                        buttonLabelClosed={t('app.settings.daoSettingsInfo.readMore')}
                        buttonLabelOpened={t('app.settings.daoSettingsInfo.readLess')}
                        collapsedLines={4}
                    >
                        <p className="text-neutral-500">{dao.description}</p>
                    </Collapsible>
                </DefinitionList.Item>
                {dao.links.length > 0 && (
                    <DefinitionList.Item term={t('app.settings.daoSettingsInfo.links')}>
                        <div className="flex flex-col gap-3">
                            {dao.links.map((link) => (
                                <Link href={link.url} isExternal={true} key={link.url} showUrl={true}>
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
