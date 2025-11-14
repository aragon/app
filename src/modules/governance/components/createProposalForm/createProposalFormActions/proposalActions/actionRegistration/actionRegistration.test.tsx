import type { IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import type { IProposalActionData } from '../../../createProposalFormDefinitions';
import { ActionRegistration } from './actionRegistration';

describe('ActionRegistration HOC', () => {
    const TestComponent: React.FC<IProposalActionComponentProps<IProposalActionData>> = ({ index }) => (
        <div data-testid="test-component">Action {index}</div>
    );

    const createTestComponent = (index = 0) => {
        const WrappedComponent = ActionRegistration(TestComponent);

        const mockAction: IProposalActionData = {
            id: 'action-1',
            type: 'TRANSFER',
            to: '0xRecipient',
            from: '0xSender',
            daoId: 'dao-test',
            data: '0x',
            value: '1000000000000000000',
            meta: undefined,
            inputData: {
                function: 'transfer',
                contract: 'Token',
                parameters: [
                    { name: '_to', type: 'address', value: '0xRecipient' },
                    { name: '_value', type: 'uint256', value: '1000000000000000000' },
                ],
            },
        };

        const TestWrapper = () => {
            const formMethods = useForm({
                defaultValues: {
                    actions: [mockAction],
                },
            });

            return (
                <FormProvider {...formMethods}>
                    <WrappedComponent action={mockAction} index={index} />
                </FormProvider>
            );
        };

        return <TestWrapper />;
    };

    it('renders the wrapped component', () => {
        render(createTestComponent(0));
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
        expect(screen.getByText('Action 0')).toBeInTheDocument();
    });

    it('passes through index prop to the wrapped component', () => {
        render(createTestComponent(1));
        expect(screen.getByText('Action 1')).toBeInTheDocument();
    });

    it('registers hidden fields for action properties', () => {
        const { container } = render(createTestComponent(0));

        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        expect(container.querySelector('input[name="actions.[0].type"]')).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        expect(container.querySelector('input[name="actions.[0].to"]')).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        expect(container.querySelector('input[name="actions.[0].from"]')).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        expect(container.querySelector('input[name="actions.[0].daoId"]')).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        expect(container.querySelector('input[name="actions.[0].data"]')).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        expect(container.querySelector('input[name="actions.[0].value"]')).toBeInTheDocument();
    });

    it('registers hidden fields for inputData properties', () => {
        const { container } = render(createTestComponent(0));

        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        expect(container.querySelector('input[name="actions.[0].inputData.function"]')).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        expect(container.querySelector('input[name="actions.[0].inputData.contract"]')).toBeInTheDocument();
    });

    it('handles different index values correctly', () => {
        const { container } = render(createTestComponent(2));

        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        expect(container.querySelector('input[name="actions.[2].type"]')).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        expect(container.querySelector('input[name="actions.[2].to"]')).toBeInTheDocument();
    });

    it('sets the correct displayName', () => {
        const WrappedComponent = ActionRegistration(TestComponent);
        expect(WrappedComponent.displayName).toBe('actionRegistration(TestComponent)');
    });

    it('preserves component functionality when wrapped', () => {
        render(createTestComponent(0));
        const component = screen.getByTestId('test-component');
        expect(component).toBeInTheDocument();
        expect(component.textContent).toContain('Action 0');
    });
});
