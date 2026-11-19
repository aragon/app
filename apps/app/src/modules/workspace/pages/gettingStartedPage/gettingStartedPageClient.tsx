'use client';

import { Button } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useFieldArray } from 'react-hook-form';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    defaultWorkspaceName,
    workspaceService,
} from '../../api/workspaceService';
import {
    createWorkspaceFormDefaultValues,
    type ICreateWorkspaceFormData,
} from '../../components/createWorkspaceForm';
import { WorkspaceWizard } from '../../components/workspaceWizard';
import { WorkspaceDialogId } from '../../constants/workspaceDialogId';
import { WorkspaceWizardStep } from '../../constants/workspaceWizardStep';
import type { IPublishWorkspaceDialogParams } from '../../dialogs/publishWorkspaceDialog';

export interface IGettingStartedPageClientProps {}

/**
 * Skips the accounts step: clears the rows so the workspace is created empty, then submits the form like the
 * primary button does. Accounts can be added from the workspace at any time.
 */
const SkipAccountsAction: React.FC = () => {
    const { t } = useTranslations();
    const { replace } = useFieldArray<{ accounts: unknown[] }>({
        name: 'accounts',
    });

    return (
        <Button
            onClick={() => replace([])}
            size="lg"
            type="submit"
            variant="tertiary"
        >
            {t('app.workspace.gettingStartedPage.addAccountsLater')}
        </Button>
    );
};

/**
 * First-time experience of a connected user who holds no workspace: a single Add accounts step that creates the
 * workspace with the default name, as naming it comes later.
 */
export const GettingStartedPageClient: React.FC<
    IGettingStartedPageClientProps
> = () => {
    const { open } = useDialogContext();
    const router = useRouter();
    // Only a first visit belongs here: the entry page keeps workspace owners out, but a bookmark, a shared link or
    // Back after publishing would otherwise create a second workspace. Checked once against the registry itself,
    // not the list query, whose cached entry is shared with the demo; and once, so the workspace this wizard creates
    // does not redirect the dialog away from its success state.
    const hasCheckedRegistryRef = useRef(false);

    useEffect(() => {
        if (hasCheckedRegistryRef.current) {
            return;
        }

        hasCheckedRegistryRef.current = true;

        workspaceService
            .getWorkspaceList()
            .then((workspaces) => {
                if (workspaces.length > 0) {
                    router.replace('/workspace');
                }
            })
            .catch(() => {
                // Storage refused the read: keep the wizard up rather than guess whether a workspace exists.
            });
    }, [router]);

    const handleSubmit = (values: ICreateWorkspaceFormData) => {
        const params: IPublishWorkspaceDialogParams = { values };
        open(WorkspaceDialogId.PUBLISH_WORKSPACE, { params });
    };

    return (
        <Page.Main fullWidth={true}>
            <WorkspaceWizard
                analyticsFlow="getting_started"
                defaultValues={{
                    ...createWorkspaceFormDefaultValues,
                    name: defaultWorkspaceName,
                }}
                onSubmit={handleSubmit}
                secondaryActions={{
                    [WorkspaceWizardStep.ACCOUNTS]: <SkipAccountsAction />,
                }}
                steps={[WorkspaceWizardStep.ACCOUNTS]}
                translationNamespace="app.workspace.gettingStartedPage"
            />
        </Page.Main>
    );
};
