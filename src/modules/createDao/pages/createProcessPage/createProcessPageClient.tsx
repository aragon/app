'use client';

import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardPage } from '@/shared/components/wizards/wizardPage';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import { useDaoPlugins } from '../../../../shared/hooks/useDaoPlugins';
import { GovernanceSlotId } from '../../../governance/constants/moduleSlots';
import { usePermissionCheckGuard } from '../../../governance/hooks/usePermissionCheckGuard';
import { createProcessFormUtils, type ICreateProcessFormData } from '../../components/createProcessForm';
import { CreateDaoDialogId } from '../../constants/createDaoDialogId';
import type { IPrepareProcessDialogParams } from '../../dialogs/prepareProcessDialog';
import { createProcessWizardSteps } from './createProcessPageDefinitions';
import { CreateProcessPageClientSteps } from './createProcessPageSteps';

export interface ICreateProcessPageClientProps {
    /**
     * ID of the current DAO.
     */
    daoId: string;
    /**
     * Plugin address used to create a proposal for adding a new process.
     */
    pluginAddress: string;
}

export const CreateProcessPageClient: React.FC<ICreateProcessPageClientProps> = (props) => {
    const { daoId, pluginAddress } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const router = useRouter();

    const { meta: plugin } = useDaoPlugins({ daoId, pluginAddress })![0];

    const handlePermissionCheckError = useCallback(() => router.push(`/dao/${daoId}/settings`), [router, daoId]);

    const { check: createProposalGuard, result: canCreateProposal } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        onError: handlePermissionCheckError,
        plugin,
        daoId,
    });

    useEffect(() => {
        if (!canCreateProposal) {
            createProposalGuard();
        }
    }, [canCreateProposal, createProposalGuard]);

    const handleFormSubmit = (values: ICreateProcessFormData) => {
        const dialogParams: IPrepareProcessDialogParams = { daoId, values, pluginAddress };
        open(CreateDaoDialogId.PREPARE_PROCESS, { params: dialogParams });
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
                submitHelpText={t('app.createDao.createProcessPage.submitHelpText')}
                initialSteps={processedSteps}
                onSubmit={handleFormSubmit}
                defaultValues={{ stages: [createProcessFormUtils.buildDefaultStage()], bodies: [] }}
            >
                <CreateProcessPageClientSteps steps={processedSteps} daoId={daoId} />
            </WizardPage.Container>
        </Page.Main>
    );
};
