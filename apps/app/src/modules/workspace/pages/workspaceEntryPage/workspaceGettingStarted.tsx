'use client';

import {
    AlertInline,
    Button,
    Card,
    CardEmptyState,
    Heading,
    IconType,
    Spinner,
} from '@aragon/gov-ui-kit';
import { useDisconnect } from '@reown/appkit/react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { NavigationWizard } from '@/modules/application/components/navigations/navigationWizard';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { useWalletConnected } from '@/modules/application/hooks/useWalletConnected';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkUtils } from '@/shared/utils/networkUtils';
import {
    type IWorkspace,
    type IWorkspaceAccount,
    useCreateDefaultWorkspace,
    workspaceServiceKeys,
} from '../../api/workspaceService';
import {
    WorkspaceAccountSelect,
    WorkspaceAccountSelectStatusAlert,
} from '../../components/workspaceAccountSelect';
import { useWorkspaceAccountSuggestions } from '../../hooks/useWorkspaceAccountSuggestions';
import {
    workspaceAllAccountsSegment,
    workspaceUtils,
} from '../../utils/workspaceUtils';
import { workspaceWelcomeUtils } from '../../utils/workspaceWelcomeUtils';

/**
 * Creates the first workspace from the accounts the wallet picks.
 */
export const WorkspaceGettingStarted: React.FC = () => {
    const { t } = useTranslations();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { disconnect } = useDisconnect();
    const isConnected = useWalletConnected();
    const { address } = useWalletAccount();
    const {
        suggestions,
        isPending: isScanning,
        isError: isScanError,
        isIncomplete,
    } = useWorkspaceAccountSuggestions(address);

    const [selected, setSelected] = useState<IWorkspaceAccount[]>([]);
    const [isAddressViewOpen, setIsAddressViewOpen] = useState(false);
    // An account added by address stays listed even unchecked, so the list is no longer empty.
    const [hasAddedByAddress, setHasAddedByAddress] = useState(false);

    const handleSelectionChange = (accounts: IWorkspaceAccount[]) => {
        setSelected(accounts);

        if (accounts.length > 0 && isAddressViewOpen) {
            setHasAddedByAddress(true);
        }
    };

    // Another wallet account starts from an empty selection.
    const [selectionAddress, setSelectionAddress] = useState(address);
    if (selectionAddress !== address) {
        setSelectionAddress(address);
        setSelected([]);
        setHasAddedByAddress(false);
    }

    // Prefetched, so a disconnect leaves at once.
    useEffect(() => router.prefetch('/'), [router]);

    // Every disconnect returns to the landing page.
    useEffect(() => {
        if (!isConnected) {
            router.replace('/');
        }
    }, [isConnected, router]);

    // Leaves through the effect above, or directly if the disconnect fails.
    const handleExit = async (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();

        try {
            await disconnect();
        } catch {
            router.replace('/');
        }
    };

    // TODO(APP-1499): create the account in place and return here with it selected.
    const handleCreateAccount = () => router.push('/create/dao');

    const handleSuccess = async (workspace: IWorkspace) => {
        await queryClient.invalidateQueries({
            queryKey: workspaceServiceKeys.workspaceList(),
        });
        // The workspace layout greets the user on arrival.
        workspaceWelcomeUtils.markPendingWelcome();
        router.replace(
            workspaceUtils.getAccountScopeUrl(
                workspace.id,
                workspaceAllAccountsSegment,
                'overview',
            ),
        );
    };

    // A ref, as a second click can land before the pending state renders.
    const isCreatingRef = useRef(false);

    const {
        mutate: createWorkspace,
        variables,
        isPending,
        isSuccess,
        isError,
    } = useCreateDefaultWorkspace({
        onSuccess: handleSuccess,
        onError: () => {
            isCreatingRef.current = false;
        },
    });

    const handleCreate = (accounts: IWorkspaceAccount[]) => {
        if (isCreatingRef.current) {
            return;
        }

        isCreatingRef.current = true;
        createWorkspace(accounts);
    };

    // Busy until the navigation leaves the page.
    const isBusy = isPending || isSuccess;
    const isAddingLater = isBusy && variables?.length === 0;

    const hasNoAccounts =
        address != null &&
        !isScanning &&
        !isScanError &&
        suggestions.length === 0;
    // A finished scan found nothing, and nothing was added by address or selected.
    const hasNothingToList =
        hasNoAccounts && !hasAddedByAddress && selected.length === 0;
    // Replaces the empty selector once a complete scan found nothing, unless its address view is open.
    const showEmptyCard =
        hasNothingToList && !isIncomplete && !isAddressViewOpen;

    const addLabel =
        selected.length === 0
            ? t('app.workspace.workspaceGettingStarted.action.add')
            : selected.length === 1
              ? t('app.workspace.workspaceGettingStarted.action.addOne')
              : t('app.workspace.workspaceGettingStarted.action.addMany', {
                    count: selected.length,
                });

    // The disconnect effect is already leaving.
    if (!isConnected) {
        return null;
    }

    return (
        <>
            <NavigationWizard
                exitPath="/"
                name="app.workspace.workspaceGettingStarted.name"
                onExit={handleExit}
            />
            <Page.Main fullWidth={true}>
                <div className="mx-auto flex w-full max-w-[800px] flex-col gap-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Heading size="h1">
                                {t(
                                    'app.workspace.workspaceGettingStarted.title',
                                )}
                            </Heading>
                            <p className="text-base leading-normal font-normal text-neutral-500 md:text-lg">
                                {t(
                                    'app.workspace.workspaceGettingStarted.description',
                                )}
                            </p>
                        </div>
                        {isScanning && (
                            <div
                                className="flex items-center gap-2 text-sm text-neutral-500"
                                role="status"
                            >
                                <Spinner size="sm" variant="neutral" />
                                {t(
                                    'app.workspace.workspaceGettingStarted.scanning',
                                    {
                                        count: networkUtils.getSupportedNetworks()
                                            .length,
                                        found: suggestions.length,
                                    },
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-4">
                        <WorkspaceAccountSelectStatusAlert />
                        {showEmptyCard ? (
                            <CardEmptyState
                                description={t(
                                    'app.workspace.workspaceGettingStarted.emptyState.description',
                                )}
                                heading={t(
                                    'app.workspace.workspaceGettingStarted.emptyState.heading',
                                )}
                                isStacked={true}
                                objectIllustration={{ object: 'WALLET' }}
                                primaryButton={{
                                    label: t(
                                        'app.workspace.workspaceGettingStarted.action.createAccount',
                                    ),
                                    onClick: handleCreateAccount,
                                }}
                                secondaryButton={{
                                    label: t(
                                        'app.workspace.workspaceGettingStarted.emptyState.addByAddress',
                                    ),
                                    onClick: () => setIsAddressViewOpen(true),
                                }}
                            />
                        ) : (
                            <>
                                <Card className="p-4 shadow-neutral-sm md:p-6">
                                    <WorkspaceAccountSelect
                                        initialMode={
                                            isAddressViewOpen
                                                ? 'address'
                                                : 'list'
                                        }
                                        // Another wallet account starts from a fresh list.
                                        key={address}
                                        onChange={handleSelectionChange}
                                        onModeChange={(mode) =>
                                            setIsAddressViewOpen(
                                                mode === 'address',
                                            )
                                        }
                                        value={selected}
                                    />
                                </Card>
                                <Button
                                    className="self-start"
                                    iconLeft={IconType.PLUS}
                                    onClick={handleCreateAccount}
                                    size="md"
                                    variant={
                                        hasNothingToList
                                            ? 'primary'
                                            : 'secondary'
                                    }
                                >
                                    {t(
                                        'app.workspace.workspaceGettingStarted.action.createAccount',
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                    {!showEmptyCard && (
                        // Below `md`, a full-width bar stuck to the bottom; negative margins cancel `Page.Main`'s padding.
                        <div className="sticky bottom-0 z-5 -mx-4 -mb-10 flex flex-col gap-6 border-t border-neutral-100 bg-neutral-0 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] md:static md:z-auto md:mx-0 md:mb-0 md:border-t-0 md:bg-transparent md:p-0">
                            {isError && (
                                <AlertInline
                                    message={t(
                                        'app.workspace.workspaceGettingStarted.error',
                                    )}
                                    variant="critical"
                                />
                            )}
                            <div className="flex flex-wrap justify-end gap-3">
                                <Button
                                    disabled={isBusy}
                                    isLoading={isAddingLater}
                                    onClick={() => handleCreate([])}
                                    size="lg"
                                    variant="ghost"
                                >
                                    {t(
                                        'app.workspace.workspaceGettingStarted.action.later',
                                    )}
                                </Button>
                                <Button
                                    disabled={selected.length === 0 || isBusy}
                                    isLoading={isBusy && !isAddingLater}
                                    onClick={() => handleCreate(selected)}
                                    size="lg"
                                    variant="primary"
                                >
                                    {addLabel}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Page.Main>
        </>
    );
};
