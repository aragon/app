'use client';

import { AlertCard, Button, IconType, Spinner, Tag } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import {
    useMpcPolicyCatalog,
    useMpcWorkspace,
    useMpcWorkspacePolicies,
    useMpcWorkspacePolicy,
} from '@/modules/mpc/api/mpcService';
import type { IMpcWorkspacePolicy } from '@/modules/mpc/api/mpcService/domain';
import { MpcAuthGate } from '@/modules/mpc/components/mpcAuthGate';
import { MpcErrorAlert } from '@/modules/mpc/components/mpcErrorAlert';
import { MpcPolicyEditor } from '@/modules/mpc/components/mpcPolicyEditor';
import {
    MPC_LIST_PATH,
    mpcPolicyNewPath,
    mpcPolicyPath,
    mpcWorkspacePath,
} from '@/modules/mpc/constants/mpcConstants';
import { useMpcSessionGuard } from '@/modules/mpc/hooks/useMpcSessionGuard';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IMpcPolicyEditorPageClientProps {
    /**
     * ID of the workspace.
     */
    workspaceId: string;
    /**
     * ID of the policy to edit; undefined creates a new policy.
     */
    policyId?: string;
}

const MpcPolicyEditorContent: React.FC<IMpcPolicyEditorPageClientProps> = (
    props,
) => {
    const { workspaceId, policyId } = props;
    const { t } = useTranslations();
    const router = useRouter();
    const { session } = useMpcSessionGuard();

    const workspace = useMpcWorkspace(
        { urlParams: { workspaceId } },
        { enabled: session != null },
    );
    const catalog = useMpcPolicyCatalog({ enabled: session != null });
    // Saved policies of the workspace: usable as blocks inside the flow being edited.
    const policies = useMpcWorkspacePolicies(
        { urlParams: { workspaceId } },
        { enabled: session != null },
    );
    const policy = useMpcWorkspacePolicy(
        { urlParams: { workspaceId, policyId: policyId ?? '' } },
        { enabled: session != null && policyId != null },
    );

    if (session == null) {
        return null;
    }

    const isLoading =
        workspace.isLoading ||
        catalog.isLoading ||
        policies.isLoading ||
        (policyId != null && policy.isLoading);

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Spinner size="xl" variant="neutral" />
            </div>
        );
    }

    if (catalog.error != null || catalog.data == null) {
        return (
            <div className="flex flex-col gap-4">
                <AlertCard
                    message={t('app.mpc.mpcPolicyEditorPage.engineDown.title')}
                    variant="critical"
                >
                    {t('app.mpc.mpcPolicyEditorPage.engineDown.description')}
                </AlertCard>
                <MpcErrorAlert error={catalog.error} />
            </div>
        );
    }

    if (workspace.error != null || workspace.data == null) {
        return <MpcErrorAlert error={workspace.error} />;
    }

    if (policyId != null && (policy.error != null || policy.data == null)) {
        return <MpcErrorAlert error={policy.error} />;
    }

    const canEdit = workspace.data.ownerId === session.user.id;

    const handleSaved = (saved: IMpcWorkspacePolicy) => {
        // After creating a policy, continue editing it under its own URL.
        if (policyId == null) {
            router.replace(mpcPolicyPath(saved.workspaceId, saved.id));
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <Page.Header
                breadcrumbs={[
                    {
                        href: MPC_LIST_PATH,
                        label: t('app.mpc.mpcWorkspacePage.breadcrumb'),
                    },
                    {
                        href: mpcWorkspacePath(workspace.data.id, 'policies'),
                        label: workspace.data.name,
                    },
                    {
                        label:
                            policy.data?.name ??
                            t('app.mpc.mpcPolicyEditorPage.newTitle'),
                    },
                ]}
                breadcrumbsTag={
                    policy.data != null
                        ? {
                              label: t(
                                  policy.data.enabled
                                      ? 'app.mpc.mpcPolicyEditorPage.active'
                                      : 'app.mpc.mpcPolicyEditorPage.inactive',
                              ),
                              variant: policy.data.enabled
                                  ? 'primary'
                                  : 'neutral',
                          }
                        : undefined
                }
                description={t(
                    canEdit
                        ? 'app.mpc.mpcPolicyEditorPage.description'
                        : 'app.mpc.mpcPolicyEditorPage.descriptionReadOnly',
                )}
                title={
                    policy.data?.name ??
                    t('app.mpc.mpcPolicyEditorPage.newTitle')
                }
            >
                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        href={mpcWorkspacePath(workspace.data.id, 'policies')}
                        iconLeft={IconType.CHEVRON_LEFT}
                        size="md"
                        variant="tertiary"
                    >
                        {t('app.mpc.mpcPolicyEditorPage.back')}
                    </Button>
                    {policyId != null && canEdit && (
                        <Button
                            href={mpcPolicyNewPath(workspace.data.id)}
                            iconLeft={IconType.PLUS}
                            size="md"
                            variant="secondary"
                        >
                            {t('app.mpc.mpcPolicyEditorPage.newAction')}
                        </Button>
                    )}
                    <Tag
                        label={t('app.mpc.mpcPolicyEditorPage.catalogVersion', {
                            version: catalog.data.catalogVersion,
                        })}
                        variant="neutral"
                    />
                </div>
            </Page.Header>
            <div style={{ height: 'calc(100vh - 300px)', minHeight: 720 }}>
                <MpcPolicyEditor
                    canEdit={canEdit}
                    catalog={catalog.data}
                    className="h-full"
                    key={policy.data?.id ?? 'new'}
                    onSaved={handleSaved}
                    policy={policy.data}
                    workspaceId={workspace.data.id}
                    workspacePolicies={policies.data ?? []}
                />
            </div>
        </div>
    );
};

export const MpcPolicyEditorPageClient: React.FC<
    IMpcPolicyEditorPageClientProps
> = (props) => {
    const { workspaceId, policyId } = props;
    const redirectTo =
        policyId != null
            ? mpcPolicyPath(workspaceId, policyId)
            : mpcPolicyNewPath(workspaceId);

    // The editor needs the whole viewport width (palette | canvas | panels): no Page.Main max-width here.
    return (
        <main className="flex min-w-0 flex-col gap-6 px-4 pt-6 pb-10 md:px-6">
            <MpcAuthGate redirectTo={redirectTo}>
                <MpcPolicyEditorContent
                    policyId={policyId}
                    workspaceId={workspaceId}
                />
            </MpcAuthGate>
        </main>
    );
};
