import type { IDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    addressUtils,
    ChainEntityType,
    DateFormat,
    DefinitionList,
    formatterUtils,
    IconType,
    Link,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';

export interface IAragonFoundationAsideProps {
    dao: IDao;
}

export const AragonFoundationAside: React.FC<IAragonFoundationAsideProps> = (props) => {
    const { dao } = props;
    const { t } = useTranslations();

    const { buildEntityUrl } = useBlockExplorer();

    const daoEns = daoUtils.getDaoEns(dao);
    const truncatedAddress = addressUtils.truncateAddress(dao.address);

    const daoLaunchedAt = formatterUtils.formatDate(dao.blockTimestamp * 1000, {
        format: DateFormat.YEAR_MONTH,
    });

    const { id: chainId } = networkDefinitions[dao.network];
    const daoAddressLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: dao.address, chainId });
    const daoCreationLink = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: dao.transactionHash, chainId });

    return (
        <Page.Aside>
        <h1>teststets</h1>
            {dao.links.length > 0 && (
                <Page.AsideCard title={t('app.dashboard.daoDashboardPage.aside.links')} className="flex flex-col gap-4">
                    {dao.links.map(({ url, name }) => (
                        <Link key={url} iconRight={IconType.LINK_EXTERNAL} description={url} href={url}>
                            {name}
                        </Link>
                    ))}
                </Page.AsideCard>
            )}
            <Page.AsideCard title={t('app.dashboard.daoDashboardPage.aside.details.title')}>
                <DefinitionList.Container>
                    <DefinitionList.Item term={t('app.dashboard.daoDashboardPage.aside.details.chain')}>
                        <p className="text-neutral-500">{networkDefinitions[dao.network].name}</p>
                    </DefinitionList.Item>
                    <DefinitionList.Item term={t('app.dashboard.daoDashboardPage.aside.details.address')}>
                        <Link iconRight={IconType.LINK_EXTERNAL} href={daoAddressLink} target="_blank">
                            {truncatedAddress}
                        </Link>
                    </DefinitionList.Item>
                    {daoEns != null && (
                        <DefinitionList.Item term={t('app.dashboard.daoDashboardPage.aside.details.ens')}>
                            <Link iconRight={IconType.LINK_EXTERNAL} href={daoAddressLink} target="_blank">
                                {daoEns}
                            </Link>
                        </DefinitionList.Item>
                    )}
                    <DefinitionList.Item term={t('app.dashboard.daoDashboardPage.aside.details.launched')}>
                        <Link iconRight={IconType.LINK_EXTERNAL} href={daoCreationLink} target="_blank">
                            {daoLaunchedAt}
                        </Link>
                    </DefinitionList.Item>
                </DefinitionList.Container>
            </Page.AsideCard>
        </Page.Aside>
    );
};
