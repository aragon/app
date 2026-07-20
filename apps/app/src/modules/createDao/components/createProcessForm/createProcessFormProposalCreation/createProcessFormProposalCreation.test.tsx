import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
    generateCreateProcessFormDataAdvanced,
    generateCreateProcessFormStage,
    generateSetupBodyFormNew,
} from '@/modules/createDao/testUtils';
import * as featureFlagsProvider from '@/shared/components/featureFlagsProvider';
import type { ICreateProcessFormDataAdvanced } from '../createProcessFormDefinitions';
import { CreateProcessFormProposalCreation } from './createProcessFormProposalCreation';

describe('<CreateProcessFormProposalCreation /> component', () => {
    const useFeatureFlagsSpy = jest.spyOn(
        featureFlagsProvider,
        'useFeatureFlags',
    );

    beforeEach(() => {
        useFeatureFlagsSpy.mockReturnValue({
            isEnabled: () => true,
        } as unknown as ReturnType<
            typeof featureFlagsProvider.useFeatureFlags
        >);
    });

    afterEach(() => {
        useFeatureFlagsSpy.mockReset();
    });

    interface ITestWrapperProps {
        /**
         * Initial values of the create-process form.
         */
        defaultValues: ICreateProcessFormDataAdvanced;
        /**
         * Children of the component.
         */
        children?: ReactNode;
    }

    const TestWrapper: React.FC<ITestWrapperProps> = (props) => {
        const { defaultValues, children } = props;
        const formMethods = useForm({ defaultValues });

        return (
            <GukModulesProvider>
                <FormProvider {...formMethods}>{children}</FormProvider>
            </GukModulesProvider>
        );
    };

    const createTestComponent = (
        values?: Partial<ICreateProcessFormDataAdvanced>,
    ) => {
        const defaultValues = generateCreateProcessFormDataAdvanced(values);

        return (
            <TestWrapper defaultValues={defaultValues}>
                <CreateProcessFormProposalCreation />
            </TestWrapper>
        );
    };

    const errorMessage = /proposalCreation.bodies.error/;
    const validConditionAddress = '0x1234567890123456789012345678901234567890';

    it('renders an error when no body or existing condition grants proposal creation', async () => {
        const body = generateSetupBodyFormNew({ canCreateProposal: false });
        const stage = generateCreateProcessFormStage({ bodies: [body] });
        render(
            createTestComponent({
                stages: [stage],
                existingProposalCreationConditions: [],
            }),
        );

        expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    });

    it('renders no error when no body is selected but a valid existing condition is set', async () => {
        const body = generateSetupBodyFormNew({ canCreateProposal: false });
        const stage = generateCreateProcessFormStage({ bodies: [body] });
        render(
            createTestComponent({
                stages: [stage],
                existingProposalCreationConditions: [
                    { address: validConditionAddress },
                ],
            }),
        );

        // Flush the mount-time validation trigger before asserting the error is not rendered
        await act(() => Promise.resolve());

        expect(
            screen.getByRole('button', {
                name: /proposalCreation.existingCondition.remove/,
            }),
        ).toBeInTheDocument();
        expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
    });

    it('renders the error again when the last existing condition is removed', async () => {
        render(
            createTestComponent({
                stages: [],
                existingProposalCreationConditions: [
                    { address: validConditionAddress },
                ],
            }),
        );

        // Flush the mount-time validation trigger before asserting the error is not rendered
        await act(() => Promise.resolve());
        expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();

        const removeButton = screen.getByRole('button', {
            name: /proposalCreation.existingCondition.remove/,
        });
        await userEvent.click(removeButton);

        expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    });
});
