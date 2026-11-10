import { notFound } from 'next/navigation-server';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { Network } from '@/shared/api/daoService';
import {
    type IWorkspaceAccountInfo,
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
    workspaceQueryService,
} from '../../api/workspaceQueryService';
import { WorkspaceAccountType } from '../../api/workspaceService';
import { WorkspaceAccountState } from '../../constants/workspaceAccountState';
import { workspaceAccountInfoUtils } from './workspaceAccountInfoUtils';

jest.mock('next/navigation-server', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

describe('workspaceAccountInfo utils', () => {
    const account = {
        network: Network.ETHEREUM_SEPOLIA,
        address: '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419',
    };
    const accountId = `${account.network}-${account.address}`;

    const buildInfo = (
        info?: Partial<IWorkspaceAccountInfo>,
    ): IWorkspaceAccountInfo => ({
        ...account,
        type: WorkspaceAccountInfoType.SAFE,
        status: WorkspaceAccountInfoStatus.AVAILABLE,
        indexed: false,
        ...info,
    });

    const getAccountsSpy = jest.spyOn(workspaceQueryService, 'getAccounts');

    afterEach(() => {
        getAccountsSpy.mockReset();
    });

    describe('resolveAccount', () => {
        // Bots probe account-addressed URLs; the pages render beside the layout's 404 and would each send the lookup.
        it('resolves a malformed account ID as not found without a lookup', async () => {
            await expect(
                workspaceAccountInfoUtils.resolveAccount(
                    `${Network.ETHEREUM_SEPOLIA}-not-an-address`,
                ),
            ).resolves.toEqual({
                accountInfo: undefined,
                accountState: WorkspaceAccountState.NOT_FOUND,
            });
            expect(getAccountsSpy).not.toHaveBeenCalled();
        });

        it('looks up the account of the ID with its address casing untouched', async () => {
            getAccountsSpy.mockResolvedValue([buildInfo()]);
            const lowercaseId = accountId.toLowerCase();

            await workspaceAccountInfoUtils.resolveAccount(lowercaseId);

            expect(getAccountsSpy).toHaveBeenCalledWith({
                body: {
                    accounts: [
                        {
                            network: account.network,
                            address: account.address.toLowerCase(),
                        },
                    ],
                },
            });
        });

        it('resolves an indexed DAO', async () => {
            const info = buildInfo({
                type: WorkspaceAccountInfoType.DAO,
                indexed: true,
            });
            getAccountsSpy.mockResolvedValue([info]);

            const result =
                await workspaceAccountInfoUtils.resolveAccount(accountId);

            expect(result).toEqual({
                accountInfo: info,
                accountState: WorkspaceAccountState.DAO,
            });
        });

        it('resolves a readable Safe', async () => {
            const info = buildInfo();
            getAccountsSpy.mockResolvedValue([info]);

            const result =
                await workspaceAccountInfoUtils.resolveAccount(accountId);

            expect(result).toEqual({
                accountInfo: info,
                accountState: WorkspaceAccountState.SAFE,
            });
        });

        it('resolves an unsupported address as not found', async () => {
            const info = buildInfo({
                status: WorkspaceAccountInfoStatus.UNSUPPORTED,
            });
            getAccountsSpy.mockResolvedValue([info]);

            const result =
                await workspaceAccountInfoUtils.resolveAccount(accountId);

            expect(result).toEqual({
                accountInfo: info,
                accountState: WorkspaceAccountState.NOT_FOUND,
            });
        });

        it('resolves a 404 of the lookup as not found', async () => {
            getAccountsSpy.mockRejectedValue(
                new AragonBackendServiceError(
                    AragonBackendServiceError.notFoundCode,
                    'Resource not found',
                    404,
                ),
            );

            const result =
                await workspaceAccountInfoUtils.resolveAccount(accountId);

            expect(result).toEqual({
                accountInfo: undefined,
                accountState: WorkspaceAccountState.NOT_FOUND,
            });
        });

        it('resolves any other failure of the lookup as unavailable', async () => {
            getAccountsSpy.mockRejectedValue(new Error('timeout'));

            const result =
                await workspaceAccountInfoUtils.resolveAccount(accountId);

            expect(result).toEqual({
                accountInfo: undefined,
                accountState: WorkspaceAccountState.UNAVAILABLE,
            });
        });
    });

    describe('isValidAccountId', () => {
        it('accepts a supported network and an address in any casing', () => {
            expect(workspaceAccountInfoUtils.isValidAccountId(accountId)).toBe(
                true,
            );
            expect(
                workspaceAccountInfoUtils.isValidAccountId(
                    accountId.toLowerCase(),
                ),
            ).toBe(true);
        });

        it.each([
            { id: 'not-a-network-0x123', case: 'an unknown network' },
            {
                id: `${Network.ETHEREUM_SEPOLIA}-not-an-address`,
                case: 'a malformed address',
            },
            { id: 'garbage', case: 'an ID without a separator' },
        ])('rejects $case', ({ id }) => {
            expect(workspaceAccountInfoUtils.isValidAccountId(id)).toBe(false);
        });
    });

    describe('resolveAccountType', () => {
        const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;
        const resolveAccountSpy = jest.spyOn(
            workspaceAccountInfoUtils,
            'resolveAccount',
        );

        afterEach(() => {
            resolveAccountSpy.mockReset();
            notFoundMock.mockClear();
        });

        it.each([
            {
                type: WorkspaceAccountInfoType.DAO,
                expected: WorkspaceAccountType.DAO,
            },
            {
                type: WorkspaceAccountInfoType.SAFE,
                expected: WorkspaceAccountType.SAFE,
            },
        ])(
            'returns $expected for an available $type',
            async ({ type, expected }) => {
                resolveAccountSpy.mockResolvedValue({
                    accountInfo: buildInfo({ type }),
                    accountState:
                        type === WorkspaceAccountInfoType.DAO
                            ? WorkspaceAccountState.DAO
                            : WorkspaceAccountState.SAFE,
                });

                await expect(
                    workspaceAccountInfoUtils.resolveAccountType(accountId),
                ).resolves.toBe(expected);
                expect(resolveAccountSpy).toHaveBeenCalledWith(accountId);
            },
        );

        it('fails the route with notFound() for an address that is neither a DAO nor a Safe', async () => {
            resolveAccountSpy.mockResolvedValue({
                accountInfo: undefined,
                accountState: WorkspaceAccountState.NOT_FOUND,
            });

            await expect(
                workspaceAccountInfoUtils.resolveAccountType(accountId),
            ).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
            expect(notFoundMock).toHaveBeenCalled();
        });

        // The pages branch on the type, so an account the lookup cannot place must not reach them.
        it.each([
            {
                accountInfo: undefined,
                accountState: WorkspaceAccountState.UNAVAILABLE,
            },
            {
                accountInfo: buildInfo({
                    type: WorkspaceAccountInfoType.UNKNOWN,
                }),
                accountState: undefined,
            },
        ])(
            'throws when the lookup cannot place the account ($accountState)',
            async (lookup) => {
                resolveAccountSpy.mockResolvedValue(lookup);

                await expect(
                    workspaceAccountInfoUtils.resolveAccountType(accountId),
                ).rejects.toThrow('the account could not be verified');
                expect(notFoundMock).not.toHaveBeenCalled();
            },
        );
    });
});
