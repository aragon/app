'use client';

import {
    addressUtils,
    CardEmptyState,
    ChainEntityType,
    DefinitionList,
} from '@aragon/gov-ui-kit';
import { safeShortNameFromNetwork } from '@/modules/application/utils/proxySafeUtils/safeTxServiceNetworks';
import type { Network } from '@/shared/api/daoService';
import { SafeServiceError, useSafeInfo } from '@/shared/api/safeService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { SafeBalanceList } from '../../components/safeBalanceList';
import { SafeOwnerList } from '../../components/safeOwnerList';
import { SafePendingTransactionList } from '../../components/safePendingTransactionList';

export interface ISafeAccountPageClientProps {
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Checksummed address of the Safe.
     */
    address: string;
}

export const SafeAccountPageClient: React.FC<ISafeAccountPageClientProps> = (
    props,
) => {
    const { network, address } = props;

    // The Safe transaction service requires a checksummed address. The route passes the raw
    // address through (the DAO page does the same) and normalisation happens here, client-side,
    // where gov-ui-kit's facade is bound.
    const checksummedAddress = addressUtils.getChecksum(address);

    const { t } = useTranslations();
    const { buildEntityUrl, networkDefinition } = useDaoChain({ network });

    // Citrea and Chiliz have no Safe transaction service. Skipping the request keeps that an
    // expected, renderable state instead of a failed read.
    const isNetworkSupported = safeShortNameFromNetwork(network) != null;

    const { data: safeInfo, error: safeInfoError } = useSafeInfo(
        { urlParams: { network, address: checksummedAddress } },
        { enabled: isNetworkSupported },
    );

    const isUnsupported =
        !isNetworkSupported ||
        SafeServiceError.isUnsupportedChainError(safeInfoError);

    const truncatedAddress = addressUtils.truncateAddress(checksummedAddress);
    const addressLink = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: checksummedAddress,
    });

    const header = (
        <Page.Header
            description={t('app.safe.safeAccountPage.header.description')}
            stats={
                isUnsupported
                    ? undefined
                    : [
                          {
                              value: safeInfo?.threshold,
                              suffix: t(
                                  'app.safe.safeAccountPage.stats.thresholdSuffix',
                                  { owners: safeInfo?.owners.length ?? 0 },
                              ),
                              label: t(
                                  'app.safe.safeAccountPage.stats.threshold',
                              ),
                          },
                          {
                              value: safeInfo?.owners.length,
                              label: t('app.safe.safeAccountPage.stats.owners'),
                          },
                          {
                              value: safeInfo?.nonce,
                              label: t('app.safe.safeAccountPage.stats.nonce'),
                          },
                      ]
            }
            title={truncatedAddress}
        />
    );

    if (isUnsupported) {
        return (
            <>
                {header}
                <Page.Content>
                    <Page.Main>
                        <CardEmptyState
                            description={t(
                                'app.safe.safeAccountPage.unsupportedNetwork.description',
                                { network: networkDefinition?.name ?? network },
                            )}
                            heading={t(
                                'app.safe.safeAccountPage.unsupportedNetwork.heading',
                            )}
                            objectIllustration={{ object: 'CHAIN' }}
                        />
                    </Page.Main>
                </Page.Content>
            </>
        );
    }

    return (
        <>
            {header}
            <Page.Content>
                <Page.Main>
                    <Page.MainSection
                        title={t('app.safe.safeAccountPage.main.owners.title')}
                    >
                        <SafeOwnerList address={address} network={network} />
                    </Page.MainSection>
                    <Page.MainSection
                        description={t(
                            'app.safe.safeAccountPage.main.pending.description',
                        )}
                        title={t('app.safe.safeAccountPage.main.pending.title')}
                    >
                        <SafePendingTransactionList
                            address={address}
                            currentNonce={safeInfo?.nonce}
                            network={network}
                        />
                    </Page.MainSection>
                    <Page.MainSection
                        title={t('app.safe.safeAccountPage.main.assets.title')}
                    >
                        <SafeBalanceList address={address} network={network} />
                    </Page.MainSection>
                </Page.Main>
                <Page.Aside>
                    <Page.AsideCard
                        title={t(
                            'app.safe.safeAccountPage.aside.details.title',
                        )}
                    >
                        <DefinitionList.Container>
                            <DefinitionList.Item
                                term={t(
                                    'app.safe.safeAccountPage.aside.details.chain',
                                )}
                            >
                                <p className="text-neutral-500">
                                    {networkDefinition?.name}
                                </p>
                            </DefinitionList.Item>
                            <DefinitionList.Item
                                copyValue={address}
                                link={{ href: addressLink }}
                                term={t(
                                    'app.safe.safeAccountPage.aside.details.address',
                                )}
                            >
                                {truncatedAddress}
                            </DefinitionList.Item>
                            <DefinitionList.Item
                                term={t(
                                    'app.safe.safeAccountPage.aside.details.version',
                                )}
                            >
                                <p className="text-neutral-500">
                                    {safeInfo?.version ??
                                        t(
                                            'app.safe.safeAccountPage.aside.details.unknown',
                                        )}
                                </p>
                            </DefinitionList.Item>
                            <DefinitionList.Item
                                term={t(
                                    'app.safe.safeAccountPage.aside.details.nonce',
                                )}
                            >
                                <p className="text-neutral-500">
                                    {safeInfo?.nonce}
                                </p>
                            </DefinitionList.Item>
                            <DefinitionList.Item
                                term={t(
                                    'app.safe.safeAccountPage.aside.details.threshold',
                                )}
                            >
                                <p className="text-neutral-500">
                                    {safeInfo != null
                                        ? t(
                                              'app.safe.safeAccountPage.aside.details.thresholdValue',
                                              {
                                                  threshold: safeInfo.threshold,
                                                  owners: safeInfo.owners
                                                      .length,
                                              },
                                          )
                                        : undefined}
                                </p>
                            </DefinitionList.Item>
                        </DefinitionList.Container>
                    </Page.AsideCard>
                </Page.Aside>
            </Page.Content>
        </>
    );
};
