'use client';

import { Wizard } from '@/shared/components/wizard';
import { useWatch } from 'react-hook-form';
import { CreateProposalAddActionValue, CreateProposalForm } from '../../components/createProposalForm';

export interface ICreateProposalPageClientStepsProps {}

const createProposalSteps = [
    { id: 'metadata', order: 0, meta: { name: 'Define content' } },
    { id: 'actions', order: 1, meta: { name: 'Set actions' } },
    { id: 'settings', order: 2, meta: { name: 'Initiate voting' } },
];

export const CreateProposalPageClientSteps: React.FC<ICreateProposalPageClientStepsProps> = () => {
    const addActions = useWatch({ name: 'addActions' });

    return (
        <>
            <Wizard.Step
                title="Define content"
                description="Provide the information voters will need to make their decision here"
                {...createProposalSteps[0]}
            >
                <CreateProposalForm.Metadata />
            </Wizard.Step>
            <Wizard.Step
                title="Set actions"
                description="These actions can be executed only once the governance parameters are met"
                hidden={addActions === CreateProposalAddActionValue.NO}
                {...createProposalSteps[1]}
            >
                <CreateProposalForm.Actions />
            </Wizard.Step>
            <Wizard.Step
                title="Initiate the vote"
                description="Set start date, and end date for your vote."
                {...createProposalSteps[2]}
            >
                <CreateProposalForm.Settings />
            </Wizard.Step>
        </>
    );
};
