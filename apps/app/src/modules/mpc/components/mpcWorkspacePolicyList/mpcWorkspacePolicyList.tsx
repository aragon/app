'use client';

import {
    Button,
    Card,
    CardEmptyState,
    DateFormat,
    formatterUtils,
    Heading,
    IconType,
    StateSkeletonBar,
    Switch,
    Tag,
} from '@aragon/gov-ui-kit';
import {
    useMpcDeleteWorkspacePolicy,
    useMpcUpdateWorkspacePolicy,
    useMpcWorkspacePolicies,
} from '@/modules/mpc/api/mpcService';
import type { IMpcWorkspacePolicy } from '@/modules/mpc/api/mpcService/domain';
import { MpcErrorAlert } from '@/modules/mpc/components/mpcErrorAlert';
import { countFlowBlocks } from '@/modules/mpc/components/mpcPolicyEditor';
import {
    mpcPolicyNewPath,
    mpcPolicyPath,
} from '@/modules/mpc/constants/mpcConstants';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IMpcWorkspacePolicyListProps {
    /**
     * Workspace whose policies are listed.
     */
    workspaceId: string;
    /**
     * Whether the current user can manage (toggle / delete) the policies.
     */
    canManage: boolean;
}

const MpcWorkspacePolicyCard: React.FC<{
    policy: IMpcWorkspacePolicy;
    canManage: boolean;
}> = ({ policy, canManage }) => {
    const { t } = useTranslations();
    const updatePolicy = useMpcUpdateWorkspacePolicy();
    const deletePolicy = useMpcDeleteWorkspacePolicy();
    const blocks = countFlowBlocks(policy.flow);
    const warnings = policy.lastCheck.issues.filter(
        (issue) => issue.severity === 'warning',
    ).length;

    const handleToggle = (enabled: boolean) =>
        updatePolicy.mutate({
            urlParams: { workspaceId: policy.workspaceId, policyId: policy.id },
            body: { enabled },
        });

    const handleDelete = () => {
        // POC: no dedicated confirmation dialog (see module README).
        if (
            window.confirm(
                t('app.mpc.mpcWorkspacePolicyList.deleteConfirm', {
                    name: policy.name,
                }),
            )
        ) {
            deletePolicy.mutate({
                urlParams: {
                    workspaceId: policy.workspaceId,
                    policyId: policy.id,
                },
            });
        }
    };

    return (
        <Card className="flex h-full flex-col gap-4 p-6">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                    <Heading size="h3">{policy.name}</Heading>
                    <span className="text-neutral-500 text-sm">
                        {t('app.mpc.mpcWorkspacePolicyList.blocks', {
                            conditions: blocks.conditions,
                            actions: blocks.actions,
                        })}
                        {' · '}
                        {t('app.mpc.mpcWorkspacePolicyList.updatedAt', {
                            date:
                                formatterUtils.formatDate(policy.updatedAt, {
                                    format: DateFormat.RELATIVE,
                                }) ?? policy.updatedAt,
                        })}
                    </span>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-2">
                    <Tag
                        label={t(
                            warnings > 0
                                ? 'app.mpc.mpcWorkspacePolicyList.verifiedWithWarnings'
                                : 'app.mpc.mpcWorkspacePolicyList.verified',
                            { count: warnings },
                        )}
                        variant="success"
                    />
                    <Tag
                        label={t(
                            policy.enabled
                                ? 'app.mpc.mpcWorkspacePolicyList.active'
                                : 'app.mpc.mpcWorkspacePolicyList.inactive',
                        )}
                        variant={policy.enabled ? 'primary' : 'neutral'}
                    />
                </div>
            </div>
            <MpcErrorAlert error={updatePolicy.error ?? deletePolicy.error} />
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                {canManage ? (
                    <Switch
                        checked={policy.enabled}
                        disabled={updatePolicy.isPending}
                        inlineLabel={t(
                            'app.mpc.mpcWorkspacePolicyList.enforce',
                        )}
                        onCheckedChanged={handleToggle}
                    />
                ) : (
                    <span className="text-neutral-500 text-sm">
                        {t(
                            policy.enabled
                                ? 'app.mpc.mpcWorkspacePolicyList.enforcedHint'
                                : 'app.mpc.mpcWorkspacePolicyList.notEnforcedHint',
                        )}
                    </span>
                )}
                <div className="flex gap-2">
                    <Button
                        href={mpcPolicyPath(policy.workspaceId, policy.id)}
                        iconLeft={canManage ? IconType.PEN : undefined}
                        size="sm"
                        variant="secondary"
                    >
                        {t(
                            canManage
                                ? 'app.mpc.mpcWorkspacePolicyList.edit'
                                : 'app.mpc.mpcWorkspacePolicyList.view',
                        )}
                    </Button>
                    {canManage && (
                        <Button
                            iconLeft={IconType.CLOSE}
                            isLoading={deletePolicy.isPending}
                            onClick={handleDelete}
                            size="sm"
                            variant="tertiary"
                        >
                            {t('app.mpc.mpcWorkspacePolicyList.delete')}
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};

/**
 * Cards of the workspace transaction policies: verification status, enforcement toggle, edit and delete.
 */
export const MpcWorkspacePolicyList: React.FC<IMpcWorkspacePolicyListProps> = (
    props,
) => {
    const { workspaceId, canManage } = props;
    const { t } = useTranslations();
    const { data, isLoading, error } = useMpcWorkspacePolicies({
        urlParams: { workspaceId },
    });

    if (isLoading) {
        return (
            <div className="flex flex-col gap-3">
                <StateSkeletonBar size="lg" width="60%" />
                <StateSkeletonBar size="lg" width="40%" />
            </div>
        );
    }

    if (error != null) {
        return <MpcErrorAlert error={error} />;
    }

    if (data == null || data.length === 0) {
        return (
            <CardEmptyState
                description={t(
                    canManage
                        ? 'app.mpc.mpcWorkspacePolicyList.empty.description'
                        : 'app.mpc.mpcWorkspacePolicyList.empty.descriptionReadOnly',
                )}
                heading={t('app.mpc.mpcWorkspacePolicyList.empty.heading')}
                objectIllustration={{ object: 'SETTINGS' }}
                primaryButton={
                    canManage
                        ? {
                              label: t(
                                  'app.mpc.mpcWorkspacePolicyList.empty.action',
                              ),
                              href: mpcPolicyNewPath(workspaceId),
                          }
                        : undefined
                }
            />
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.map((policy) => (
                <MpcWorkspacePolicyCard
                    canManage={canManage}
                    key={policy.id}
                    policy={policy}
                />
            ))}
        </div>
    );
};
