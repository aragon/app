'use client';

import {
    AlertCard,
    addressUtils,
    Button,
    CardEmptyState,
    Clipboard,
    IconType,
    Spinner,
    Tabs,
    Tag,
} from '@aragon/gov-ui-kit';
import { formatEther } from 'viem';
import {
    MpcApiError,
    useMpcBalance,
    useMpcSystem,
} from '@/modules/mpc/api/mpcService';
import type {
    IMpcSignRequest,
    IMpcSystem,
} from '@/modules/mpc/api/mpcService/domain';
import { MpcActivityList } from '@/modules/mpc/components/mpcActivityList';
import { MpcAuthGate } from '@/modules/mpc/components/mpcAuthGate';
import { MpcErrorAlert } from '@/modules/mpc/components/mpcErrorAlert';
import { MpcMembersList } from '@/modules/mpc/components/mpcMembersList';
import { MpcMockBanner } from '@/modules/mpc/components/mpcMockBanner';
import { MpcPolicySummary } from '@/modules/mpc/components/mpcPolicySummary';
import { getMpcRequestPermissions } from '@/modules/mpc/components/mpcRequestItem';
import { MpcRequestList } from '@/modules/mpc/components/mpcRequestList';
import { MpcShareStatus } from '@/modules/mpc/components/mpcShareStatus';
import { MpcSystemSettings } from '@/modules/mpc/components/mpcSystemSettings';
import {
    MPC_LIST_PATH,
    mpcAddressExplorerUrl,
} from '@/modules/mpc/constants/mpcConstants';
import { MpcDialogId } from '@/modules/mpc/constants/mpcDialogId';
import { useMpcHasDeviceShare } from '@/modules/mpc/hooks/useMpcHasDeviceShare';
import { useMpcSessionGuard } from '@/modules/mpc/hooks/useMpcSessionGuard';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IMpcSystemPageClientProps {
    /**
     * ID of the system.
     */
    systemId: string;
}

type MpcSystemTab = 'requests' | 'policy' | 'members' | 'activity' | 'settings';

const tabs: MpcSystemTab[] = [
    'requests',
    'policy',
    'members',
    'activity',
    'settings',
];

interface IMpcSystemContentProps {
    system: IMpcSystem;
}

