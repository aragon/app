import { testLogger } from '@/test/utils';
import { render, renderHook, screen } from '@testing-library/react';
import { type ProviderProps } from 'react';
import { type IWizardContext, WizardProvider, useWizardContext } from './wizardProvider';

describe('<WizardProvider /> component', () => {
    const createTestComponent = (props?: Partial<ProviderProps<IWizardContext>>) => {
        const completeProps: ProviderProps<IWizardContext> = {
            value: {
                hasNext: false,
                hasPrevious: false,
                activeStepIndex: 0,
                submitLabel: 'submit',
                steps: [],
                nextStep: jest.fn(),
                previousStep: jest.fn(),
                updateActiveStep: jest.fn(),
                registerStep: jest.fn(),
                unregisterStep: jest.fn(),
                updateSteps: jest.fn(),
            },
            ...props,
        };

        return <WizardProvider {...completeProps} />;
    };

    it('renders the children component', () => {
        const children = 'test-children';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    describe('useWizardContext hook', () => {
        it('throws error when used outside the WizardProvider', () => {
            testLogger.suppressErrors();
            expect(() => renderHook(() => useWizardContext())).toThrow();
        });

        it('returns the dialog context values', () => {
            const { result } = renderHook(() => useWizardContext(), { wrapper: createTestComponent });
            expect(result.current.activeStepIndex).toBeDefined();
            expect(result.current.hasNext).toBeDefined();
            expect(result.current.hasPrevious).toBeDefined();
            expect(result.current.nextStep).toBeDefined();
            expect(result.current.previousStep).toBeDefined();
        });
    });
});
