import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { addressUtils, DefinitionList, IconType, Link, type IDefinitionListContainerProps } from '@aragon/ods';

interface IDetailsListProps extends IDefinitionListContainerProps {
    /**
     * Network name of the DAO.
     */
    network?: string;
    /**
     * Vault address of the DAO.
     */
    vaultAddress?: string;
    /**
     * ENS address of the DAO.
     */
    ensAddress?: string | null;
}

export const DetailsList: React.FC<IDetailsListProps> = (props) => {
    const { network, vaultAddress, ensAddress, ...otherProps } = props;
    const { t } = useTranslations();

    return (
        <Page.Section title={t('app.finance.detailsList.title')}>
            <DefinitionList.Container {...otherProps}>
                <DefinitionList.Item term={t('app.finance.detailsList.blockchain')}>
                    <p className="capitalize text-neutral-500">{network ?? 'Unknown Network'}</p>
                </DefinitionList.Item>
                <DefinitionList.Item term={t('app.finance.detailsList.vaultAddress')}>
                    {vaultAddress ? (
                        <Link href="#" target="_blank" iconRight={IconType.LINK_EXTERNAL}>
                            {addressUtils.truncateAddress(vaultAddress)}
                        </Link>
                    ) : (
                        <p className="text-neutral-500">Unknown address</p>
                    )}
                </DefinitionList.Item>
                <DefinitionList.Item term={t('app.finance.detailsList.vaultEns')}>
                    {ensAddress ? (
                        <Link href="#" target="_blank" iconRight={ensAddress ? IconType.LINK_EXTERNAL : undefined}>
                            {ensAddress}
                        </Link>
                    ) : (
                        <p className="text-neutral-500">N/A</p>
                    )}
                </DefinitionList.Item>
            </DefinitionList.Container>
        </Page.Section>
    );
};
