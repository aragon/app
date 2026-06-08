import { render, screen } from '@testing-library/react';
import * as ReactHookForm from 'react-hook-form';
import * as useWalletAccount from '@/modules/application/hooks/useWalletAccount';
import type { IWizardPageStepProps } from '@/shared/components/wizards/wizardPage';
import * as useSimulateActionsDropdown from '../../hooks/useSimulateActionsDropdown';
import {
    CreateExecuteActionsPageClientSteps,
    type ICreateExecuteActionsPageClientStepsProps,
} from './createExecuteActionsPageClientSteps';
import { CreateExecuteActionsWizardStep } from './createExecuteActionsPageDefinitions';

jest.mock('../../components/createExecuteActionsForm', () => ({
    CreateExecuteActionsForm: {
        Actions: () => <div data-testid="execute-actions" />,
    },
}));

jest.mock('@/shared/components/wizards/wizardPage', () => ({
    WizardPage: {
        Step: ({
            children,
            id,
            nextDropdownItems,
            disableNext,
        }: IWizardPageStepProps) => (
            <div
                data-disable-next={disableNext}
                data-dropdown-items={nextDropdownItems?.length ?? 0}
                data-testid={id}
            >
                {children}
            </div>
        ),
    },
}));

describe('<CreateExecuteActionsPageClientSteps /> component', () => {
    const useWatchSpy: jest.SpyInstance<unknown> = jest.spyOn(
        ReactHookForm,
        'useWatch',
    );
    const useSimulateActionsDropdownSpy = jest.spyOn(
        useSimulateActionsDropdown,
        'useSimulateActionsDropdown',
    );
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccount,
        'useWalletAccount',
    );

    beforeEach(() => {
        useWatchSpy.mockReturnValue([]);
        useSimulateActionsDropdownSpy.mockReturnValue(undefined);
        useWalletAccountSpy.mockReturnValue({
            address: '0xwallet',
            chainId: 1,
            isReconnecting: false,
        });
    });

    afterEach(() => {
        useWatchSpy.mockReset();
        useSimulateActionsDropdownSpy.mockReset();
        useWalletAccountSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ICreateExecuteActionsPageClientStepsProps>,
    ) => {
        const completeProps: ICreateExecuteActionsPageClientStepsProps = {
            daoId: 'ethereum-mainnet-0x123',
            ...props,
        };

        return <CreateExecuteActionsPageClientSteps {...completeProps} />;
    };

    it('renders the actions step', () => {
        render(createTestComponent());
        expect(
            screen.getByTestId(CreateExecuteActionsWizardStep.ACTIONS),
        ).toBeInTheDocument();
        expect(screen.getByTestId('execute-actions')).toBeInTheDocument();
    });

    it('disables next when there are no actions', () => {
        useWatchSpy.mockReturnValue([]);
        render(createTestComponent());
        expect(
            screen.getByTestId(CreateExecuteActionsWizardStep.ACTIONS).dataset
                .disableNext,
        ).toEqual('true');
    });

    it('wires the simulate dropdown items onto the step', () => {
        useWatchSpy.mockReturnValue([{ to: '0x', data: '0x', value: '0' }]);
        useSimulateActionsDropdownSpy.mockReturnValue([
            { label: 'simulate', onClick: jest.fn() },
            { label: 'skip', formId: 'id' },
        ]);
        render(createTestComponent());
        expect(
            screen.getByTestId(CreateExecuteActionsWizardStep.ACTIONS).dataset
                .dropdownItems,
        ).toEqual('2');
    });
});
