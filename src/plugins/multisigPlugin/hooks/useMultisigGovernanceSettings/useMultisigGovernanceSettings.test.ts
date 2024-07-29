import { governanceService, useMemberList } from '@/modules/governance/api/governanceService';
import { generateMember } from '@/modules/governance/testUtils';
import { generateDaoMultisigSettings } from '@/plugins/multisigPlugin/testUtils';
import * as daoService from '@/shared/api/daoService';
import {
    generatePaginatedResponse,
    generateReactQueryResultError,
    generateReactQueryResultSuccess,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { useMultisigGovernanceSettings } from './useMultisigGovernanceSettings';

describe('useMultisigGovernanceSettings', () => {
    const useDaoSettingsSpy = jest.spyOn(daoService, 'useDaoSettings');
    const useMemberListSpy = jest.spyOn(governanceService, 'getMemberList');
    beforeEach(() => {
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDaoMultisigSettings() }));
    });

    afterEach(() => {
        useDaoSettingsSpy.mockReset();
        useMemberListSpy.mockReset();
    });

    it('returns empty array when daoSettings is null', () => {
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultError({ error: new Error() }));
        const { result } = renderHook(() => useMultisigGovernanceSettings({ daoId: 'multisig-test-id' }), {
            wrapper: ReactQueryWrapper,
        });
        expect(result.current).toEqual([]);
    });

    it('fetches the specified DAO terms and definitions for multisig Dao', async () => {
        const mockSettings = generateDaoMultisigSettings();
        const membersResult = generatePaginatedResponse({ data: [generateMember()] });
        const mockMembers = {
            ...membersResult,
            metadata: {
                ...membersResult.metadata,
                totalRecords: 3,
            },
        };

        useMemberListSpy.mockResolvedValue(mockMembers);
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: mockSettings }));

        const { result: membersHookResult } = renderHook(
            () => useMemberList({ queryParams: { daoId: 'multisig-test-id' } }),
            {
                wrapper: ReactQueryWrapper,
            },
        );
        const { result } = renderHook(() => useMultisigGovernanceSettings({ daoId: 'multisig-test-id' }), {
            wrapper: ReactQueryWrapper,
        });

        await waitFor(() => {
            expect(membersHookResult.current.data?.pages[0].metadata.totalRecords).toBe(
                mockMembers.metadata.totalRecords,
            );
        });

        expect(useDaoSettingsSpy).toHaveBeenCalledWith(
            { urlParams: { daoId: 'multisig-test-id' } },
            expect.objectContaining({ enabled: true }),
        );

        const [minimumApproval, proposalCreation] = result.current;
        expect(minimumApproval.term).toBe('app.plugins.multisig.multisigGovernanceSettings.minimumApproval');
        expect(minimumApproval.definition).toBe(
            `app.plugins.multisig.multisigGovernanceSettings.approvals (min=2,max=${mockMembers.metadata.totalRecords})`,
        );
        expect(proposalCreation.term).toBe('app.plugins.multisig.multisigGovernanceSettings.proposalCreation');
        expect(proposalCreation.definition).toBe('app.plugins.multisig.multisigGovernanceSettings.anyWallet');
    });

    it('handles settings being passed directly to the hook', async () => {
        const mockSettings = generateDaoMultisigSettings();
        const membersResult = generatePaginatedResponse({ data: [generateMember()] });
        const mockMembers = {
            ...membersResult,
            metadata: {
                ...membersResult.metadata,
                totalRecords: 5,
            },
        };

        useMemberListSpy.mockResolvedValue(mockMembers);

        const { result: membersHookResult } = renderHook(
            () => useMemberList({ queryParams: { daoId: 'multisig-test-id' } }),
            {
                wrapper: ReactQueryWrapper,
            },
        );

        const { result } = renderHook(
            () => useMultisigGovernanceSettings({ daoId: 'multisig-test-id', settings: mockSettings }),
            { wrapper: ReactQueryWrapper },
        );

        await waitFor(() => {
            expect(membersHookResult.current.data?.pages[0].metadata.totalRecords).toBe(
                mockMembers.metadata.totalRecords,
            );
        });

        expect(useDaoSettingsSpy).toHaveBeenCalledWith(
            { urlParams: { daoId: 'multisig-test-id' } },
            expect.objectContaining({ enabled: false }),
        );

        const [minimumApproval, proposalCreation] = result.current;
        expect(minimumApproval.term).toBe('app.plugins.multisig.multisigGovernanceSettings.minimumApproval');
        expect(minimumApproval.definition).toBe(
            `app.plugins.multisig.multisigGovernanceSettings.approvals (min=2,max=${mockMembers.metadata.totalRecords})`,
        );
        expect(proposalCreation.term).toBe('app.plugins.multisig.multisigGovernanceSettings.proposalCreation');
        expect(proposalCreation.definition).toBe('app.plugins.multisig.multisigGovernanceSettings.anyWallet');
    });

    it('correctly correctly handles only members', () => {
        const baseSettings = generateDaoMultisigSettings();
        const mockSettings = {
            ...baseSettings,
            settings: {
                ...baseSettings.settings,
                onlyListed: true,
            },
        };

        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: mockSettings }));
        const { result } = renderHook(() => useMultisigGovernanceSettings({ daoId: 'multisig-test-id' }), {
            wrapper: ReactQueryWrapper,
        });

        const [, proposalCreation] = result.current;

        expect(proposalCreation.definition).toBe('app.plugins.multisig.multisigGovernanceSettings.members');
    });

    it('Renders the correct total members of the DAO', async () => {
        const params = { daoId: 'dao-id-test' };
        const membersResult = generatePaginatedResponse({ data: [generateMember()] });
        useMemberListSpy.mockResolvedValue(membersResult);
        const { result } = renderHook(() => useMemberList({ queryParams: params }), { wrapper: ReactQueryWrapper });
        await waitFor(() =>
            expect(result.current.data?.pages[0].metadata.totalRecords).toEqual(membersResult.metadata.totalRecords),
        );
    });
});
