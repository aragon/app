import { type IDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    Button,
    ChainEntityType,
    Clipboard,
    DefinitionList,
    IconType,
    Link,
    addressUtils,
    useBlockExplorer,
    type IDefinitionListContainerProps,
} from '@aragon/gov-ui-kit';

export interface IFinanceDetailsListProps extends IDefinitionListContainerProps {
    /**
     * DAO to display the details for.
     */
    dao?: IDao;
}

export const FinanceDetailsList: React.FC<IFinanceDetailsListProps> = (props) => {
    const { dao, ...otherProps } = props;
    const { network, address } = dao!;

    const { t } = useTranslations();

    const { buildEntityUrl } = useBlockExplorer({ chainId: networkDefinitions[network].id });
    const daoAddressLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: address });

    const daoEns = daoUtils.getDaoEns(dao);

    const octavLink = `https://pro.octav.fi/?addresses=${address}`;

    return (
        <Page.AsideCard title={t('app.finance.financeDetailsList.title')}>
            <DefinitionList.Container {...otherProps}>
                <DefinitionList.Item term={t('app.finance.financeDetailsList.chain')}>
                    <p className="text-neutral-500">{networkDefinitions[network].name}</p>
                </DefinitionList.Item>
                <DefinitionList.Item term={t('app.finance.financeDetailsList.vaultAddress')}>
                    <Clipboard copyValue={address}>
                        <Link href={daoAddressLink} isExternal={true}>
                            {addressUtils.truncateAddress(address)}
                        </Link>
                    </Clipboard>
                </DefinitionList.Item>
                {daoEns && (
                    <DefinitionList.Item term={t('app.finance.financeDetailsList.vaultEns')}>
                        <Clipboard copyValue={daoEns}>
                            <Link href={daoAddressLink} isExternal={true}>
                                {daoEns}
                            </Link>
                        </Clipboard>
                    </DefinitionList.Item>
                )}
            </DefinitionList.Container>
            <div className="flex flex-col items-center gap-y-3">
                <Button
                    className="w-full"
                    variant="tertiary"
                    size="md"
                    href={octavLink}
                    target="_blank"
                    iconRight={IconType.LINK_EXTERNAL}
                >
                    {t('app.finance.financeDetailsList.octavLabel')}
                </Button>
                <p className="text-sm text-neutral-500">{t('app.finance.financeDetailsList.octavDescription')}</p>
            </div>
        </Page.AsideCard>
    );
};
