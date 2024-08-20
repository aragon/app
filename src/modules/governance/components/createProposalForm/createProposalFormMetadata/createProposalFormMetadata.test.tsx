import { FormWrapper } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { CreateProposalFormMetadata, type ICreateProposalFormMetadataProps } from './createProposalFormMetadata';

describe('<CreateProposalFormMetadata /> component', () => {
    const createTestComponent = (props?: Partial<ICreateProposalFormMetadataProps>) => {
        const completeProps: ICreateProposalFormMetadataProps = { ...props };

        return (
            <FormWrapper>
                <CreateProposalFormMetadata {...completeProps} />
            </FormWrapper>
        );
    };

    it('renders the title field', () => {
        render(createTestComponent());
        expect(screen.getByRole('textbox', { name: /Title/ })).toBeInTheDocument();
    });
});
