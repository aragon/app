'use client';

import { Button, Dropdown, IconType } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import {
    useParams,
    usePathname,
    useRouter,
    useSearchParams,
} from 'next/navigation';
import { Banner } from '@/shared/components/banner';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceAccountPageParams } from '@/shared/types';
import {
    type IWorkspace,
    useAddWorkspaceAccount,
    useWorkspace,
    useWorkspaceList,
    workspaceServiceKeys,
} from '../../api/workspaceService';
import { WorkspaceAccountState } from '../../constants/workspaceAccountState';
import { useWorkspaceAccountOptions } from '../../hooks/useWorkspaceAccountOptions';
import { workspaceUtils } from '../../utils/workspaceUtils';

export interface IWorkspaceExternalAccountBannerProps {}

/**
 * Banner of the account-scoped workspace pages when the route names an account the workspace does not hold (an
 * external option of `useWorkspaceAccountOptions`), offering to add it to this workspace or to another one.
 *
 * The account added is the external option's own, synthesized from the accounts API with a checksummed ID and its
 * resolved type, so the actions stay disabled until the API has placed the address as a DAO or a Safe — the same
 * accounts `workspaceUtils.validateAccountInfo` lets the create form add. It is appended through
 * `addWorkspaceAccount`, which reads the stored workspace itself, so a cached copy never overwrites a newer one.
 *
 * Adding to this workspace stays on the page: once the workspace is invalidated the account is held, so the option
 * stops being external and the banner goes. Adding to another workspace opens the same page there.
 */
export const WorkspaceExternalAccountBanner: React.FC<
    IWorkspaceExternalAccountBannerProps
> = () => {
    const { t } = useTranslations();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const { workspaceId } =
        useParams<Pick<IWorkspaceAccountPageParams, 'workspaceId'>>();
    const { activeOption, accountId } = useWorkspaceAccountOptions();
    // Loaded by `WorkspaceGate` before any page renders, unlike the list, which only feeds the other workspaces.
    const { data: currentWorkspace } = useWorkspace({
        urlParams: { id: workspaceId },
    });
    const { data: workspaces = [] } = useWorkspaceList();

    const {
        mutate: addWorkspaceAccount,
        isPending: isUpdating,
        isError,
    } = useAddWorkspaceAccount();

    // An address that is neither a DAO nor a Safe can never be added, and the page already says it is not found.
    if (
        !activeOption?.isExternal ||
        activeOption.accountState === WorkspaceAccountState.NOT_FOUND
    ) {
        return null;
    }

    const account = activeOption.account;
    const otherWorkspaces = workspaces.filter(
        (workspace) =>
            workspace.id !== workspaceId &&
            workspaceUtils.findAccountById(workspace.accounts, accountId) ==
                null,
    );

    const handleAdded = async (target: IWorkspace) => {
        await Promise.all([
            queryClient.invalidateQueries({
                queryKey: workspaceServiceKeys.workspaceList(),
            }),
            queryClient.invalidateQueries({
                queryKey: workspaceServiceKeys.workspace({
                    urlParams: { id: target.id },
                }),
            }),
        ]);

        if (target.id !== workspaceId) {
            router.push(
                workspaceUtils.getWorkspaceSwapUrl(
                    pathname,
                    target.id,
                    searchParams.toString(),
                ),
            );
        }
    };

    const addToWorkspace = (targetId: string) => {
        if (account == null) {
            return;
        }

        addWorkspaceAccount(
            { urlParams: { id: targetId }, body: { account } },
            { onSuccess: handleAdded },
        );
    };

    const handleAddToCurrent = () => addToWorkspace(workspaceId);

    const isDisabled = account == null || isUpdating;
    const translationNamespace = 'app.workspace.workspaceExternalAccountBanner';

    const message = isError
        ? t(`${translationNamespace}.error`)
        : t(`${translationNamespace}.message`, {
              account: activeOption.label,
              workspace: currentWorkspace?.name ?? '',
          });

    return (
        <Banner message={message}>
            <div className="flex flex-col gap-3 md:flex-row">
                <Button
                    disabled={isDisabled || currentWorkspace == null}
                    iconLeft={IconType.PLUS}
                    isLoading={isUpdating}
                    onClick={handleAddToCurrent}
                    size="sm"
                    variant="secondary"
                >
                    {t(`${translationNamespace}.addToCurrent`)}
                </Button>
                {otherWorkspaces.length > 0 && (
                    <Dropdown.Container
                        disabled={isDisabled}
                        label={t(`${translationNamespace}.addToOther`)}
                        size="sm"
                        variant="tertiary"
                    >
                        {otherWorkspaces.map((workspace) => (
                            <Dropdown.Item
                                key={workspace.id}
                                onSelect={() => addToWorkspace(workspace.id)}
                            >
                                {workspace.name}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Container>
                )}
            </div>
        </Banner>
    );
};
