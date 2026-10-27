import { renderHook } from '@testing-library/react';
import * as walletAccountApi from '@/modules/application/hooks/useWalletAccount';
import { generateSppProposal } from '@/plugins/sppPlugin/testUtils';
import { Network } from '@/shared/api/daoService';
import * as safeServiceApi from '@/shared/api/safeService';
import { generateDaoPlugin } from '@/shared/testUtils';
import { generateSafeInfo } from '../../testUtils';
import { useSafeMultisigVotePermissionCheck } from './useSafeMultisigVotePermissionCheck';

describe('useSafeMultisigVotePermissionCheck hook', () => {
    const owner = '0x0000000000000000000000000000000000000001';
    const stranger = '0x0000000000000000000000000000000000000099';

    const useSafeInfoSpy = jest.spyOn(safeServiceApi, 'useSafeInfo');
    const useWalletAccountSpy = jest.spyOn(
        walletAccountApi,
        'useWalletAccount',
    );

    const mockConnected = (address?: string) =>
        useWalletAccountSpy.mockReturnValue({ address } as never);

    beforeEach(() => {
        useSafeInfoSpy.mockReturnValue({
            data: generateSafeInfo({ owners: [owner] }),
            isLoading: false,
        } as unknown as ReturnType<typeof safeServiceApi.useSafeInfo>);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const renderCheck = () =>
        renderHook(() =>
            useSafeMultisigVotePermissionCheck({
                plugin: generateDaoPlugin({
                    address: '0x0000000000000000000000000000000000000002',
                }),
                daoId: `${Network.ETHEREUM_SEPOLIA}-0x0000000000000000000000000000000000000003`,
                proposal: generateSppProposal({
                    network: Network.ETHEREUM_SEPOLIA,
                }),
            }),
        );

    it('permits an owner of the Safe as the Safe reports its owners now', () => {
        mockConnected(owner);

        expect(renderCheck().result.current.hasPermission).toBeTruthy();
    });

    // Owners and threshold change while a report sits in the queue, so the answer has to come from
    // live account data rather than anything captured when the proposal was created.
    it('refuses a wallet the Safe does not list, and says why', () => {
        mockConnected(stranger);

        const { hasPermission, settings, isRestricted } =
            renderCheck().result.current;

        expect(hasPermission).toBeFalsy();
        expect(isRestricted).toBeTruthy();
        expect(settings[0][0].definition).toMatch(
            'safeMultisigVotePermissionCheck.ownerOnly',
        );
    });

    it('refuses a disconnected viewer rather than reading an absent address as an owner', () => {
        mockConnected(undefined);

        expect(renderCheck().result.current.hasPermission).toBeFalsy();
    });
});
