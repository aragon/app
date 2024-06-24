import { type IDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { addressUtils, DefinitionList, IconType, Link, type IDefinitionListContainerProps } from '@aragon/ods';

export interface IFinanceDetailsListProps extends IDefinitionListContainerProps {
    /**
     * Network name of the DAO.
     */
    dao?: IDao;
}

export const FinanceDetailsList: React.FC<IFinanceDetailsListProps> = (props) => {
    const { dao, ...otherProps } = props;
    const { network, address: vaultAddress, ens: vaultEns } = dao ?? {};
    const { t } = useTranslations();

    return (
        <Page.Section title={t('app.finance.financeDetailsList.title')}>
            <DefinitionList.Container {...otherProps}>
                <DefinitionList.Item term={t('app.finance.financeDetailsList.blockchain')}>
                    <p className="text-neutral-500">{network}</p>
                </DefinitionList.Item>
                <DefinitionList.Item term={t('app.finance.financeDetailsList.vaultAddress')}>
                    <Link iconRight={IconType.LINK_EXTERNAL}>{addressUtils.truncateAddress(vaultAddress)}</Link>
                </DefinitionList.Item>
                {vaultEns && (
                    <DefinitionList.Item term={t('app.finance.financeDetailsList.vaultEns')}>
                        <Link href="#" target="_blank" iconRight={IconType.LINK_EXTERNAL}>
                            {vaultEns}
                        </Link>
                    </DefinitionList.Item>
                )}
            </DefinitionList.Container>
        </Page.Section>
    );
};
