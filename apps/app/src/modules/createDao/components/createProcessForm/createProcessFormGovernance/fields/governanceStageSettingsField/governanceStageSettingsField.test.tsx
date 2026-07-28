import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
    generateCreateProcessFormDataAdvanced,
    generateCreateProcessFormStage,
    generateSetupBodyFormExternal,
    generateSetupBodyFormNew,
} from '@/modules/createDao/testUtils';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import * as DialogProvider from '@/shared/components/dialogProvider/dialogProvider';
import type { ICreateProcessFormDataAdvanced } from '../../../createProcessFormDefinitions';
import {
    GovernanceStageSettingsField,
    type IGovernanceStageSettingsFieldProps,
} from './governanceStageSettingsField';

describe('<GovernanceStageSettingsField /> component', () => {
    const useDialogContextSpy = jest.spyOn(DialogProvider, 'useDialogContext');

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue({
            open: jest.fn(),
            close: jest.fn(),
        } as unknown as ReturnType<typeof DialogProvider.useDialogContext>);
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
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

        return <FormProvider {...formMethods}>{children}</FormProvider>;
    };

    const createTestComponent = (values?: {
        props?: Partial<IGovernanceStageSettingsFieldProps>;
        stage?: Parameters<typeof generateCreateProcessFormStage>[0];
    }) => {
        const defaultValues = generateCreateProcessFormDataAdvanced({
            stages: [generateCreateProcessFormStage(values?.stage)],
        });

        return (
            <TestWrapper defaultValues={defaultValues}>
                <GovernanceStageSettingsField
                    formPrefix="stages.0"
                    readOnly={true}
                    {...values?.props}
                />
            </TestWrapper>
        );
    };

    const approvingBody = () =>
        generateSetupBodyFormNew({ proposalType: SppProposalType.APPROVAL });
    const vetoingBody = () =>
        generateSetupBodyFormExternal({ proposalType: SppProposalType.VETO });

    it('does not render threshold rows as they are displayed per body', () => {
        const stage = { bodies: [approvingBody(), vetoingBody()] };
        render(createTestComponent({ stage }));

        expect(screen.queryByText(/approvalThreshold/)).not.toBeInTheDocument();
        expect(screen.queryByText(/vetoThreshold/)).not.toBeInTheDocument();
    });

    it('renders the early-advance row for a stage with only approving bodies', () => {
        const stage = { bodies: [approvingBody(), approvingBody()] };
        render(createTestComponent({ stage }));

        expect(screen.getByText(/earlyAdvance/)).toBeInTheDocument();
    });

    it('hides the early-advance row for a stage with vetoing bodies', () => {
        const stage = { bodies: [approvingBody(), vetoingBody()] };
        render(createTestComponent({ stage }));

        expect(screen.queryByText(/earlyAdvance/)).not.toBeInTheDocument();
    });

    it('hides the early-advance row for a stage without bodies', () => {
        render(createTestComponent({ stage: { bodies: [] } }));

        expect(screen.queryByText(/earlyAdvance/)).not.toBeInTheDocument();
    });
});
