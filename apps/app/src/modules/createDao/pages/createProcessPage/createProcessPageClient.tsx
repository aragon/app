'use client';

import { useMemo } from 'react';
import { useProposalPermissionCheckGuard } from '@/modules/governance/hooks/useProposalPermissionCheckGuard';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardPage } from '@/shared/components/wizards/wizardPage';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { daoUtils } from '@/shared/utils/daoUtils';
import { errorUtils } from '@/shared/utils/errorUtils';
import { plausibleAnalyticsUtils } from '@/shared/utils/plausibleAnalyticsUtils';
import {
    GovernanceType,
    type ICreateProcessFormData,
} from '../../components/createProcessForm';
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

export const CreateProcessPageClient: React.FC<
    ICreateProcessPageClientProps
> = (props) => {
    const { daoId, pluginAddress } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    // Undefined when the DAO is not loaded or the plugin address is unknown (e.g. a stale
    // link to an uninstalled process) — the page renders a not-found state in that case.
    const plugin = useDaoPlugins({
        daoId,
        pluginAddress,
        includeLinkedAccounts: true,
    })?.[0]?.meta;

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    useProposalPermissionCheckGuard({
        daoId,
        pluginAddress,
        redirectTab: 'settings',
    });

    const processedSteps = useMemo(
        () =>
            createProcessWizardSteps.map(({ meta, ...step }) => ({
                ...step,
                meta: { ...meta, name: t(meta.name) },
            })),
        [t],
    );

    if (plugin == null) {
        const pluginNotFoundError = new AragonBackendServiceError(
            AragonBackendServiceError.pluginNotFoundCode,
            `CreateProcessPageClient: no plugin found for address ${pluginAddress}`,
            404,
        );

        return (
            <Page.Error
                actionLink={daoUtils.getDaoUrl(dao, 'settings')}
                error={errorUtils.serialize(pluginNotFoundError)}
                errorNamespace="app.createDao.createProcessPage.error"
            />
        );
    }

    const handleFormSubmit = (values: ICreateProcessFormData) => {
        const dialogParams: IPrepareProcessDialogParams = {
            daoId,
            values,
            pluginAddress,
        };
        plausibleAnalyticsUtils.track('wizard_submit', {
            flow: 'governance_designer',
            setupMode:
                values.governanceType === GovernanceType.ADVANCED
                    ? 'advanced'
                    : 'basic',
            stageCount:
                values.governanceType === GovernanceType.ADVANCED
                    ? values.stages.length
                    : undefined,
        });
        open(CreateDaoDialogId.PREPARE_PROCESS, { params: dialogParams });
    };

    return (
        <Page.Main fullWidth={true}>
            <WizardPage.Container
                analytics={{ flow: 'governance_designer' }}
                defaultValues={{
                    stages: [],
                    existingProposalCreationConditions: [],
                }}
                finalStep={t('app.createDao.createProcessPage.finalStep')}
                initialSteps={processedSteps}
                onSubmit={handleFormSubmit}
                submitHelpText={t(
                    'app.createDao.createProcessPage.submitHelpText',
                )}
                submitLabel={t('app.createDao.createProcessPage.submitLabel')}
            >
                <CreateProcessPageClientSteps
                    daoId={daoId}
                    steps={processedSteps}
                />
            </WizardPage.Container>
        </Page.Main>
    );
};
