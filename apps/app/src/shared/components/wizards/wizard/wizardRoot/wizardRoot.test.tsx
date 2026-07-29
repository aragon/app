import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import * as ReactHookForm from 'react-hook-form';
import {
    generateFormContext,
    generateFormContextState,
} from '@/shared/testUtils';
import { plausibleAnalyticsUtils } from '@/shared/utils/plausibleAnalyticsUtils';
import { type IWizardAnalytics, useWizardContext } from '../wizardProvider';
import { type IWizardRootProps, WizardRoot } from './wizardRoot';

jest.mock('next/dynamic', () => ({
    __esModule: true,
    default: () => () => <div data-testid="dev-tool" />,
}));

describe('<WizardRoot /> component', () => {
    const useFormSpy = jest.spyOn(ReactHookForm, 'useForm');
    const trackAnalyticsSpy = jest.spyOn(plausibleAnalyticsUtils, 'track');
    beforeEach(() => {
        useFormSpy.mockReturnValue(generateFormContext());
        trackAnalyticsSpy.mockImplementation(() => undefined);
    });

    afterEach(() => {
        useFormSpy.mockReset();
        trackAnalyticsSpy.mockReset();
    });

    const wizardSteps = [
        { id: 'metadata', order: 0, meta: { name: 'Metadata' } },
        { id: 'network', order: 1, meta: { name: 'Network' } },
    ];

    const NextStepButton = () => {
        const { nextStep } = useWizardContext();

        return (
            <button onClick={nextStep} type="button">
                Next
            </button>
        );
    };

    const AnalyticsChangeObserver = (props: {
        onChange: (analytics: IWizardAnalytics | undefined) => void;
    }) => {
        const { onChange } = props;
        const { analytics } = useWizardContext();

        useEffect(() => onChange(analytics), [analytics, onChange]);

        return null;
    };

    const createTestComponent = (props?: Partial<IWizardRootProps>) => {
        const completeProps: IWizardRootProps = {
            submitLabel: 'submit',
            ...props,
        };

        return <WizardRoot {...completeProps} />;
    };

    it('initializes the form with the default value and correct mode', () => {
        const defaultValues = { key: 'value' };
        render(createTestComponent({ defaultValues }));
        expect(useFormSpy).toHaveBeenCalledWith({
            mode: 'onTouched',
            defaultValues,
        });
    });

    it('renders the dev-tools for the form manager when useDevTool is set to true', () => {
        const useDevTool = true;
        render(createTestComponent({ useDevTool }));
        expect(screen.getByTestId('dev-tool')).toBeInTheDocument();
    });

    it('resets the form submit state on submit success', () => {
        const reset = jest.fn();
        const formState = generateFormContextState({
            isSubmitSuccessful: true,
        });
        useFormSpy.mockReturnValue(generateFormContext({ formState, reset }));
        render(createTestComponent());
        expect(reset).toHaveBeenCalledWith(undefined, {
            keepDirty: true,
            keepValues: true,
        });
    });

    it('tracks wizard start and initial step when analytics are configured', async () => {
        render(
            createTestComponent({
                analytics: {
                    flow: 'create_dao',
                    props: { network: 'ethereum-mainnet' },
                },
                initialSteps: wizardSteps,
            }),
        );

        await waitFor(() =>
            expect(trackAnalyticsSpy).toHaveBeenCalledWith('wizard_start', {
                flow: 'create_dao',
                network: 'ethereum-mainnet',
            }),
        );
        expect(trackAnalyticsSpy).toHaveBeenCalledWith('wizard_step', {
            flow: 'create_dao',
            network: 'ethereum-mainnet',
            stepKey: 'metadata',
            stepIndex: 0,
            direction: 'direct',
        });
    });

    it('tracks wizard step transitions with direction', async () => {
        render(
            createTestComponent({
                analytics: { flow: 'create_dao' },
                children: <NextStepButton />,
                initialSteps: wizardSteps,
            }),
        );

        await userEvent.click(screen.getByRole('button', { name: 'Next' }));

        expect(trackAnalyticsSpy).toHaveBeenCalledWith('wizard_step', {
            flow: 'create_dao',
            stepKey: 'network',
            stepIndex: 1,
            direction: 'forward',
        });
    });

    it('keeps the wizard analytics context stable when props are recreated with the same values', () => {
        const onContextChange = jest.fn();
        const { rerender } = render(
            createTestComponent({
                analytics: {
                    flow: 'create_proposal',
                    props: { pluginInterfaceType: 'multisig' },
                },
                children: (
                    <AnalyticsChangeObserver onChange={onContextChange} />
                ),
                initialSteps: wizardSteps,
            }),
        );

        rerender(
            createTestComponent({
                analytics: {
                    flow: 'create_proposal',
                    props: { pluginInterfaceType: 'multisig' },
                },
                children: (
                    <AnalyticsChangeObserver onChange={onContextChange} />
                ),
                initialSteps: wizardSteps,
            }),
        );

        expect(onContextChange).toHaveBeenCalledTimes(1);
    });
});
