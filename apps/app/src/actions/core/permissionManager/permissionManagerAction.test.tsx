import {
    addressUtils,
    type IProposalActionInputDataParameter,
    ProposalActionsDecoderMode,
} from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, type UseFormReturn, useForm } from 'react-hook-form';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import {
    getPermissionManagerParameterComponents,
    PermissionManagerPermissionField,
} from './permissionManagerAction';

describe('<PermissionManagerPermissionField /> component', () => {
    let form: UseFormReturn<Record<string, string>> | undefined;

    const buildParameter = (
        value?: unknown,
    ): IProposalActionInputDataParameter => ({
        name: '_permissionId',
        type: 'bytes32',
        value,
    });

    const TestHarness = (props: { defaultValue?: string }) => {
        const methods = useForm<Record<string, string>>({
            defaultValues: props.defaultValue
                ? {
                      'actions.0.inputData.parameters.2.value':
                          props.defaultValue,
                  }
                : undefined,
        });
        form = methods;

        return (
            <FormProvider {...methods}>
                <PermissionManagerPermissionField
                    fieldName="value"
                    formPrefix="actions.0.inputData.parameters.2"
                    mode={ProposalActionsDecoderMode.EDIT}
                    parameter={buildParameter()}
                />
            </FormProvider>
        );
    };

    afterEach(() => {
        form = undefined;
    });

    it('stores the hash of the selected permission', async () => {
        const user = userEvent.setup();
        const permissionId =
            permissionNameUtils.getPermissionId('EXECUTE_PERMISSION');

        render(<TestHarness />);

        await user.click(screen.getByLabelText(/permission\.label/u));
        await user.type(
            screen.getByLabelText(/permission\.label/u),
            'EXECUTE_PERMISSION',
        );
        await user.click(screen.getByText('EXECUTE_PERMISSION'));

        expect(form?.getValues('actions.0.inputData.parameters.2.value')).toBe(
            permissionId,
        );
    });

    it('stores a custom hash for a permission outside the dictionary', async () => {
        const user = userEvent.setup();
        const customId = `0x${'ab'.repeat(32)}`;

        render(<TestHarness />);

        await user.click(screen.getByLabelText(/permission\.label/u));
        await user.type(screen.getByLabelText(/permission\.label/u), customId);
        await user.click(screen.getByText(/permission\.customItem/u));

        expect(form?.getValues('actions.0.inputData.parameters.2.value')).toBe(
            customId,
        );
    });

    it('renders the resolved name as the value with the hash as evidence', () => {
        const permissionId =
            permissionNameUtils.getPermissionId('ROOT_PERMISSION');

        render(
            <PermissionManagerPermissionField
                fieldName="value"
                mode={ProposalActionsDecoderMode.READ}
                parameter={buildParameter(permissionId)}
            />,
        );

        expect(screen.getByText('ROOT_PERMISSION')).toBeInTheDocument();
        expect(screen.getByText('_permissionId (bytes32)')).toBeInTheDocument();
        expect(
            screen.getByText(
                new RegExp(addressUtils.truncateHash(permissionId), 'u'),
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByDisplayValue(permissionId),
        ).not.toBeInTheDocument();
    });

    it('warns and keeps the hash primary for an unknown permission', () => {
        const unknownId = `0x${'ab'.repeat(32)}`;

        render(
            <PermissionManagerPermissionField
                fieldName="value"
                mode={ProposalActionsDecoderMode.READ}
                parameter={buildParameter(unknownId)}
            />,
        );

        expect(screen.getByText(unknownId)).toBeInTheDocument();
        expect(screen.getByText(/permission\.unknown/u)).toBeInTheDocument();
    });

    it('reads the permission from the form context on watch mode', () => {
        const permissionId =
            permissionNameUtils.getPermissionId('EXECUTE_PERMISSION');

        const WatchHarness = () => {
            const methods = useForm<Record<string, string>>({
                defaultValues: {
                    'actions.0.inputData.parameters.2.value': permissionId,
                },
            });

            return (
                <FormProvider {...methods}>
                    <PermissionManagerPermissionField
                        fieldName="value"
                        formPrefix="actions.0.inputData.parameters.2"
                        mode={ProposalActionsDecoderMode.WATCH}
                        parameter={buildParameter()}
                    />
                </FormProvider>
            );
        };

        render(<WatchHarness />);

        expect(screen.getByText('EXECUTE_PERMISSION')).toBeInTheDocument();
    });
});

describe('getPermissionManagerParameterComponents', () => {
    const buildAction = (functionName: string, parameterTypes: string[]) => ({
        inputData: {
            function: functionName,
            contract: 'DAO',
            parameters: parameterTypes.map((type) => ({
                name: '',
                type,
                value: undefined,
            })),
        },
    });

    it.each(['grant', 'revoke'])(
        'configures the permission field for %s(address,address,bytes32)',
        (functionName) => {
            const action = buildAction(functionName, [
                'address',
                'address',
                'bytes32',
            ]);

            expect(getPermissionManagerParameterComponents(action)?.[2]).toBe(
                PermissionManagerPermissionField,
            );
        },
    );

    it('keeps unrelated functions on the default decoded fields', () => {
        const action = buildAction('grant', ['bytes32', 'address']);

        expect(getPermissionManagerParameterComponents(action)).toBeUndefined();
    });
});
