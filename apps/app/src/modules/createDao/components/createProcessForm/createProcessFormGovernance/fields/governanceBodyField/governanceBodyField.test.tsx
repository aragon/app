import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { type DefaultValues, FormProvider, useForm } from 'react-hook-form';
import type { ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import {
    generateCreateProcessFormDataAdvanced,
    generateCreateProcessFormDataBasic,
    generateSetupBodyFormExisting,
    generateSetupBodyFormExternal,
} from '@/modules/createDao/testUtils';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import type { ICreateProcessFormData } from '../../../createProcessFormDefinitions';
import { GovernanceBodyField } from './governanceBodyField';

jest.mock('@/shared/components/pluginSingleComponent', () => ({
    PluginSingleComponent: () => null,
}));

describe('<GovernanceBodyField /> component', () => {
    interface ITestWrapperProps {
        /**
         * Initial values of the create-process form.
         */
        defaultValues: ICreateProcessFormData;
        /**
         * Children of the component.
         */
        children?: ReactNode;
    }

    const TestWrapper: React.FC<ITestWrapperProps> = (props) => {
        const { defaultValues, children } = props;
        const formMethods = useForm<ICreateProcessFormData>({
            defaultValues:
                defaultValues as DefaultValues<ICreateProcessFormData>,
        });

        return <FormProvider {...formMethods}>{children}</FormProvider>;
    };

    const createTestComponent = (values: {
        body: ISetupBodyForm;
        formData?: ICreateProcessFormData;
        readOnly?: boolean;
    }) => {
        const defaultValues =
            values.formData ?? generateCreateProcessFormDataAdvanced();

        return (
            <TestWrapper defaultValues={defaultValues}>
                <GovernanceBodyField
                    body={values.body}
                    fieldName="body"
                    readOnly={values.readOnly}
                />
            </TestWrapper>
        );
    };

    it('renders the body-decision tag on editable advanced-governance cards', () => {
        const body = generateSetupBodyFormExternal({
            proposalType: SppProposalType.VETO,
        });
        render(createTestComponent({ body, readOnly: false }));

        expect(
            screen.getByText(/proposalTypeField.veto.label/),
        ).toBeInTheDocument();
    });

    it('does not render the body-decision tag on read-only cards', () => {
        const body = generateSetupBodyFormExisting({
            proposalType: SppProposalType.APPROVAL,
        });
        render(createTestComponent({ body, readOnly: true }));

        expect(
            screen.queryByText(/proposalTypeField.approve.label/),
        ).not.toBeInTheDocument();
    });

    it('does not render the body-decision tag for basic governance', () => {
        const body = generateSetupBodyFormExisting();
        const formData = generateCreateProcessFormDataBasic({ body });
        render(createTestComponent({ body, formData, readOnly: false }));

        expect(
            screen.queryByText(/proposalTypeField.approve.label/),
        ).not.toBeInTheDocument();
    });
});
