import type { IWizardStepProps } from '@/shared/components/wizard';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import { generateTabComponentPlugin } from '@/shared/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { render, screen } from '@testing-library/react';
import * as ReactHookForm from 'react-hook-form';
import {
    CreateProposalPageClientSteps,
    type ICreateProposalPageClientStepsProps,
} from './createProposalPageClientSteps';
import { CreateProposalWizardStep, createProposalWizardSteps } from './createProposalPageDefinitions';

jest.mock('react-hook-form', () => ({
    __esModule: true,
    ...jest.requireActual<typeof ReactHookForm>('react-hook-form'),
}));

jest.mock('../../components/createProposalForm', () => ({
    CreateProposalForm: {
        Metadata: () => <div data-testid="proposal-metadata" />,
        Actions: () => <div data-testid="proposal-actions" />,
        Settings: () => <div data-testid="proposal-settings" />,
    },
}));

jest.mock('@/shared/components/wizard', () => ({
    Wizard: {
        Step: ({ title, description, children, hidden, id }: IWizardStepProps) => (
            <div data-testid={id} data-hidden={hidden} data-title={title} data-description={description}>
                {children}
            </div>
        ),
    },
}));

describe('<CreateProposalPageClientSteps /> component', () => {
    const useWatchSpy: jest.SpyInstance<unknown> = jest.spyOn(ReactHookForm, 'useWatch');
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');
    const getSlotComponentSpy = jest.spyOn(pluginRegistryUtils, 'getSlotComponent');

    beforeEach(() => {
        useWatchSpy.mockReturnValue(true);
        useDaoPluginsSpy.mockReturnValue([generateTabComponentPlugin()]);
        getSlotComponentSpy.mockReturnValue(undefined);
    });

    afterEach(() => {
        useWatchSpy.mockReset();
        useDaoPluginsSpy.mockReset();
        getSlotComponentSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ICreateProposalPageClientStepsProps>) => {
        const completeProps: ICreateProposalPageClientStepsProps = {
            daoId: 'test',
            pluginAddress: '0x123',
            steps: createProposalWizardSteps,
            ...props,
        };

        return <CreateProposalPageClientSteps {...completeProps} />;
    };

    it('renders the wizard steps', () => {
        render(createTestComponent());

        Object.keys(CreateProposalWizardStep).forEach((step) => {
            const stepElement = screen.getByTestId(step);
            expect(stepElement).toBeInTheDocument();
            expect(stepElement.dataset.title).toMatch(new RegExp(`steps.${step}.title`));
            expect(stepElement.dataset.description).toMatch(new RegExp(`steps.${step}.description`));
        });
    });

    it('renders the addAction step when addAction form value is set to true', () => {
        useWatchSpy.mockReturnValue(true);
        render(createTestComponent());
        expect(screen.getByTestId(CreateProposalWizardStep.ACTIONS).dataset.hidden).toEqual('false');
    });

    it('hides the addAction step when addAction form value is set to false', () => {
        useWatchSpy.mockReturnValue(false);
        render(createTestComponent());
        expect(screen.getByTestId(CreateProposalWizardStep.ACTIONS).dataset.hidden).toEqual('true');
    });

    it('hides the settings step when plugin has no custom settings component', () => {
        getSlotComponentSpy.mockReturnValue(undefined);
        render(createTestComponent());
        expect(screen.getByTestId(CreateProposalWizardStep.SETTINGS).dataset.hidden).toEqual('true');
    });

    it('renders the settings step when plugin has custom settings component', () => {
        getSlotComponentSpy.mockReturnValue(() => <div />);
        render(createTestComponent());
        expect(screen.getByTestId(CreateProposalWizardStep.SETTINGS).dataset.hidden).toEqual('false');
    });
});
