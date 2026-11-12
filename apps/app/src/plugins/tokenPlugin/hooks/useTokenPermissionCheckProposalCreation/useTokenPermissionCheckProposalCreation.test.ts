import { renderHook } from '@testing-library/react';
import * as walletAccountApi from '@/modules/application/hooks/useWalletAccount';
import * as governanceService from '@/modules/governance/api/governanceService';
import * as canCreateProposalApi from '@/modules/governance/api/governanceService/queries/useCanCreateProposal';
import * as daoService from '@/shared/api/daoService';
import {
    generateDao,
    generateDaoPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import {
    generateTokenMember,
    generateTokenPluginSettings,
    generateTokenPluginSettingsEscrowSettings,
} from '../../testUtils';
import type { ITokenPluginSettings } from '../../types';
import * as useWrappedTokenBalanceModule from '../useWrappedTokenBalance';
import { useTokenPermissionCheckProposalCreation } from './useTokenPermissionCheckProposalCreation';

describe('useTokenPermissionCheckProposalCreation hook', () => {
    const useWalletAccountSpy = jest.spyOn(
        walletAccountApi,
        'useWalletAccount',
    );
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useMemberSpy = jest.spyOn(governanceService, 'useMember');
    const useCanCreateProposalSpy = jest.spyOn(
        canCreateProposalApi,
        'useCanCreateProposal',
    );
    const useWrappedTokenBalanceSpy = jest.spyOn(
        useWrappedTokenBalanceModule,
        'useWrappedTokenBalance',
    );

    const translationPrefix =
        'app.plugins.token.tokenPermissionCheckProposalCreation';

    beforeEach(() => {
        useWalletAccountSpy.mockReturnValue({ address: '0x123' } as never);
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
        useMemberSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateTokenMember() }),
        );
        useCanCreateProposalSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: { status: true } }),
        );
        useWrappedTokenBalanceSpy.mockReturnValue({
            balance: BigInt(0),
            refetch: jest.fn(),
        });
    });

    afterEach(() => {
        useWalletAccountSpy.mockReset();
        useDaoSpy.mockReset();
        useMemberSpy.mockReset();
        useCanCreateProposalSpy.mockReset();
        useWrappedTokenBalanceSpy.mockReset();
    });

    const renderTerms = (settings?: Partial<ITokenPluginSettings>) => {
        const plugin = generateDaoPlugin({
            settings: generateTokenPluginSettings(settings),
        });
        const { result } = renderHook(() =>
            useTokenPermissionCheckProposalCreation({ plugin, daoId: '1' }),
        );

        return result.current.settings[0].map(({ term }) => term);
    };

    it('lists the voting power and token balance of the connected user', () => {
        expect(renderTerms()).toEqual([
            `${translationPrefix}.pluginNameLabel`,
            `${translationPrefix}.function`,
            `${translationPrefix}.userVotingPower`,
            `${translationPrefix}.userTokenBalance`,
        ]);
    });

    it('omits the token balance for a voting-escrow plugin', () => {
        const votingEscrow = generateTokenPluginSettingsEscrowSettings();

        expect(renderTerms({ votingEscrow })).toEqual([
            `${translationPrefix}.pluginNameLabel`,
            `${translationPrefix}.function`,
            `${translationPrefix}.userVotingPower`,
        ]);
        expect(useWrappedTokenBalanceSpy).toHaveBeenCalledWith(
            expect.objectContaining({ enabled: false }),
        );
    });
});
