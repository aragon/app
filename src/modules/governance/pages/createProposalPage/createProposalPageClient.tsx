'use client';

import { Page } from '@/shared/components/page';
import { Wizard } from '@/shared/components/wizard';
import { type ICreateProposalFormData } from '../../components/createProposalForm';
import { CreateProposalPageClientSteps } from './createProposalPageClientSteps';
import { IDaoPageParams } from '@/shared/types';

export interface ICreateProposalPageClientProps {
    /**
     * create proposal page parameters.
     */
    daoId: string;
}

const createProposalSteps = [
    { id: 'metadata', order: 0, meta: { name: 'Define content' } },
    { id: 'actions', order: 1, meta: { name: 'Set actions' } },
    { id: 'settings', order: 2, meta: { name: 'Initiate voting' } },
];

export const CreateProposalPageClient: React.FC<ICreateProposalPageClientProps> = (props) => {
    const { daoId } = props;
    const handleFormSubmit = (values: ICreateProposalFormData) => {
        // eslint-disable-next-line no-console
        console.log({ values });
    };

    return (
        <Page.Main fullWidth={true}>
            <Wizard.Container
                finalStep="Publish proposal"
                submitLabel="Publish proposal"
                initialSteps={createProposalSteps}
                onSubmit={handleFormSubmit}
            >
                <CreateProposalPageClientSteps daoId={daoId} />
            </Wizard.Container>
        </Page.Main>
    );
};
