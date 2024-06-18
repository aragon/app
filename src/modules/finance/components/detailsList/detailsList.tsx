import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { addressUtils, DefinitionList, StateSkeletonBar, type IDefinitionListContainerProps } from '@aragon/ods';

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
    /**
     * Loading state of the DAO.
     */
    isLoading?: boolean;
}

export const DetailsList: React.FC<IDetailsListProps> = (props) => {
    const { network, vaultAddress, ensAddress, isLoading, ...otherProps } = props;
    const { t } = useTranslations();

    return (
        <Page.Section title={t('app.finance.detailsList.title')}>
            <DefinitionList.Container {...otherProps}>
                <DefinitionList.Item term={t('app.finance.detailsList.blockchain')}>
                    {isLoading ? (
                        <StateSkeletonBar width="100%" />
                    ) : (
                        <p className="capitalize text-neutral-500">{network ?? 'Unknown Network'}</p>
                    )}
                </DefinitionList.Item>
                <DefinitionList.Item term={t('app.finance.detailsList.vaultAddress')}>
                    {isLoading ? (
                        <StateSkeletonBar width="100%" />
                    ) : (
                        <p className="text-neutral-500">
                            {addressUtils.truncateAddress(vaultAddress) ?? 'Unknown Address'}
                        </p>
                    )}
                </DefinitionList.Item>
                <DefinitionList.Item term={t('app.finance.detailsList.vaultEns')}>
                    {isLoading ? (
                        <StateSkeletonBar width="100%" />
                    ) : (
                        <p className="text-neutral-500">{ensAddress ?? 'N/A'}</p>
                    )}
                </DefinitionList.Item>
            </DefinitionList.Container>
        </Page.Section>
    );
};
