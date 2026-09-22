import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render } from '@testing-library/react';
import { FormProvider, type UseFormReturn, useForm } from 'react-hook-form';
import { zeroAddress } from 'viem';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { PermissionAddressInput } from './permissionAddressInput';

describe('<PermissionAddressInput /> component', () => {
    const fieldPrefix = 'actions.0';
    const name = 'inputData.parameters.1.value';
    const fieldPath = `${fieldPrefix}.${name}`;
    const validAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

    let formMethods: UseFormReturn | undefined;

    const TestForm = (props: {
        initialValue?: string;
        isCondition?: boolean;
    }) => {
        const methods = useForm({
            defaultValues: {
                actions: [
                    {
                        inputData: {
                            parameters: [
                                {},
                                { value: props.initialValue ?? '' },
                            ],
                        },
                    },
                ],
            },
        });
        formMethods = methods as unknown as UseFormReturn;

        return (
            <GukModulesProvider>
                <ReactQueryWrapper>
                    <FormProvider {...methods}>
                        <PermissionAddressInput
                            fieldPrefix={fieldPrefix}
                            helpText="The actor"
                            isCondition={props.isCondition}
                            label="Who"
                            name={name}
                        />
                    </FormProvider>
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    it('is required', async () => {
        render(<TestForm />);

        await formMethods?.trigger(fieldPath);

        expect(formMethods?.getFieldState(fieldPath).error).toBeDefined();
    });

    it('accepts a checksummed address', async () => {
        render(<TestForm initialValue={validAddress} />);

        await formMethods?.trigger(fieldPath);

        expect(formMethods?.getFieldState(fieldPath).error).toBeUndefined();
    });

    it('rejects a value that is not an address', async () => {
        render(<TestForm initialValue="not-an-address" />);

        await formMethods?.trigger(fieldPath);

        expect(formMethods?.getFieldState(fieldPath).error).toBeDefined();
    });

    it('rejects a mixed-case address with a wrong checksum', async () => {
        // viem's strict check accepts all-lowercase; only a bad mixed-case checksum fails.
        const badChecksum = validAddress.replace('aA96045', 'Aa96045');
        render(<TestForm initialValue={badChecksum} />);

        await formMethods?.trigger(fieldPath);

        expect(formMethods?.getFieldState(fieldPath).error).toBeDefined();
    });

    it('accepts the zero address when the field is not a condition', async () => {
        render(<TestForm initialValue={zeroAddress} />);

        await formMethods?.trigger(fieldPath);

        expect(formMethods?.getFieldState(fieldPath).error).toBeUndefined();
    });

    it('rejects the zero address on a condition field', async () => {
        // The zero address is OSx's "no condition" sentinel, so it is a valid address
        // but a meaningless condition.
        render(<TestForm initialValue={zeroAddress} isCondition={true} />);

        await formMethods?.trigger(fieldPath);

        expect(formMethods?.getFieldState(fieldPath).error?.message).toEqual(
            'app.actions.core.permissionAddressInput.conditionRequired',
        );
    });

    it('accepts a real contract on a condition field', async () => {
        render(<TestForm initialValue={validAddress} isCondition={true} />);

        await formMethods?.trigger(fieldPath);

        expect(formMethods?.getFieldState(fieldPath).error).toBeUndefined();
    });
});
