'use client';

import { usePinJson } from '@/shared/api/ipfsService/mutations/usePinJson';
import { Page } from '@/shared/components/page';
import { Wizard } from '@/shared/components/wizard';
import { type ICreateProposalFormData } from '../../components/createProposalForm';
import { CreateProposalPageClientSteps } from './createProposalPageClientSteps';

export interface ICreateProposalPageClientProps {}

const createProposalSteps = [
    { id: 'metadata', order: 0, meta: { name: 'Define content' } },
    { id: 'actions', order: 1, meta: { name: 'Set actions' } },
    { id: 'settings', order: 2, meta: { name: 'Initiate voting' } },
];

export const CreateProposalPageClient: React.FC<ICreateProposalPageClientProps> = () => {
    const { mutate } = usePinJson({ onSuccess: (result) => console.log('success', result) });

    const handleFormSubmit = (values: ICreateProposalFormData) => {
        console.log({ values });
        mutate({ body: values });
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
