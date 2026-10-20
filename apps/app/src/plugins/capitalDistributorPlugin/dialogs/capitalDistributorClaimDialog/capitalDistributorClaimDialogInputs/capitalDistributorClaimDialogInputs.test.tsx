import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import * as useWalletAccountHook from '@/modules/application/hooks/useWalletAccount';
import * as cmsService from '@/shared/api/cmsService';
import { Network } from '@/shared/api/daoService';
import {
    generateDaoPlugin,
    generateReactQueryResultError,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import type { ICapitalDistributorClaimDialogForm } from '../capitalDistributorClaimDialogDefinitions';
import {
    CapitalDistributorClaimDialogInputs,
    type ICapitalDistributorClaimDialogInputsProps,
} from './capitalDistributorClaimDialogInputs';

describe('<CapitalDistributorClaimDialogInputs /> component', () => {
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountHook,
        'useWalletAccount',
    );
    const useSanctionedAddressesSpy = jest.spyOn(
        cmsService,
        'useSanctionedAddresses',
    );
    const logMessageSpy = jest.spyOn(monitoringUtils, 'logMessage');

    const recipient = '0x1111111111111111111111111111111111111111';
    const sanctionedRecipient = '0x2222222222222222222222222222222222222222';

    beforeEach(() => {
        useWalletAccountSpy.mockReturnValue({
            address: recipient,
        } as unknown as ReturnType<
            typeof useWalletAccountHook.useWalletAccount
        >);
        useSanctionedAddressesSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: { [Network.ETHEREUM_MAINNET]: [sanctionedRecipient] },
            }),
        );
        logMessageSpy.mockImplementation(() => undefined);
    });

    afterEach(() => {
        useWalletAccountSpy.mockReset();
        useSanctionedAddressesSpy.mockReset();
        logMessageSpy.mockReset();
    });

    const TestComponent: React.FC<
        Partial<ICapitalDistributorClaimDialogInputsProps> & {
            onSubmit: jest.Mock;
            recipient: string;
        }
    > = (props) => {
        const { onSubmit, recipient: defaultRecipient, ...otherProps } = props;
        const formMethods = useForm<ICapitalDistributorClaimDialogForm>({
            defaultValues: { recipient: defaultRecipient },
        });
        const completeProps: ICapitalDistributorClaimDialogInputsProps = {
            plugin: { ...generateDaoPlugin(), enableOfacCheck: true },
            network: Network.ETHEREUM_MAINNET,
            ...otherProps,
        };

        return (
            <FormProvider {...formMethods}>
                <form onSubmit={formMethods.handleSubmit(onSubmit)}>
                    <CapitalDistributorClaimDialogInputs {...completeProps} />
                    <button type="submit">Submit</button>
                </form>
            </FormProvider>
        );
    };

    const submit = () =>
        userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    it('accepts a recipient that is not on the sanctions list', async () => {
        const onSubmit = jest.fn();
        render(<TestComponent onSubmit={onSubmit} recipient={recipient} />);

        await submit();

        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    });

    it('rejects a sanctioned recipient and reports the attempt', async () => {
        const onSubmit = jest.fn();
        render(
            <TestComponent
                onSubmit={onSubmit}
                recipient={sanctionedRecipient}
            />,
        );

        await submit();

        expect(
            await screen.findByText(/recipient\.error\.ofac(?!Unavailable)/),
        ).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
        expect(logMessageSpy).toHaveBeenCalled();
    });

    it('rejects every recipient while the sanctions list is unavailable', async () => {
        useSanctionedAddressesSpy.mockReturnValue(
            generateReactQueryResultError({ error: new Error('cms down') }),
        );
        const onSubmit = jest.fn();
        render(<TestComponent onSubmit={onSubmit} recipient={recipient} />);

        await submit();

        expect(
            await screen.findByText(/recipient\.error\.ofacUnavailable/),
        ).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('rejects a recipient listed under another network', async () => {
        const onSubmit = jest.fn();
        render(
            <TestComponent
                network={Network.BASE_MAINNET}
                onSubmit={onSubmit}
                recipient={sanctionedRecipient}
            />,
        );

        await submit();

        expect(
            await screen.findByText(/recipient\.error\.ofac(?!Unavailable)/),
        ).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
        expect(logMessageSpy).toHaveBeenCalled();
    });

    it('accepts a clean recipient on a network the sanctions list does not cover', async () => {
        const onSubmit = jest.fn();
        render(
            <TestComponent
                network={Network.BASE_MAINNET}
                onSubmit={onSubmit}
                recipient={recipient}
            />,
        );

        await submit();

        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    });

    it.each([
        { label: 'empty', data: {} },
        {
            label: 'malformed',
            data: { [Network.ETHEREUM_MAINNET]: sanctionedRecipient },
        },
        {
            label: 'not address-shaped',
            data: {
                [Network.ETHEREUM_MAINNET]: [{ address: sanctionedRecipient }],
            },
        },
        {
            label: 'naming no address',
            data: { [Network.ETHEREUM_MAINNET]: [] },
        },
    ])(
        'rejects every recipient while the sanctions list is $label',
        async ({ data }) => {
            useSanctionedAddressesSpy.mockReturnValue(
                generateReactQueryResultSuccess({ data: data as never }),
            );
            const onSubmit = jest.fn();
            render(<TestComponent onSubmit={onSubmit} recipient={recipient} />);

            await submit();

            expect(
                await screen.findByText(/recipient\.error\.ofacUnavailable/),
            ).toBeInTheDocument();
            expect(onSubmit).not.toHaveBeenCalled();
        },
    );

    it('skips the sanctions check when the plugin does not enable it', async () => {
        useSanctionedAddressesSpy.mockReturnValue(
            generateReactQueryResultError({ error: new Error('cms down') }),
        );
        const onSubmit = jest.fn();
        render(
            <TestComponent
                onSubmit={onSubmit}
                plugin={{ ...generateDaoPlugin(), enableOfacCheck: false }}
                recipient={recipient}
            />,
        );

        await submit();

        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    });
});
