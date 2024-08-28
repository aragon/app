'use client';

import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { Wizard } from '@/shared/components/wizard';
import { type ICreateProposalFormData } from '../../components/createProposalForm';
import { GovernanceDialogs } from '../../constants/moduleDialogs';
import { CreateProposalPageClientSteps } from './createProposalPageClientSteps';

export interface ICreateProposalPageClientProps {}

const createProposalSteps = [
    { id: 'metadata', order: 0, meta: { name: 'Define content' } },
    { id: 'actions', order: 1, meta: { name: 'Set actions' } },
    { id: 'settings', order: 2, meta: { name: 'Initiate voting' } },
];

export const CreateProposalPageClient: React.FC<ICreateProposalPageClientProps> = () => {
    const { open } = useDialogContext();

    const handleFormSubmit = (values: ICreateProposalFormData) => {
        const params = { values };
        open(GovernanceDialogs.PUBLISH_PROPOSAL, { params });
    };

    return (
        <Page.Main fullWidth={true}>
            <Wizard.Container
                finalStep="Publish proposal"
                submitLabel="Publish proposal"
                initialSteps={createProposalSteps}
                onSubmit={handleFormSubmit}
            >
                <CreateProposalPageClientSteps />
            </Wizard.Container>
        </Page.Main>
    );
};
