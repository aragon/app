import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { TransactionReceipt } from 'viem';
import * as Wagmi from 'wagmi';
import { Network } from '@/shared/api/daoService';
import * as IpfsMutations from '@/shared/api/ipfsService/mutations';
import { TransactionDialog } from '@/shared/components/transactionDialog';
import {
    generateReactQueryMutationResultIdle,
    generateReactQueryMutationResultSuccess,
} from '@/shared/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { CreateDaoSlotId } from '../../constants/moduleSlots';
import {
    type IPublishDaoDialogParams,
    PublishDaoDialog,
    PublishDaoStep,
} from './publishDaoDialog';
import { publishDaoDialogUtils } from './publishDaoDialogUtils';

jest.mock('@/shared/components/transactionDialog', () => ({
    TransactionDialog: jest.fn((props: { children: ReactNode }) => (
        <div data-testid="transaction-dialog">{props.children}</div>
    )),
}));

describe('<PublishDaoDialog /> component', () => {
    const useConnectionSpy = jest.spyOn(Wagmi, 'useConnection');
    const usePinJsonSpy = jest.spyOn(IpfsMutations, 'usePinJson');
    const usePinFileSpy = jest.spyOn(IpfsMutations, 'usePinFile');
    const getSlotFunctionSpy = jest.spyOn(
        pluginRegistryUtils,
        'getSlotFunction',
    );
    const buildTransactionSpy = jest.spyOn(
        publishDaoDialogUtils,
        'buildTransaction',
    );
    const getDaoAddressSpy = jest.spyOn(publishDaoDialogUtils, 'getDaoAddress');

    const values = {
        name: 'My DAO',
        description: 'description',
        resources: [],
        ens: '',
        network: Network.ETHEREUM_SEPOLIA,
    };

    beforeEach(() => {
        useConnectionSpy.mockReturnValue({
            address: '0x123',
        } as unknown as Wagmi.UseConnectionReturnType);
        usePinJsonSpy.mockReturnValue(generateReactQueryMutationResultIdle());
        usePinFileSpy.mockReturnValue(generateReactQueryMutationResultIdle());
        buildTransactionSpy.mockResolvedValue({
            to: '0x123',
            data: '0x123',
            value: BigInt(0),
        });
    });

    afterEach(() => {
        (TransactionDialog as jest.Mock).mockClear();
        useConnectionSpy.mockReset();
        usePinJsonSpy.mockReset();
        usePinFileSpy.mockReset();
        getSlotFunctionSpy.mockReset();
        buildTransactionSpy.mockReset();
        getDaoAddressSpy.mockReset();
    });

    const renderDialog = (params?: Partial<IPublishDaoDialogParams>) =>
        render(
            <PublishDaoDialog
                location={{ id: 'PUBLISH_DAO', params: { values, ...params } }}
            />,
        );

    const getTransactionDialogProps = () =>
        (TransactionDialog as jest.Mock).mock.calls[0][0] as {
            title: string;
            description: string;
            submitLabel: string;
            successLink: {
                label: string;
                href?: unknown;
                onClick?: (receipt: TransactionReceipt) => void;
            };
            prepareTransaction: () => unknown;
            onProceedAnyway?: (receipt: TransactionReceipt) => void;
            preventCloseWhileBusy?: boolean;
            customSteps: Array<{ id: string }>;
        };

    it('builds the transaction with the plugin settings of the selected plugin', async () => {
        const pluginSettings = {
            pluginSetupRef: {
                pluginSetupRepo: '0x0000000000000000000000000000000000000abc',
                versionTag: { release: 1, build: 1 },
            },
            data: '0x1234',
        };
        const buildPluginSettings = jest.fn().mockReturnValue(pluginSettings);
        getSlotFunctionSpy.mockReturnValue(buildPluginSettings);
        const settings = { signers: [], minApprovals: 1 };
        usePinJsonSpy.mockReturnValue(
            generateReactQueryMutationResultSuccess({
                data: { IpfsHash: 'QmTest' },
            }),
        );

        renderDialog({ plugin: { pluginId: 'multisig', settings } });
        await getTransactionDialogProps().prepareTransaction();

        expect(getSlotFunctionSpy).toHaveBeenCalledWith({
            slotId: CreateDaoSlotId.CREATE_DAO_BUILD_PLUGIN_SETTINGS,
            pluginId: 'multisig',
        });
        expect(buildPluginSettings).toHaveBeenCalledWith({
            network: values.network,
            ...settings,
        });
        expect(buildTransactionSpy).toHaveBeenCalledWith(
            expect.objectContaining({ pluginSettings: [pluginSettings] }),
        );
    });

    it('throws when no plugin settings builder is registered for the selected plugin', async () => {
        getSlotFunctionSpy.mockReturnValue(undefined);
        usePinJsonSpy.mockReturnValue(
            generateReactQueryMutationResultSuccess({
                data: { IpfsHash: 'QmTest' },
            }),
        );

        renderDialog({
            plugin: {
                pluginId: 'multisig',
                settings: { signers: [], minApprovals: 1 },
            },
        });

        await expect(async () =>
            getTransactionDialogProps().prepareTransaction(),
        ).rejects.toThrow(/no plugin settings builder registered/);
    });

    it('calls onCreated with the deployed DAO, instead of linking to the DAO page', () => {
        const daoAddress = '0x00000000000000000000000000000000000000da';
        getDaoAddressSpy.mockReturnValue(daoAddress);
        const onCreated = jest.fn();

        renderDialog({ onCreated });
        const { successLink } = getTransactionDialogProps();
        successLink.onClick?.({} as TransactionReceipt);

        expect(successLink.href).toBeUndefined();
        expect(onCreated).toHaveBeenCalledWith({
            address: daoAddress,
            network: values.network,
        });
        expect(TransactionDialog).toHaveBeenCalledWith(
            expect.objectContaining({ dialogId: 'PUBLISH_DAO' }),
            undefined,
        );
    });

    it('passes onProceedAnyway in onCreated mode that calls onCreated with the deployed DAO', () => {
        const daoAddress = '0x00000000000000000000000000000000000000da';
        getDaoAddressSpy.mockReturnValue(daoAddress);
        const onCreated = jest.fn();

        renderDialog({ onCreated });
        const { onProceedAnyway } = getTransactionDialogProps();
        onProceedAnyway?.({} as TransactionReceipt);

        expect(onCreated).toHaveBeenCalledWith({
            address: daoAddress,
            network: values.network,
        });
    });

    it('throws when the receipt has no deployed DAO', () => {
        getDaoAddressSpy.mockReturnValue(undefined as never);
        renderDialog({ onCreated: jest.fn() });
        const { successLink } = getTransactionDialogProps();
        expect(() => successLink.onClick?.({} as TransactionReceipt)).toThrow(
            /DAORegistered/,
        );
    });

    it('does not pass onProceedAnyway when onCreated is not set', () => {
        renderDialog();
        expect(getTransactionDialogProps().onProceedAnyway).toBeUndefined();
    });

    it('blocks closing the dialog while busy only in onCreated mode', () => {
        renderDialog({ onCreated: jest.fn() });
        expect(getTransactionDialogProps().preventCloseWhileBusy).toBe(true);
    });

    it('does not block closing the dialog while busy when onCreated is not set', () => {
        renderDialog();
        expect(getTransactionDialogProps().preventCloseWhileBusy).toBe(false);
    });

    it('links to the DAO page when onCreated is not set', () => {
        renderDialog();
        const { successLink } = getTransactionDialogProps();
        expect(successLink.onClick).toBeUndefined();
        expect(typeof successLink.href).toBe('function');
    });

    it('shows the given labels', () => {
        const labels = {
            title: 'Create account',
            description: 'Confirm it',
            submit: 'Deploy account',
            success: 'Continue',
        };

        renderDialog({ labels });

        expect(TransactionDialog).toHaveBeenCalledWith(
            expect.objectContaining({
                title: labels.title,
                description: labels.description,
                submitLabel: labels.submit,
                successLink: expect.objectContaining({
                    label: labels.success,
                }) as unknown,
            }),
            undefined,
        );
    });

    it('uses the default copy when no labels are given', () => {
        renderDialog();
        const props = getTransactionDialogProps();
        expect(props.title).toMatch(/publishDaoDialog.title/);
        expect(props.customSteps[0].id).toBe(PublishDaoStep.PIN_METADATA);
    });
});
