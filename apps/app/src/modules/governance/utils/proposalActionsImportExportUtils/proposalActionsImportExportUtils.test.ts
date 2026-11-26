import { encodeFunctionData, erc20Abi, zeroAddress } from 'viem';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { generateDao } from '@/shared/testUtils';
import { ProposalActionType } from '../../api/governanceService';
import { generateProposalAction } from '../../testUtils';
import { proposalActionsImportExportUtils } from './proposalActionsImportExportUtils';

describe('proposalActionsImportExportUtils', () => {
    describe('exportActionsToJSON', () => {
        const action = {
            to: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            value: '0',
            data: '0xdeadbeef',
        };

        it('exports the action fields', () => {
            expect(
                proposalActionsImportExportUtils.exportActionsToJSON([action]),
            ).toEqual([{ to: action.to, value: '0', data: action.data }]);
        });

        it.each([
            '1234567891234567891',
            '1000000000000000000000',
            '9007199254740993',
        ])(
            'keeps the wei value %p exact, which a JS number would round',
            (value) => {
                const [exported] =
                    proposalActionsImportExportUtils.exportActionsToJSON([
                        { ...action, value },
                    ]);

                expect(exported.value).toEqual(value);
                // The downloaded file must not carry a rounded or exponential amount.
                expect(JSON.stringify(exported.value)).toEqual(`"${value}"`);
            },
        );

        it('stringifies a bigint value instead of narrowing it to a number', () => {
            const value = BigInt('1234567891234567891');

            const [exported] =
                proposalActionsImportExportUtils.exportActionsToJSON([
                    { ...action, value } as unknown as typeof action,
                ]);

            expect(exported.value).toEqual('1234567891234567891');
        });

        it('falls back to zero for a missing value, which the import path rejects as empty', () => {
            const [exported] =
                proposalActionsImportExportUtils.exportActionsToJSON([
                    { ...action, value: '' },
                ]);

            expect(exported.value).toEqual('0');
        });
    });

    describe('normalizeDecodedActions', () => {
        const network = Network.ETHEREUM_SEPOLIA;
        const account = {
            network,
            address: '0x3333333333333333333333333333333333333333',
        };
        const token = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
        const receiver = '0x2222222222222222222222222222222222222222';
        const owner = '0x4444444444444444444444444444444444444444';

        // An ERC-20 `transfer` as the backend decodes it, typed as a transfer with the raw amount in its arguments.
        const erc20Transfer = generateProposalAction({
            type: ProposalActionType.TRANSFER,
            from: '',
            to: token,
            data: encodeFunctionData({
                abi: erc20Abi,
                functionName: 'transfer',
                args: [receiver, BigInt(2_500_000)],
            }),
            inputData: {
                function: 'transfer',
                contract: 'USDC',
                parameters: [
                    { name: '_to', type: 'address', value: receiver },
                    { name: '_value', type: 'uint256', value: '2500000' },
                ],
            },
        });

        const nativeTransfer = generateProposalAction({
            type: ProposalActionType.TRANSFER_NATIVE,
            from: '',
            to: receiver,
            data: '0x',
            value: '1500000000000000000',
        });

        // The backend types `transferFrom` as a transfer too, its receiver and amount being its 2nd and 3rd arguments.
        const transferFrom = generateProposalAction({
            type: ProposalActionType.TRANSFER,
            to: token,
            data: encodeFunctionData({
                abi: erc20Abi,
                functionName: 'transferFrom',
                args: [owner, receiver, BigInt(2_500_000)],
            }),
            inputData: {
                function: 'transferFrom',
                contract: 'USDC',
                parameters: [
                    { name: '_from', type: 'address', value: owner },
                    { name: '_to', type: 'address', value: receiver },
                    { name: '_value', type: 'uint256', value: '2500000' },
                ],
            },
        });

        const otherAction = generateProposalAction({ type: 'Mint' });

        it('leaves every action to the decoded view outside DAO context without an account', () => {
            const result =
                proposalActionsImportExportUtils.normalizeDecodedActions([
                    erc20Transfer,
                    nativeTransfer,
                    otherAction,
                ]);

            expect(result.map(({ type }) => type)).toEqual([
                'Unknown',
                'Unknown',
                'Unknown',
            ]);
        });

        it('gives the transfers of an account their basic view, sent from it, and leaves the rest to the decoded view', () => {
            const [erc20, native, other] =
                proposalActionsImportExportUtils.normalizeDecodedActions(
                    [erc20Transfer, nativeTransfer, otherAction],
                    undefined,
                    account,
                );

            expect(erc20).toEqual(
                expect.objectContaining({
                    type: ProposalActionType.TRANSFER,
                    from: account.address,
                    data: erc20Transfer.data,
                    receiver: { address: receiver },
                    rawAmount: '2500000',
                    asset: expect.objectContaining({
                        token: expect.objectContaining({
                            address: token,
                            network,
                        }),
                    }),
                }),
            );
            expect(native).toEqual(
                expect.objectContaining({
                    type: ProposalActionType.TRANSFER,
                    from: account.address,
                    receiver: { address: receiver },
                    amount: '1.5',
                    asset: expect.objectContaining({
                        token: expect.objectContaining({
                            address: zeroAddress,
                            network,
                        }),
                    }),
                }),
            );
            expect(other.type).toEqual('Unknown');
        });

        it('names an imported native transfer after the native currency of the network', () => {
            const polygon = Network.POLYGON_MAINNET;
            const { nativeCurrency } = networkDefinitions[polygon];

            const [native] =
                proposalActionsImportExportUtils.normalizeDecodedActions(
                    [nativeTransfer],
                    undefined,
                    { ...account, network: polygon },
                );

            expect(native).toEqual(
                expect.objectContaining({
                    amount: '1.5',
                    asset: expect.objectContaining({
                        token: expect.objectContaining({
                            name: nativeCurrency.name,
                            symbol: nativeCurrency.symbol,
                            decimals: nativeCurrency.decimals,
                            network: polygon,
                        }),
                    }),
                }),
            );
            expect(nativeCurrency.symbol).not.toEqual('ETH');
        });

        it('gives the transfers their basic view in DAO context, on the DAO network', () => {
            const dao = generateDao({ network: Network.POLYGON_MAINNET });

            const [erc20] =
                proposalActionsImportExportUtils.normalizeDecodedActions(
                    [erc20Transfer],
                    dao,
                    account,
                );

            expect(erc20).toEqual(
                expect.objectContaining({
                    type: ProposalActionType.TRANSFER,
                    from: erc20Transfer.from,
                    asset: expect.objectContaining({
                        token: expect.objectContaining({
                            network: Network.POLYGON_MAINNET,
                        }),
                    }),
                }),
            );
        });

        it.each([
            ['DAO context', generateDao(), undefined],
            ['account context', undefined, account],
        ])(
            'leaves a transferFrom to the decoded view in %s, keeping its calldata',
            (_, dao, decodedAccount) => {
                const [result] =
                    proposalActionsImportExportUtils.normalizeDecodedActions(
                        [transferFrom],
                        dao,
                        decodedAccount,
                    );

                expect(result).toEqual({ ...transferFrom, type: 'Unknown' });
            },
        );
    });
});
