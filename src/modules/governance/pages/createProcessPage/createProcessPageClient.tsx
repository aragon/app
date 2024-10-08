'use client';

import { GovernanceDialogs } from '@/modules/governance/constants/moduleDialogs';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Wizard } from '@/shared/components/wizard';
import { useMemo } from 'react';
import type {
    ICreateProcessFormBodyData,
    ICreateProcessFormData,
    ICreateProcessFormStage,
} from '../../components/createProcessForm';
import { createProcessWizardSteps } from './createProcessPageDefinitions';
import { CreateProcessPageClientSteps } from './createProcessPageSteps';

export interface ICreateProcessPageClientProps {
    /**
     * ID of the current DAO.
     */
    daoId: string;
}

export const defaultBody: ICreateProcessFormBodyData = {
    bodyNameField: '',
    bodyGovernanceTypeField: 'tokenVoting',
    tokenNameField: '',
    tokenSymbolField: '',
    membersField: [],
    supportThresholdField: 50,
    minimumParticipationField: 1,
    resourcesField: [],
    voteChangeField: false,
    multisigThresholdField: 1,
    bodyResourceField: [],
};

const defaultStage: ICreateProcessFormStage = {
    stageName: '',
    stageType: 'normal',
    votingPeriod: { days: 7, minutes: 0, hours: 0 },
    earlyStageAdvance: false,
    stageExpiration: false,
    bodies: [],
    requiredApprovals: undefined,
    actionType: undefined,
};

const defaultValues: ICreateProcessFormData = {
    actions: [],
    process: {
        name: '',
        id: '',
        summary: '',
        resources: [],
    },

    stages: [defaultStage],
};

export const CreateProcessPageClient: React.FC<ICreateProcessPageClientProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();

    const { open } = useDialogContext();

    const handleFormSubmit = (values: ICreateProcessFormData) => {
        open(GovernanceDialogs.PUBLISH_PROCESS, { params: { daoId, values, processValues: values } });
    };

    const processedSteps = useMemo(
        () =>
            createProcessWizardSteps.map((step) => ({
                ...step,
                meta: { ...step.meta, name: t(step.meta.name) },
            })),
        [t],
    );

    return (
        <Page.Main fullWidth={true}>
            <Wizard.Container
                finalStep="Publish Process"
                submitLabel="Publish Process"
                initialSteps={processedSteps}
                onSubmit={handleFormSubmit}
                defaultValues={defaultValues}
            >
                <CreateProcessPageClientSteps steps={processedSteps} daoId={daoId} />
            </Wizard.Container>
        </Page.Main>
    );
};