const MpcSystemContent: React.FC<IMpcSystemContentProps> = (props) => {
    const { system } = props;
    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { session } = useMpcSessionGuard();

    const username = session?.user.username;
    const currentMember = system.members.find(
        (member) => member.userId === session?.user.id,
    );
    const role = currentMember?.role;
    const isOwner = role === 'owner';
    const canCreateRequest =
        (role === 'owner' || role === 'approver') && system.status === 'active';

    const { hasDeviceShare } = useMpcHasDeviceShare(
        system.id,
        system.providerId,
    );
    const { data: balance } = useMpcBalance(
        { urlParams: { systemId: system.id } },
        { enabled: system.status === 'active', refetchInterval: 30_000 },
    );

    const handleNewRequest = () =>
        open(MpcDialogId.NEW_REQUEST, { params: { system } });
    const handleSignClick = (request: IMpcSignRequest) =>
        open(MpcDialogId.SIGN_REQUEST, { params: { system, request } });
    const handleReviewClick = (request: IMpcSignRequest) => {
        const { canApprove, canReject } = getMpcRequestPermissions({
            request,
            role,
            username,
            hasDeviceShare,
        });
        open(MpcDialogId.APPROVE_REQUEST, {
            params: { request, canApprove, canReject },
        });
    };

    const balanceLabel =
        balance != null
            ? t('app.mpc.mpcSystemPage.header.balance', {
                  balance: formatEther(BigInt(balance.balanceWei)),
              })
            : t('app.mpc.mpcSystemPage.header.balanceLoading');

    return (
        <>
            <Page.Header
                breadcrumbs={[
                    {
                        label: t('app.mpc.mpcSystemPage.header.breadcrumb'),
                        href: MPC_LIST_PATH,
                    },
                    { label: system.name },
                ]}
                breadcrumbsTag={{
                    label: t('app.mpc.mpcSystemPage.header.pocTag'),
                    variant: 'warning',
                }}
                description={system.description}
                stats={
                    system.status === 'active'
                        ? [
                              {
                                  label: t(
                                      'app.mpc.mpcSystemPage.header.stats.balance',
                                  ),
                                  value: balanceLabel,
                              },
                              {
                                  label: t(
                                      'app.mpc.mpcSystemPage.header.stats.epoch',
                                  ),
                                  value: system.epoch.toString(),
                              },
                              {
                                  label: t(
                                      'app.mpc.mpcSystemPage.header.stats.members',
                                  ),
                                  value: system.members.length.toString(),
                              },
                          ]
                        : undefined
                }
                title={system.name}
            >
                <div className="flex flex-wrap items-center gap-3 pb-6">
                    {system.address != null ? (
                        <Clipboard copyValue={system.address}>
                            <a
                                className="font-mono text-neutral-800 text-sm underline md:text-base"
                                href={mpcAddressExplorerUrl(system.address)}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                {addressUtils.truncateAddress(system.address)}
                            </a>
                        </Clipboard>
                    ) : (
                        <Tag
                            label={t('app.mpc.mpcSystemPage.header.noAddress')}
                            variant="warning"
                        />
                    )}
                    <Tag
                        label={t('app.mpc.mpcSystemPage.header.mockTag')}
                        variant="warning"
                    />
                    <Tag
                        label={t(
                            `app.mpc.mpcSystemCard.status.${system.status}`,
                        )}
                        variant={
                            system.status === 'active' ? 'success' : 'warning'
                        }
                    />
                    {role != null && (
                        <Tag
                            label={t(`app.mpc.mpcMembersList.role.${role}`)}
                            variant="info"
                        />
                    )}
                </div>
            </Page.Header>
            <Page.Content>
                <Page.Main>
                    <MpcMockBanner />
                    {system.status === 'initializing' && (
                        <AlertCard
                            message={t(
                                'app.mpc.mpcSystemPage.initializing.title',
                            )}
                            variant="warning"
                        >
                            {t(
                                'app.mpc.mpcSystemPage.initializing.description',
                            )}
                        </AlertCard>
                    )}
                    <Tabs.Root defaultValue="requests" isUnderlined={true}>
                        <Tabs.List>
                            {tabs.map((tab) => (
                                <Tabs.Trigger
                                    key={tab}
                                    label={t(
                                        `app.mpc.mpcSystemPage.tabs.${tab}`,
                                    )}
                                    value={tab}
                                />
                            ))}
                        </Tabs.List>
                        <Tabs.Content className="pt-6" value="requests">
                            <Page.MainSection
                                action={
                                    canCreateRequest
                                        ? {
                                              label: t(
                                                  'app.mpc.mpcSystemPage.requests.action',
                                              ),
                                              iconLeft: IconType.PLUS,
                                              onClick: handleNewRequest,
                                          }
                                        : undefined
                                }
                                title={t(
                                    'app.mpc.mpcSystemPage.requests.title',
                                )}
                            >
                                {system.status === 'active' &&
                                    hasDeviceShare === false && (
                                        <AlertCard
                                            message={t(
                                                'app.mpc.mpcSystemPage.requests.noDeviceShare.title',
                                            )}
                                            variant="warning"
                                        >
                                            {t(
                                                'app.mpc.mpcSystemPage.requests.noDeviceShare.description',
                                            )}
                                        </AlertCard>
                                    )}
                                <MpcRequestList
                                    hasDeviceShare={hasDeviceShare}
                                    onNewRequestClick={
                                        canCreateRequest
                                            ? handleNewRequest
                                            : undefined
                                    }
                                    onReviewClick={handleReviewClick}
                                    onSignClick={handleSignClick}
                                    role={role}
                                    systemId={system.id}
                                    username={username}
                                />
                            </Page.MainSection>
                        </Tabs.Content>
                        <Tabs.Content className="pt-6" value="policy">
                            <Page.MainSection
                                action={
                                    isOwner
                                        ? {
                                              label: t(
                                                  'app.mpc.mpcSystemPage.policy.action',
                                              ),
                                              iconLeft: IconType.PEN,
                                              onClick: () =>
                                                  open(
                                                      MpcDialogId.EDIT_POLICY,
                                                      {
                                                          params: { system },
                                                      },
                                                  ),
                                          }
                                        : undefined
                                }
                                title={t('app.mpc.mpcSystemPage.policy.title')}
                            >
                                <MpcPolicySummary policy={system.policy} />
                            </Page.MainSection>
                        </Tabs.Content>
                        <Tabs.Content className="pt-6" value="members">
                            <Page.MainSection
                                title={t('app.mpc.mpcSystemPage.members.title')}
                            >
                                <MpcMembersList
                                    canManage={isOwner}
                                    onAddMemberClick={() =>
                                        open(MpcDialogId.ADD_MEMBER, {
                                            params: { systemId: system.id },
                                        })
                                    }
                                    systemId={system.id}
                                />
                            </Page.MainSection>
                        </Tabs.Content>
                        <Tabs.Content className="pt-6" value="activity">
                            <Page.MainSection
                                title={t(
                                    'app.mpc.mpcSystemPage.activity.title',
                                )}
                            >
                                <MpcActivityList systemId={system.id} />
                            </Page.MainSection>
                        </Tabs.Content>
                        <Tabs.Content className="pt-6" value="settings">
                            <Page.MainSection
                                title={t(
                                    'app.mpc.mpcSystemPage.settings.title',
                                )}
                            >
                                <MpcSystemSettings
                                    hasDeviceShare={hasDeviceShare}
                                    isOwner={isOwner}
                                    system={system}
                                />
                            </Page.MainSection>
                        </Tabs.Content>
                    </Tabs.Root>
                </Page.Main>
                <Page.Aside>
                    <MpcShareStatus
                        hasDeviceShare={hasDeviceShare}
                        system={system}
                    />
                    {system.status === 'active' &&
                        hasDeviceShare === false &&
                        isOwner && (
                            <Button
                                onClick={() =>
                                    open(MpcDialogId.RECOVER, {
                                        params: { system },
                                    })
                                }
                                size="md"
                                variant="secondary"
                            >
                                {t('app.mpc.mpcSystemPage.aside.recover')}
                            </Button>
                        )}
                </Page.Aside>
            </Page.Content>
        </>
    );
};

