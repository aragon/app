'use client';

import {
    AlertCard,
    addressUtils,
    Button,
    Card,
    CardEmptyState,
    Clipboard,
    DefinitionList,
    Heading,
    InputNumber,
    InputText,
    Spinner,
    Tag,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import {
    encodeFunctionData,
    erc20Abi,
    formatEther,
    formatUnits,
    getAddress,
    parseUnits,
} from 'viem';
import { useReadContract } from 'wagmi';
import {
    useMpcBalance,
    useMpcCreateRequest,
    useMpcRequests,
    useMpcSystems,
    useMpcUpdatePolicy,
} from '@/modules/mpc/api/mpcService';
import type {
    IMpcSignRequest,
    IMpcSystem,
} from '@/modules/mpc/api/mpcService/domain';
import { MpcErrorAlert } from '@/modules/mpc/components/mpcErrorAlert';
import { MpcMockBanner } from '@/modules/mpc/components/mpcMockBanner';
import {
    getMpcRequestPermissions,
    mpcRequestStatusVariant,
} from '@/modules/mpc/components/mpcRequestItem';
import {
    MPC_DEMO_PATH,
    MPC_DEMO_TOKEN,
    MPC_DEMO_TOKEN_APPROVAL_ABOVE_UNITS,
    MPC_DEMO_TOKEN_MAX_UNITS,
    MPC_LIST_PATH,
    MPC_LOGIN_PATH,
    MPC_SEPOLIA_CHAIN_ID,
    mpcAddressExplorerUrl,
    mpcTransactionExplorerUrl,
} from '@/modules/mpc/constants/mpcConstants';
import { MpcDialogId } from '@/modules/mpc/constants/mpcDialogId';
import { useMpcHasDeviceShare } from '@/modules/mpc/hooks/useMpcHasDeviceShare';
import { useMpcSessionGuard } from '@/modules/mpc/hooks/useMpcSessionGuard';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IMpcDemoPageClientProps {}

const shortAddress = (address: string) =>
    `${address.slice(0, 6)}…${address.slice(-4)}`;

const formatTokenUnits = (units: string) =>
    formatUnits(BigInt(units), MPC_DEMO_TOKEN.decimals);

/**
 * Returns the token limit of the demo token when the system policy configures it.
 */
const getDemoTokenLimit = (system: IMpcSystem) =>
    system.policy.tokenLimits?.find(
        (limit) =>
            limit.token.toLowerCase() === MPC_DEMO_TOKEN.address.toLowerCase(),
    );

/**
 * The demo runs on one system: prefer an active system already carrying the demo policy, fall back to any
 * active system of the account.
 */
const getDemoSystem = (systems?: IMpcSystem[]) => {
    const activeSystems = systems?.filter(
        (system) => system.status === 'active',
    );

    return (
        activeSystems?.find((system) => getDemoTokenLimit(system) != null) ??
        activeSystems?.[0]
    );
};

export const MpcDemoPageClient: React.FC<IMpcDemoPageClientProps> = () => {
    const { t } = useTranslations();
    const { open } = useDialogContext();
    const {
        session,
        isAuthenticated,
        isLoading: isSessionLoading,
    } = useMpcSessionGuard();

    const { data: systems, isLoading: areSystemsLoading } = useMpcSystems({
        enabled: isAuthenticated,
    });
    const system = getDemoSystem(systems);
    const systemId = system?.id ?? '';

    const { hasDeviceShare } = useMpcHasDeviceShare(
        systemId,
        system?.providerId,
    );
    const { data: balance } = useMpcBalance(
        { urlParams: { systemId } },
        { enabled: system != null, refetchInterval: 30_000 },
    );
    const { data: requests } = useMpcRequests(
        { urlParams: { systemId } },
        { enabled: system != null, refetchInterval: 10_000 },
    );
    const { data: tokenBalance } = useReadContract({
        abi: erc20Abi,
        address: MPC_DEMO_TOKEN.address,
        chainId: MPC_SEPOLIA_CHAIN_ID,
        functionName: 'balanceOf',
        args: [system?.address ?? '0x0000000000000000000000000000000000000000'],
        query: { enabled: system?.address != null, refetchInterval: 30_000 },
    });

    const [amount, setAmount] = useState('');
    const [recipientInput, setRecipientInput] = useState('');

    const createRequest = useMpcCreateRequest();
    const updatePolicy = useMpcUpdatePolicy();

    const tokenLimit = system != null ? getDemoTokenLimit(system) : undefined;
    const recipient = system?.policy.recipientAllowlist?.[0];
    const isPolicyConfigured = tokenLimit != null && recipient != null;

    const member = system?.members.find(
        (item) => item.userId === session?.user.id,
    );
    const isOwner = member?.role === 'owner';
    const canTransfer = member?.role === 'owner' || member?.role === 'approver';

    // Latest transaction request of the system: the demo drives one transfer at a time.
    const latestRequest = requests?.find(
        (request) => request.type === 'transaction',
    );

    const handleApplyPolicy = () => {
        if (system == null || !addressUtils.isAddress(recipientInput)) {
            return;
        }

        updatePolicy.mutate({
            urlParams: { systemId: system.id },
            body: {
                ...system.policy,
                // Lowercase first: the non-strict address check accepts any casing, getAddress re-checksums.
                recipientAllowlist: [getAddress(recipientInput.toLowerCase())],
                tokenLimits: [
                    {
                        token: MPC_DEMO_TOKEN.address,
                        symbol: MPC_DEMO_TOKEN.symbol,
                        decimals: MPC_DEMO_TOKEN.decimals,
                        maxAmountUnits: MPC_DEMO_TOKEN_MAX_UNITS,
                        requireApprovalAboveUnits:
                            MPC_DEMO_TOKEN_APPROVAL_ABOVE_UNITS,
                    },
                ],
            },
        });
    };

    const handleTransfer = () => {
        if (system == null || recipient == null || amount.length === 0) {
            return;
        }

        const data = encodeFunctionData({
            abi: erc20Abi,
            functionName: 'transfer',
            args: [
                getAddress(recipient),
                parseUnits(amount, MPC_DEMO_TOKEN.decimals),
            ],
        });

        createRequest.mutate(
            {
                urlParams: { systemId: system.id },
                body: {
                    payload: {
                        type: 'transaction',
                        transaction: {
                            chainId: MPC_SEPOLIA_CHAIN_ID,
                            to: MPC_DEMO_TOKEN.address,
                            valueWei: '0',
                            data,
                        },
                    },
                },
            },
            {
                onSuccess: (request) => {
                    setAmount('');

                    // The policy allowed the transfer without approvals: continue straight to the signature.
                    if (request.status === 'approved' && hasDeviceShare) {
                        open(MpcDialogId.SIGN_REQUEST, {
                            params: { system, request },
                        });
                    }
                },
            },
        );
    };

    const handleRequestAction = (request: IMpcSignRequest) => {
        if (system == null) {
            return;
        }

        const permissions = getMpcRequestPermissions({
            request,
            role: member?.role,
            username: session?.user.username,
            hasDeviceShare,
        });

        if (permissions.canSign) {
            open(MpcDialogId.SIGN_REQUEST, { params: { system, request } });
        } else if (permissions.canApprove || permissions.canReject) {
            open(MpcDialogId.APPROVE_REQUEST, {
                params: {
                    request,
                    canApprove: permissions.canApprove,
                    canReject: permissions.canReject,
                },
            });
        }
    };

    if (isSessionLoading || (isAuthenticated && areSystemsLoading)) {
        return (
            <Page.Main fullWidth={true}>
                <div className="flex justify-center py-20">
                    <Spinner size="lg" variant="primary" />
                </div>
            </Page.Main>
        );
    }

    if (!isAuthenticated) {
        return (
            <Page.Main fullWidth={true} title={t('app.mpc.mpcDemoPage.title')}>
                <CardEmptyState
                    description={t('app.mpc.mpcDemoPage.login.description')}
                    heading={t('app.mpc.mpcDemoPage.login.title')}
                    objectIllustration={{ object: 'LABELS' }}
                    primaryButton={{
                        label: t('app.mpc.mpcDemoPage.login.action'),
                        href: `${MPC_LOGIN_PATH}?redirect=${MPC_DEMO_PATH}`,
                    }}
                />
            </Page.Main>
        );
    }

    if (system == null) {
        return (
            <Page.Main fullWidth={true} title={t('app.mpc.mpcDemoPage.title')}>
                <CardEmptyState
                    description={t('app.mpc.mpcDemoPage.noSystem.description')}
                    heading={t('app.mpc.mpcDemoPage.noSystem.title')}
                    objectIllustration={{ object: 'WALLET' }}
                    primaryButton={{
                        label: t('app.mpc.mpcDemoPage.noSystem.action'),
                        href: MPC_LIST_PATH,
                    }}
                />
            </Page.Main>
        );
    }

    const requestPermissions =
        latestRequest != null
            ? getMpcRequestPermissions({
                  request: latestRequest,
                  role: member?.role,
                  username: session?.user.username,
                  hasDeviceShare,
              })
            : undefined;
    const hasRequestAction =
        requestPermissions != null &&
        (requestPermissions.canSign || requestPermissions.canApprove);

    return (
        <Page.Main fullWidth={true} title={t('app.mpc.mpcDemoPage.title')}>
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 md:gap-6">
                <MpcMockBanner />
                <p className="text-neutral-500">
                    {t('app.mpc.mpcDemoPage.description')}
                </p>

                {/* MPC account */}
                <Card className="flex flex-col gap-4 p-4 md:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <Heading size="h2">{system.name}</Heading>
                        <Tag
                            label={t('app.mpc.mpcDemoPage.account.tag')}
                            variant="primary"
                        />
                    </div>
                    {system.address != null && (
                        <div className="flex items-center gap-2">
                            <a
                                className="truncate font-mono text-neutral-500 text-sm underline"
                                href={mpcAddressExplorerUrl(system.address)}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                {system.address}
                            </a>
                            <Clipboard copyValue={system.address} />
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1 rounded-xl border border-neutral-100 p-3 md:p-4">
                            <span className="text-neutral-500 text-sm">
                                {MPC_DEMO_TOKEN.symbol}
                            </span>
                            <span className="text-lg text-neutral-800 md:text-xl">
                                {tokenBalance != null
                                    ? formatUnits(
                                          tokenBalance,
                                          MPC_DEMO_TOKEN.decimals,
                                      )
                                    : '—'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 rounded-xl border border-neutral-100 p-3 md:p-4">
                            <span className="text-neutral-500 text-sm">
                                {t('app.mpc.mpcDemoPage.account.gas')}
                            </span>
                            <span className="text-lg text-neutral-800 md:text-xl">
                                {balance != null
                                    ? formatEther(BigInt(balance.balanceWei))
                                    : '—'}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Policy */}
                <Card className="flex flex-col gap-4 p-4 md:p-6">
                    <Heading size="h3">
                        {t('app.mpc.mpcDemoPage.policy.title')}
                    </Heading>
                    {isPolicyConfigured ? (
                        <DefinitionList.Container>
                            <DefinitionList.Item
                                term={t('app.mpc.mpcDemoPage.policy.rule')}
                            >
                                {t('app.mpc.mpcDemoPage.policy.ruleValue', {
                                    amount: formatTokenUnits(
                                        tokenLimit.maxAmountUnits ?? '0',
                                    ),
                                    symbol: tokenLimit.symbol,
                                    recipient: shortAddress(recipient),
                                })}
                            </DefinitionList.Item>
                            {tokenLimit.requireApprovalAboveUnits != null && (
                                <DefinitionList.Item
                                    term={t(
                                        'app.mpc.mpcDemoPage.policy.approvals',
                                    )}
                                >
                                    {t(
                                        'app.mpc.mpcDemoPage.policy.approvalsValue',
                                        {
                                            amount: formatTokenUnits(
                                                tokenLimit.requireApprovalAboveUnits,
                                            ),
                                            symbol: tokenLimit.symbol,
                                        },
                                    )}
                                </DefinitionList.Item>
                            )}
                        </DefinitionList.Container>
                    ) : isOwner ? (
                        <div className="flex flex-col gap-3">
                            <p className="text-neutral-500 text-sm">
                                {t('app.mpc.mpcDemoPage.policy.setupHelp', {
                                    amount: formatTokenUnits(
                                        MPC_DEMO_TOKEN_MAX_UNITS,
                                    ),
                                    symbol: MPC_DEMO_TOKEN.symbol,
                                })}
                            </p>
                            <InputText
                                label={t(
                                    'app.mpc.mpcDemoPage.policy.recipientLabel',
                                )}
                                onChange={(event) =>
                                    setRecipientInput(event.target.value)
                                }
                                placeholder="0x…"
                                value={recipientInput}
                            />
                            <div>
                                <Button
                                    disabled={
                                        !addressUtils.isAddress(recipientInput)
                                    }
                                    isLoading={updatePolicy.isPending}
                                    onClick={handleApplyPolicy}
                                    size="md"
                                    variant="secondary"
                                >
                                    {t('app.mpc.mpcDemoPage.policy.apply')}
                                </Button>
                            </div>
                            <MpcErrorAlert error={updatePolicy.error} />
                        </div>
                    ) : (
                        <p className="text-neutral-500 text-sm">
                            {t('app.mpc.mpcDemoPage.policy.notConfigured')}
                        </p>
                    )}
                </Card>

                {/* Transfer */}
                {isPolicyConfigured && canTransfer && (
                    <Card className="flex flex-col gap-4 p-4 md:p-6">
                        <Heading size="h3">
                            {t('app.mpc.mpcDemoPage.transfer.title', {
                                symbol: MPC_DEMO_TOKEN.symbol,
                            })}
                        </Heading>
                        <p className="text-neutral-500 text-sm">
                            {t('app.mpc.mpcDemoPage.transfer.description', {
                                recipient: shortAddress(recipient),
                            })}
                        </p>
                        <InputNumber
                            label={t('app.mpc.mpcDemoPage.transfer.amount')}
                            min={0}
                            onChange={(value) => setAmount(value ?? '')}
                            placeholder="0.1"
                            suffix={MPC_DEMO_TOKEN.symbol}
                            value={amount}
                        />
                        <div>
                            <Button
                                disabled={
                                    amount.length === 0 || Number(amount) <= 0
                                }
                                isLoading={createRequest.isPending}
                                onClick={handleTransfer}
                                size="lg"
                                variant="primary"
                            >
                                {t('app.mpc.mpcDemoPage.transfer.action')}
                            </Button>
                        </div>
                        <MpcErrorAlert error={createRequest.error} />
                    </Card>
                )}

                {/* Latest transfer */}
                {latestRequest != null && (
                    <Card className="flex flex-col gap-4 p-4 md:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <Heading size="h3">
                                {t('app.mpc.mpcDemoPage.request.title')}
                            </Heading>
                            <Tag
                                label={t(
                                    `app.mpc.mpcRequestItem.status.${latestRequest.status}`,
                                )}
                                variant={
                                    mpcRequestStatusVariant[
                                        latestRequest.status
                                    ]
                                }
                            />
                        </div>
                        <p className="text-neutral-800">
                            {latestRequest.summary.label}
                        </p>
                        <p className="text-neutral-500 text-sm">
                            {t('app.mpc.mpcDemoPage.request.createdBy', {
                                username: latestRequest.createdBy,
                            })}
                        </p>
                        {latestRequest.status === 'pending_approval' &&
                            !hasRequestAction && (
                                <AlertCard
                                    message={t(
                                        'app.mpc.mpcDemoPage.request.waitingTitle',
                                    )}
                                    variant="info"
                                >
                                    {t(
                                        'app.mpc.mpcDemoPage.request.waitingDescription',
                                        {
                                            approvals:
                                                latestRequest.approvals.length,
                                            required:
                                                latestRequest.approvalsRequired,
                                        },
                                    )}
                                </AlertCard>
                            )}
                        {latestRequest.txHash != null && (
                            <AlertCard
                                message={t(
                                    'app.mpc.mpcDemoPage.request.broadcastTitle',
                                )}
                                variant="success"
                            >
                                <a
                                    className="break-all font-mono underline"
                                    href={mpcTransactionExplorerUrl(
                                        latestRequest.txHash,
                                    )}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    {latestRequest.txHash}
                                </a>
                            </AlertCard>
                        )}
                        {hasRequestAction && (
                            <div>
                                <Button
                                    onClick={() =>
                                        handleRequestAction(latestRequest)
                                    }
                                    size="lg"
                                    variant="primary"
                                >
                                    {t(
                                        requestPermissions.canSign
                                            ? 'app.mpc.mpcDemoPage.request.sign'
                                            : 'app.mpc.mpcDemoPage.request.review',
                                    )}
                                </Button>
                            </div>
                        )}
                    </Card>
                )}
            </div>
        </Page.Main>
    );
};
