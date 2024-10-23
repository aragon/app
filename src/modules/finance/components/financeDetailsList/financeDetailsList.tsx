import { type IDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    ChainEntityType,
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

    const { buildEntityUrl } = useBlockExplorer({ chainId: networkDefinitions[network].chainId });
    const daoAddressLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: address });

    const daoEns = daoUtils.getDaoEns(dao);

    return (
        <Page.Section title={t('app.finance.financeDetailsList.title')} inset={false}>
            <DefinitionList.Container {...otherProps}>
                <DefinitionList.Item term={t('app.finance.financeDetailsList.blockchain')}>
                    <p className="text-neutral-500">{networkDefinitions[network].name}</p>
                </DefinitionList.Item>
                <DefinitionList.Item term={t('app.finance.financeDetailsList.vaultAddress')}>
                    <Link iconRight={IconType.LINK_EXTERNAL} href={daoAddressLink} target="_blank">
                        {addressUtils.truncateAddress(address)}
                    </Link>
                </DefinitionList.Item>
                {daoEns && (
                    <DefinitionList.Item term={t('app.finance.financeDetailsList.vaultEns')}>
                        <Link iconRight={IconType.LINK_EXTERNAL} href={daoAddressLink} target="_blank">
                            {daoEns}
                        </Link>
                    </DefinitionList.Item>
                )}
            </DefinitionList.Container>
        </Page.Section>
    );
};
