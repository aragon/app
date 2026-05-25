import * as GovUiKit from '@aragon/gov-ui-kit';
import { renderHook } from '@testing-library/react';
import * as ReactHookForm from 'react-hook-form';
import * as Wagmi from 'wagmi';
import { useEnsSubdomainField } from './useEnsSubdomainField';

describe('useEnsSubdomainField hook', () => {
    const useControllerSpy = jest.spyOn(ReactHookForm, 'useController');
    const useWatchSpy = jest.spyOn(ReactHookForm, 'useWatch');
    const useDebouncedValueSpy = jest.spyOn(GovUiKit, 'useDebouncedValue');
    const useEnsAddressSpy = jest.spyOn(Wagmi, 'useEnsAddress');

    const mockField = (overrides?: Partial<{ error: { message: string } }>) => {
        useControllerSpy.mockReturnValue({
            field: { onChange: jest.fn(), onBlur: jest.fn() },
            fieldState: { error: overrides?.error },
        } as unknown as ReactHookForm.UseControllerReturn);
    };

    const mockWatch = (value: string) => {
        useWatchSpy.mockReturnValue(value as never);
        useDebouncedValueSpy.mockReturnValue([value, jest.fn()] as never);
    };

    const mockEns = (
        overrides?: Partial<{ data: string | null; isLoading: boolean }>,
    ) => {
        useEnsAddressSpy.mockReturnValue({
            data: overrides?.data ?? undefined,
            isLoading: overrides?.isLoading ?? false,
        } as never);
    };

    beforeEach(() => {
        mockField();
        mockWatch('');
        mockEns();
    });

    afterEach(() => {
        useControllerSpy.mockReset();
        useWatchSpy.mockReset();
        useDebouncedValueSpy.mockReset();
        useEnsAddressSpy.mockReset();
    });

    const renderForName = (
        params?: Partial<Parameters<typeof useEnsSubdomainField>[0]>,
    ) =>
        renderHook(() =>
            useEnsSubdomainField({
                control: {} as never,
                name: 'subdomain' as never,
                label: 'Aragon name',
                ...params,
            }),
        );

    it('configures useFormField with required, length bounds, sanitize and trim', () => {
        renderForName();
        const call = useControllerSpy.mock.calls[0]?.[0];
        expect(call?.rules).toMatchObject({
            required: true,
            minLength: 3,
            maxLength: 50,
        });
        expect(typeof call?.rules?.validate).toBe('function');
    });

    it('returns invalidChars key when value contains disallowed characters', () => {
        renderForName();
        const validate = useControllerSpy.mock.calls[0]?.[0]?.rules
            ?.validate as (value: string) => string | true;
        expect(validate('UPPER')).toBe(
            'app.application.ensSubdomainField.error.invalidChars',
        );
    });

    it('returns invalidBoundary key when value starts or ends with a hyphen', () => {
        renderForName();
        const validate = useControllerSpy.mock.calls[0]?.[0]?.rules
            ?.validate as (value: string) => string | true;
        expect(validate('-alice')).toBe(
            'app.application.ensSubdomainField.error.invalidBoundary',
        );
        expect(validate('alice-')).toBe(
            'app.application.ensSubdomainField.error.invalidBoundary',
        );
    });

    it('returns sameAsCurrent key when value equals currentSubdomain', () => {
        renderForName({ currentSubdomain: 'alice' });
        const validate = useControllerSpy.mock.calls[0]?.[0]?.rules
            ?.validate as (value: string) => string | true;
        expect(validate('alice')).toBe(
            'app.application.ensSubdomainField.error.sameAsCurrent',
        );
    });

    it('passes validate for a well-formed label', () => {
        renderForName();
        const validate = useControllerSpy.mock.calls[0]?.[0]?.rules
            ?.validate as (value: string) => string | true;
        expect(validate('alice-1')).toBe(true);
    });

    it('disables availability query when debounced value is below min length', () => {
        mockWatch('ab');
        renderForName();
        const queryArg = useEnsAddressSpy.mock.calls[0]?.[0];
        expect(queryArg?.query?.enabled).toBe(false);
        expect(queryArg?.name).toBeUndefined();
    });

    it('disables availability query when external availabilityCheckEnabled is false', () => {
        mockWatch('alice');
        renderForName({ availabilityCheckEnabled: false });
        const queryArg = useEnsAddressSpy.mock.calls[0]?.[0];
        expect(queryArg?.query?.enabled).toBe(false);
    });

    it('enables availability query for a valid debounced label and queries the full ENS name', () => {
        mockWatch('alice');
        renderForName();
        const queryArg = useEnsAddressSpy.mock.calls[0]?.[0];
        expect(queryArg?.query?.enabled).toBe(true);
        expect(queryArg?.name).toMatch(/^alice\./);
    });

    it('surfaces a nameTaken alert when the ENS lookup resolves an address', () => {
        mockWatch('alice');
        mockEns({ data: '0xabc' });
        const { result } = renderForName();
        expect(result.current.isNameTaken).toBe(true);
        expect(result.current.fieldProps.alert).toEqual(
            expect.objectContaining({
                message: expect.stringContaining(
                    'ensSubdomainField.error.nameTaken',
                ),
                variant: 'critical',
            }),
        );
    });

    it('prioritises form-validation alert over availability alert', () => {
        mockField({ error: { message: 'some.field.error' } });
        mockWatch('alice');
        mockEns({ data: '0xabc' });
        const { result } = renderForName();
        expect(result.current.fieldProps.alert?.message).toMatch(
            /some\.field\.error/,
        );
    });
});
