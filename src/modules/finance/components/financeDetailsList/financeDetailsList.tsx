import type { IDao, ISubDaoSummary, Network } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import {
    Button,
    ChainEntityType,
    DefinitionList,
    IconType,
    addressUtils,
    type IDefinitionListContainerProps,
} from '@aragon/gov-ui-kit';

export interface IFinanceDetailsEntity {
    /**
     * Address of the DAO or SubDAO.
     */
    address: string;
    /**
     * Network of the DAO or SubDAO.
     */
    network: Network;
    /**
     * ENS name of the DAO or SubDAO (e.g. `my-dao.dao.eth`).
     */
    ens?: string | null;
    /**
     * Description of the DAO or SubDAO.
     */
    description?: string | null;
}

export interface IFinanceDetailsListProps extends IDefinitionListContainerProps {
    /**
     * DAO or SubDAO to display the details for.
     */
    entity: IFinanceDetailsEntity | IDao | ISubDaoSummary;
    /**
     * Optional title for the card.
     */
    title?: string;
}

export const FinanceDetailsList: React.FC<IFinanceDetailsListProps> = (props) => {
    const { entity, title, ...otherProps } = props;
    const { network, address, ens, description } = entity;

    const { t } = useTranslations();

    const { buildEntityUrl } = useDaoChain({ network });
    const daoAddressLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: address });

    const entityEns = ens != null && ens !== '' ? ens : undefined;
    const descriptionText = description != null && description !== '' ? description : undefined;

    const octavLink = `https://pro.octav.fi/?addresses=${address}`;

    return (
        <Page.AsideCard title={title ?? t('app.finance.financeDetailsList.title')}>
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
                {entityEns && (
                    <DefinitionList.Item
                        term={t('app.finance.financeDetailsList.vaultEns')}
                        copyValue={entityEns}
                        link={{ href: daoAddressLink }}
                    >
                        {entityEns}
                    </DefinitionList.Item>
                )}
                {descriptionText && (
                    <DefinitionList.Item term={t('app.finance.subDaoInfo.description')}>
                        {descriptionText}
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
