'use client';

import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
import { type IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { Dialog, EmptyState, invariant } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export interface IGovernanceProcessRequiredDialogParams {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * The plugin used for creating the publish process proposal.
     */
    plugin: IDaoPlugin;
    /**
     * Title of the dialog.
     */
    title: string;
}

export interface IGovernanceProcessRequiredDialogProps
    extends IDialogComponentProps<IGovernanceProcessRequiredDialogParams> {}

export const GovernanceProcessRequiredDialog: React.FC<IGovernanceProcessRequiredDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'GovernanceProcessRequiredDialog: required parameters must be set.');

    const { daoId, plugin, title } = location.params;

    const router = useRouter();
    const { t } = useTranslations();
    const { close } = useDialogContext();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const createProcessUrl = daoUtils.getDaoUrl(dao, `create/${plugin.address}/process`)!;

    const handlePermissionGuardSuccess = useCallback(() => {
        router.push(createProcessUrl);
        close();
    }, [router, createProcessUrl, close]);

    const { check: createProcessGuard, result: canCreateProcess } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        onSuccess: handlePermissionGuardSuccess,
        plugin,
        daoId,
    });

    const handleCreateProcessClick = () => {
        if (canCreateProcess) {
            close();
        }

        createProcessGuard();
    };

    return (
        <>
            <Dialog.Header title={title} onClose={() => close()} />
            <Dialog.Content className="flex flex-col items-center gap-4">
                <EmptyState
                    objectIllustration={{ object: 'USERS' }}
                    heading={t('app.settings.governanceProcessRequiredDialog.feedback.title')}
                    description={t('app.settings.governanceProcessRequiredDialog.feedback.description')}
                    primaryButton={{
                        label: t('app.settings.governanceProcessRequiredDialog.feedback.action'),
                        href: canCreateProcess ? createProcessUrl : undefined,
                        onClick: handleCreateProcessClick,
                    }}
                />
            </Dialog.Content>
        </>
    );
};
