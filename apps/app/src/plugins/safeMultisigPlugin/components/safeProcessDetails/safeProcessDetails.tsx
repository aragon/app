'use client';

import {
    addressUtils,
    Card,
    CardEmptyState,
    ChainEntityType,
    DefinitionList,
} from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import {
    safeAppAccountUrl,
    safeShortNameFromNetwork,
} from '@/modules/application/utils/proxySafeUtils/safeTxServiceNetworks';
import { PermissionsDefinitionList } from '@/modules/governance/components/permissionsDefinitionList';
import { SafeOwnerList } from '@/modules/safe/components/safeOwnerList';
import { safeSettingsUtils } from '@/modules/safe/utils/safeSettingsUtils';
import { DaoProcessAllowedActions } from '@/modules/settings/components/daoProccessAllowedActions';
import { SafeServiceError, useSafeInfo } from '@/shared/api/safeService';
import { Page } from '@/shared/components/page';
import { proposalCreationEligibilityAnchor } from '@/shared/components/processDataListItem';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { daoTargetUtils } from '@/shared/utils/daoTargetUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import { useSafeProcessPermissionCheckProposalCreation } from '../../hooks/useSafeProcessPermissionCheckProposalCreation';
import type { ISafeProcessDetailsProps } from './safeProcessDetails.api';

export const SafeProcessDetails: React.FC<ISafeProcessDetailsProps> = (
    props,
) => {
    const { dao, plugin } = props;
    const { t } = useTranslations();
    const { network } = dao;
    const { buildEntityUrl, networkDefinition } = useDaoChain({ network });
    const address = addressUtils.getChecksum(plugin.address);
    const isNetworkSupported = safeShortNameFromNetwork(network) != null;

    const { data: safeInfo, error: safeInfoError } = useSafeInfo(
        { urlParams: { network, address } },
        { enabled: isNetworkSupported },
    );

    const isUnsupported =
        !isNetworkSupported ||
        SafeServiceError.isUnsupportedChainError(safeInfoError);
    const safeHref =
        safeAppAccountUrl({ network, address }) ??
        buildEntityUrl({ type: ChainEntityType.ADDRESS, id: address });
    const detailRows = [
        safeSettingsUtils.addressRow({
            address,
            safeName: addressUtils.truncateAddress(address),
            safeHref,
            version: safeInfo?.version,
            t,
        }),
        ...(safeInfo == null
            ? []
            : [
                  ...safeSettingsUtils.liveConfigurationRows({ safeInfo, t }),
                  ...safeSettingsUtils.authorityRows({ safeInfo, t }),
              ]),
    ];

    const permissionCheck = useSafeProcessPermissionCheckProposalCreation({
        daoId: dao.id,
        plugin,
        useConnectedUserInfo: false,
    });
    const hasProposalCreationEligibility = permissionCheck.settings.length > 0;

    useEffect(() => {
        if (
            !hasProposalCreationEligibility ||
            window.location.hash !== `#${proposalCreationEligibilityAnchor}`
        ) {
            return;
        }

        document
            .getElementById(proposalCreationEligibilityAnchor)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [hasProposalCreationEligibility]);

    const pageTitle = daoUtils.getPluginName(plugin);
    const pageBreadcrumbs = [
        {
            href: daoUtils.getDaoUrl(dao, 'settings'),
            label: t(
                'app.settings.daoProcessDetailsPage.header.breadcrumb.settings',
            ),
        },
        { label: pageTitle },
    ];

    const targetAddress = plugin.daoAddress ?? dao.address;
    const targetName =
        (dao.linkedAccounts?.length ?? 0) > 0 && targetAddress != null
            ? daoTargetUtils.findTargetDao({ dao, targetAddress })?.name
            : undefined;

    return (
        <>
            <Page.Header
                breadcrumbs={pageBreadcrumbs}
                stats={
                    isUnsupported
                        ? undefined
                        : [
                              {
                                  label: t(
                                      'app.safe.safeAccountPage.stats.threshold',
                                  ),
                                  value: safeInfo?.threshold,
                              },
                              {
                                  label: t(
                                      'app.safe.safeAccountPage.stats.owners',
                                  ),
                                  value: safeInfo?.owners.length,
                              },
                              {
                                  label: t(
                                      'app.safe.safeAccountPage.stats.nonce',
                                  ),
                                  value: safeInfo?.nonce,
                              },
                          ]
                }
                title={pageTitle}
            />
            <Page.Content>
                <Page.Main>
                    <Page.MainSection
                        title={t('app.safe.safeAccountPage.main.owners.title')}
                    >
                        {isUnsupported ? (
                            <CardEmptyState
                                description={t(
                                    'app.safe.safeAccountPage.unsupportedNetwork.description',
                                    {
                                        network:
                                            networkDefinition?.name ?? network,
                                    },
                                )}
                                heading={t(
                                    'app.safe.safeAccountPage.unsupportedNetwork.heading',
                                )}
                                objectIllustration={{ object: 'CHAIN' }}
                            />
                        ) : (
                            <SafeOwnerList
                                address={address}
                                network={network}
                            />
                        )}
                    </Page.MainSection>
                    {hasProposalCreationEligibility && (
                        <Page.MainSection
                            id={proposalCreationEligibilityAnchor}
                            title={t(
                                'app.settings.daoProcessDetailsPage.section.creationEligibility',
                            )}
                        >
                            <Card>
                                <PermissionsDefinitionList
                                    className="px-6 py-3"
                                    isLoading={permissionCheck.isLoading}
                                    isRestricted={permissionCheck.isRestricted}
                                    settings={permissionCheck.settings}
                                />
                            </Card>
                        </Page.MainSection>
                    )}
                    {plugin.conditionAddress != null && (
                        <Page.MainSection
                            title={t(
                                'app.settings.daoProcessDetailsPage.section.actions',
                            )}
                        >
                            <DaoProcessAllowedActions
                                network={network}
                                plugin={plugin}
                            />
                        </Page.MainSection>
                    )}
                </Page.Main>
                <Page.Aside>
                    <Page.AsideCard
                        title={t(
                            'app.settings.daoProcessDetailsPage.section.details',
                        )}
                    >
                        <DefinitionList.Container>
                            {(dao.linkedAccounts?.length ?? 0) > 0 &&
                                targetAddress != null && (
                                    <DefinitionList.Item
                                        description={targetName}
                                        link={{
                                            href: buildEntityUrl({
                                                type: ChainEntityType.ADDRESS,
                                                id: targetAddress,
                                            }),
                                            isExternal: true,
                                            isOnchainEntity: true,
                                        }}
                                        term={t(
                                            'app.settings.daoProcessDetailsInfo.targetDao',
                                        )}
                                    >
                                        {targetAddress}
                                    </DefinitionList.Item>
                                )}
                            {detailRows.map((row) => (
                                <DefinitionList.Item
                                    copyValue={row.copyValue}
                                    description={row.description}
                                    key={row.term}
                                    link={row.link}
                                    term={row.term}
                                >
                                    {row.link == null ? (
                                        <p className="text-neutral-500">
                                            {row.definition}
                                        </p>
                                    ) : (
                                        row.definition
                                    )}
                                </DefinitionList.Item>
                            ))}
                        </DefinitionList.Container>
                    </Page.AsideCard>
                </Page.Aside>
            </Page.Content>
        </>
    );
};

export type { ISafeProcessDetailsProps } from './safeProcessDetails.api';
