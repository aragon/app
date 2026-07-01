import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { decodeFunctionData } from 'viem';
import { memberRegistryAbi, memberRegistryAddress } from '@/modules/ens';
import { Network } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogProps,
    TransactionDialog,
} from '@/shared/components/transactionDialog';
import { generateDialogContext, ReactQueryWrapper } from '@/shared/testUtils';
import * as useWalletAccountHook from '../../hooks/useWalletAccount';
import {
    AragonProfileRenameTransactionDialog,
    type IAragonProfileRenameTransactionDialogParams,
} from './aragonProfileRenameTransactionDialog';

// TransactionDialog encapsulates the on-chain pipeline. Mock it so we can capture
// the props the wrapper hands off (prepareTransaction, network, ...) without
// pulling wagmi/viem into the test environment.
jest.mock('@/shared/components/transactionDialog', () => ({
    __esModule: true,
    TransactionDialog: jest.fn((props: { children?: ReactNode }) => (
        <div data-testid="transaction-dialog">{props.children}</div>
    )),
    TransactionDialogStep: { PREPARE: 'PREPARE' },
}));

jest.mock('../../components/aragonProfilePreviewCard', () => ({
    AragonProfilePreviewCard: () => <div data-testid="preview-card" />,
}));

const WALLET = '0x1111111111111111111111111111111111111111';
const ADDR = '0x2222222222222222222222222222222222222222';
const CONTENTHASH = '0xe30101701220abcdef';

const buildParams = (
    overrides?: Partial<IAragonProfileRenameTransactionDialogParams>,
): IAragonProfileRenameTransactionDialogParams => ({
    subdomain: 'alice',
    records: {
        textRecords: [
            { key: 'com.twitter', value: 'alice' },
            { key: 'url', value: 'https://alice.xyz' },
        ],
        addr: ADDR,
        contenthash: CONTENTHASH,
    },
    ...overrides,
});

describe('<AragonProfileRenameTransactionDialog />', () => {
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountHook,
        'useWalletAccount',
    );

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useWalletAccountSpy.mockReturnValue({
            address: WALLET,
            chainId: 1,
            isReconnecting: false,
        });
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        useWalletAccountSpy.mockReset();
        (TransactionDialog as unknown as jest.Mock).mockClear();
    });

    const lastDialogProps = () =>
        (TransactionDialog as unknown as jest.Mock).mock
            .calls[0]?.[0] as unknown as ITransactionDialogProps<string>;

    const renderDialog = (params = buildParams()) =>
        render(
            <ReactQueryWrapper>
                <AragonProfileRenameTransactionDialog
                    location={{ id: 'tx', params }}
                />
            </ReactQueryWrapper>,
        );

    it('encodes a move() call carrying the full record set unchanged', async () => {
        const params = buildParams();
        renderDialog(params);

        const tx = await lastDialogProps().prepareTransaction();

        expect(tx.to).toBe(memberRegistryAddress);
        expect(tx.value).toBe(BigInt(0));

        const { functionName, args } = decodeFunctionData({
            abi: memberRegistryAbi,
            data: tx.data,
        });

        expect(functionName).toBe('move');
        // Two-arg overload: [newSubdomain, Records].
        expect(args).toHaveLength(2);
        const [newSubdomain, records] = args as unknown as [
            string,
            {
                textRecords: { key: string; value: string }[];
                addr: string;
                contenthash: string;
            },
        ];
        expect(newSubdomain).toBe(params.subdomain);
        expect(records.textRecords).toEqual(params.records.textRecords);
        expect(records.addr.toLowerCase()).toBe(
            params.records.addr.toLowerCase(),
        );
        expect(records.contenthash).toBe(params.records.contenthash);
    });

    it('preserves an empty content hash (0x) instead of dropping it', async () => {
        renderDialog(
            buildParams({
                records: {
                    textRecords: [],
                    addr: ADDR,
                    contenthash: '0x',
                },
            }),
        );

        const tx = await lastDialogProps().prepareTransaction();
        const { args } = decodeFunctionData({
            abi: memberRegistryAbi,
            data: tx.data,
        });
        const records = (
            args as unknown as [string, { contenthash: string }]
        )[1];

        expect(records.contenthash).toBe('0x');
    });

    it('targets Ethereum mainnet for the rename transaction', () => {
        renderDialog();

        expect(lastDialogProps().network).toBe(Network.ETHEREUM_MAINNET);
    });
});
