'use client';

import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useAdminStatus } from '@/plugins/adminPlugin/hooks/useAdminStatus';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardPage } from '@/shared/components/wizards/wizardPage';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import { defaultStage, type ICreateProcessFormData } from '../../components/createProcessForm';
import { CreateDaoDialog } from '../../constants/moduleDialogs';
import type { IPrepareProcessDialogParams } from '../../dialogs/prepareProcessDialog';
import { createProcessWizardSteps } from './createProcessPageDefinitions';
import { CreateProcessPageClientSteps } from './createProcessPageSteps';

export interface ICreateProcessPageClientProps {
    /**
     * ID of the current DAO.
     */
    daoId: string;
}

export const CreateProcessPageClient: React.FC<ICreateProcessPageClientProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const router = useRouter();
    const { isAdminMember } = useAdminStatus({ daoId });

    // use useConnectedWalletGuard to check for connection
    // use isAdminMember to check if admin member - what to do if not? Redirect to home page?
    // use the same approach as for proposals

    const handlePermissionCheckError = useCallback(() => router.push(`/dao/${daoId}/dashboard`), [router, daoId]);

    const handleWalletConnectedAdminChecks = useCallback(() => {
        if (!isAdminMember) {
            handlePermissionCheckError();
        }
    }, [handlePermissionCheckError, isAdminMember]);

    const { check: checkWalletConnection, result: isConnected } = useConnectedWalletGuard({
        onSuccess: handleWalletConnectedAdminChecks,
        onError: handlePermissionCheckError,
    });

    useEffect(() => {
        if (!isConnected) {
            checkWalletConnection(); // todo: better name is promptWalletConnection!
        }
    }, [isConnected, checkWalletConnection]);

    const handleFormSubmit = (values: ICreateProcessFormData) => {
        const dialogParams: IPrepareProcessDialogParams = { daoId, values };
        open(CreateDaoDialog.PREPARE_PROCESS, { params: dialogParams });
    };

    const processedSteps = useMemo(
        () => createProcessWizardSteps.map(({ meta, ...step }) => ({ ...step, meta: { ...meta, name: t(meta.name) } })),
        [t],
    );

    return (
        <Page.Main fullWidth={true}>
            <WizardPage.Container
                finalStep={t('app.createDao.createProcessPage.finalStep')}
                submitLabel={t('app.createDao.createProcessPage.submitLabel')}
                initialSteps={processedSteps}
                onSubmit={handleFormSubmit}
                defaultValues={{ stages: [defaultStage] }}
            >
                <CreateProcessPageClientSteps steps={processedSteps} daoId={daoId} />
            </WizardPage.Container>
        </Page.Main>
    );
};