const MpcSystemLoader: React.FC<IMpcSystemPageClientProps> = (props) => {
    const { systemId } = props;
    const { t } = useTranslations();
    const { data, isLoading, error } = useMpcSystem(
        { urlParams: { systemId } },
        { retry: false, refetchInterval: 15_000 },
    );

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Spinner size="xl" variant="neutral" />
            </div>
        );
    }

    if (
        MpcApiError.isMpcApiError(error) &&
        (error.status === 404 || error.status === 403)
    ) {
        return (
            <Page.Main fullWidth={true}>
                <CardEmptyState
                    description={t(
                        'app.mpc.mpcSystemPage.notFound.description',
                    )}
                    heading={t('app.mpc.mpcSystemPage.notFound.heading')}
                    objectIllustration={{ object: 'NOT_FOUND' }}
                    primaryButton={{
                        label: t('app.mpc.mpcSystemPage.notFound.action'),
                        href: MPC_LIST_PATH,
                    }}
                />
            </Page.Main>
        );
    }

    if (error != null || data == null) {
        return (
            <Page.Main fullWidth={true}>
                <MpcErrorAlert error={error} />
            </Page.Main>
        );
    }

    return <MpcSystemContent system={data} />;
};

export const MpcSystemPageClient: React.FC<IMpcSystemPageClientProps> = (
    props,
) => (
    <MpcAuthGate className="m-auto w-full max-w-[1024px] px-4 py-10 md:px-6">
        <MpcSystemLoader {...props} />
    </MpcAuthGate>
);
