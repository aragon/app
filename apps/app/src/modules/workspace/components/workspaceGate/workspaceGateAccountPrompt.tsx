'use client';

import {
    addressUtils,
    Button,
    Card,
    Heading,
    Radio,
    RadioGroup,
} from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { useWorkspaceAccounts } from '../../api/workspaceQueryService';
import {
    defaultWorkspaceName,
    type IWorkspace,
    useGetOrCreateDefaultWorkspace,
    useWorkspaceList,
    workspaceServiceKeys,
} from '../../api/workspaceService';
import { workspaceUtils } from '../../utils/workspaceUtils';

export interface IWorkspaceGateAccountPromptProps {
    /**
     * ID of the account the link is scoped to, already validated as one by `workspaceUtils.resolveAccountScope`.
     */
    accountId: string;
}

/**
 * Value of the option standing in for the default workspace while the registry is empty. It cannot collide with a
 * workspace ID, as it is only offered when there is no workspace.
 */
const pendingDefaultWorkspaceId = 'pending-default-workspace';

/**
 * Rendered by `WorkspaceGate` in place of the page when the link names a workspace the registry does not hold and
 * an account, e.g. a link shared from another device: it offers to open the same page in one of the reader's
 * workspaces instead.
 *
 * The page is carried over as is (`workspaceUtils.getWorkspaceSwapUrl`), with `router.replace` so that Back does not
 * land on the dead link again. When the registry is empty the default workspace is offered as a pending option and
 * only seeded on confirm, so nothing is written unless the reader acts (see `createWorkspace.md` → Registry).
 */
export const WorkspaceGateAccountPrompt: React.FC<
    IWorkspaceGateAccountPromptProps
> = (props) => {
    const { accountId } = props;

    const { t } = useTranslations();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const [isNavigating, startTransition] = useTransition();

    const { network, address } = daoUtils.parseDaoId(accountId);
    const { data: accountInfos } = useWorkspaceAccounts({
        body: { accounts: [{ network, address }] },
    });
    const accountLabel =
        workspaceUtils.findAccountInfo(accountInfos, { network, address })
            ?.name ?? addressUtils.truncateAddress(address);

    const { data: workspaces } = useWorkspaceList();

    const options =
        workspaces == null
            ? []
            : workspaces.length > 0
              ? workspaces.map(({ id, name }) => ({ id, label: name }))
              : [
                    {
                        id: pendingDefaultWorkspaceId,
                        label: t(
                            'app.workspace.workspaceGateAccountPrompt.newWorkspace',
                            { name: defaultWorkspaceName },
                        ),
                    },
                ];

    const [selectedId, setSelectedId] = useState<string>();
    const activeId = selectedId ?? options[0]?.id;

    const openInWorkspace = (workspaceId: string) =>
        startTransition(() =>
            router.replace(
                workspaceUtils.getWorkspaceSwapUrl(
                    pathname,
                    workspaceId,
                    searchParams.toString(),
                ),
            ),
        );

    const handleDefaultWorkspaceCreated = async (workspace: IWorkspace) => {
        // The list was read while the registry was empty, so it is cached as empty.
        await queryClient.invalidateQueries({
            queryKey: workspaceServiceKeys.workspaceList(),
        });
        openInWorkspace(workspace.id);
    };

    const {
        mutate: createDefaultWorkspace,
        isPending: isCreating,
        error: createError,
    } = useGetOrCreateDefaultWorkspace({
        onSuccess: handleDefaultWorkspaceCreated,
    });

    const handleConfirm = () => {
        if (activeId === pendingDefaultWorkspaceId) {
            createDefaultWorkspace();
        } else if (activeId != null) {
            openInWorkspace(activeId);
        }
    };

    if (createError != null) {
        return (
            <Page.Error
                descriptionKey="app.workspace.workspaceGate.error.description"
                error={createError}
                titleKey="app.workspace.workspaceGate.error.title"
            />
        );
    }

    return (
        <div className="flex grow items-center justify-center py-10">
            <Card className="flex w-full max-w-[480px] flex-col gap-6 border border-neutral-100 p-6 md:p-8">
                <div className="flex flex-col gap-1 md:gap-2">
                    <Heading as="h1" size="h3">
                        {t('app.workspace.workspaceGateAccountPrompt.heading')}
                    </Heading>
                    <p className="text-neutral-500 text-sm leading-tight md:text-base">
                        {t(
                            'app.workspace.workspaceGateAccountPrompt.description',
                            { account: accountLabel },
                        )}
                    </p>
                </div>
                <RadioGroup
                    label={t('app.workspace.workspaceGateAccountPrompt.label')}
                    onValueChange={setSelectedId}
                    value={activeId}
                >
                    {options.map(({ id, label }) => (
                        <Radio key={id} label={label} value={id} />
                    ))}
                </RadioGroup>
                <div className="flex flex-col gap-3 md:flex-row">
                    <Button
                        disabled={activeId == null}
                        isLoading={isCreating || isNavigating}
                        onClick={handleConfirm}
                        size="md"
                        variant="primary"
                    >
                        {t(
                            'app.workspace.workspaceGateAccountPrompt.action.confirm',
                        )}
                    </Button>
                    <Button
                        href="/create/workspace"
                        size="md"
                        variant="tertiary"
                    >
                        {t(
                            'app.workspace.workspaceGateAccountPrompt.action.create',
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
};
