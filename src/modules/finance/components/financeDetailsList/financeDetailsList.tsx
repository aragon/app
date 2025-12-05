import { type IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    Button,
    ChainEntityType,
    DefinitionList,
    IconType,
    addressUtils,
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
                    term={t('app.finance.financeDetailsList.vaultAddress')}
                    copyValue={address}
                    link={{ href: daoAddressLink }}
                >
                    {addressUtils.truncateAddress(address)}
                </DefinitionList.Item>
                {daoEns && (
                    <DefinitionList.Item
                        term={t('app.finance.financeDetailsList.vaultEns')}
                        copyValue={daoEns}
                        link={{ href: daoAddressLink }}
                    >
                        {daoEns}
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
        </>
    );
};
