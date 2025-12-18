import { addressUtils, Button, ChainEntityType, DefinitionList, IconType, type IDefinitionListContainerProps } from '@aragon/gov-ui-kit';
import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { daoUtils } from '@/shared/utils/daoUtils';

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

    const { buildEntityUrl } = useDaoChain({ network });
    const daoAddressLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: address });

    const daoEns = daoUtils.getDaoEns(dao);

    const octavLink = `https://pro.octav.fi/?addresses=${address}`;

    return (
        <>
            <DefinitionList.Container {...otherProps}>
                <DefinitionList.Item term={t('app.finance.financeDetailsList.chain')}>
                    <p className="text-neutral-500">{networkDefinitions[network].name}</p>
                </DefinitionList.Item>
                <DefinitionList.Item
                    copyValue={address}
                    link={{ href: daoAddressLink }}
                    term={t('app.finance.financeDetailsList.vaultAddress')}
                >
                    {addressUtils.truncateAddress(address)}
                </DefinitionList.Item>
                {daoEns && (
                    <DefinitionList.Item
                        copyValue={daoEns}
                        link={{ href: daoAddressLink }}
                        term={t('app.finance.financeDetailsList.vaultEns')}
                    >
                        {daoEns}
                    </DefinitionList.Item>
                )}
            </DefinitionList.Container>
            <div className="flex flex-col items-center gap-y-3">
                <Button className="w-full" href={octavLink} iconRight={IconType.LINK_EXTERNAL} size="md" target="_blank" variant="tertiary">
                    {t('app.finance.financeDetailsList.octavLabel')}
                </Button>
                <p className="text-neutral-500 text-sm">{t('app.finance.financeDetailsList.octavDescription')}</p>
            </div>
        </>
    );
};
