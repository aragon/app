import { generateMember } from '@/modules/governance/testUtils';
import { generateDaoMultisigSettings } from '@/plugins/multisigPlugin/testUtils';
import * as daoService from '@/shared/api/daoService';
import {
    generatePaginatedResponse,
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultSuccess,
    generateReactQueryResultError,
    generateReactQueryResultSuccess,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import { renderHook } from '@testing-library/react';
import * as governanceService from '../../../../modules/governance/api/governanceService';
import { useMultisigGovernanceSettings } from './useMultisigGovernanceSettings';

// Needed to spy usage of useMemberList hook
jest.mock('../../../../modules/governance/api/governanceService', () => ({
    __esModule: true,
    ...jest.requireActual('../../../../modules/governance/api/governanceService'),
}));

describe('useMultisigGovernanceSettings', () => {
    const useDaoSettingsSpy = jest.spyOn(daoService, 'useDaoSettings');
    const useMemberListSpy = jest.spyOn(governanceService, 'useMemberList');

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
        const baseSettings = generateDaoMultisigSettings();
        const mockSettings = {
            ...baseSettings,
            settings: {
                minApprovals: 1,
                ...baseSettings,
            },
        };
        const members = [generateMember({ address: '0x123' })];
        const membersMetadata = generatePaginatedResponseMetadata({
            pageSize: 20,
            totalRecords: members.length,
        });
        const membersResponse = generatePaginatedResponse({ data: members, metadata: membersMetadata });

        useMemberListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({ data: { pages: [membersResponse], pageParams: [] } }),
        );
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: mockSettings }));

        const { result } = renderHook(() => useMultisigGovernanceSettings({ daoId: 'multisig-test-id' }), {
            wrapper: ReactQueryWrapper,
        });

        expect(useDaoSettingsSpy).toHaveBeenCalledWith(
            { urlParams: { daoId: 'multisig-test-id' } },
            expect.objectContaining({ enabled: true }),
        );

        const [minimumApproval, proposalCreation] = result.current;
        expect(minimumApproval.term).toBe('app.plugins.multisig.multisigGovernanceSettings.minimumApproval');
        expect(minimumApproval.definition).toBe(
            'app.plugins.multisig.multisigGovernanceSettings.approvals (min=1,max=1)',
        );
        expect(proposalCreation.term).toBe('app.plugins.multisig.multisigGovernanceSettings.proposalCreation');
        expect(proposalCreation.definition).toBe('app.plugins.multisig.multisigGovernanceSettings.anyWallet');
    });

    it('handles settings being passed directly to the hook', async () => {
        const baseSettings = generateDaoMultisigSettings();
        const mockSettings = {
            ...baseSettings,
            settings: {
                ...baseSettings.settings,
                minApprovals: 1,
            },
        };

        const members = [generateMember({ address: '0x123' })];
        const membersMetadata = generatePaginatedResponseMetadata({
            pageSize: 20,
            totalRecords: members.length,
        });
        const membersResponse = generatePaginatedResponse({ data: members, metadata: membersMetadata });

        useMemberListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({ data: { pages: [membersResponse], pageParams: [] } }),
        );

        const { result } = renderHook(
            () => useMultisigGovernanceSettings({ daoId: 'multisig-test-id', settings: mockSettings }),
            { wrapper: ReactQueryWrapper },
        );

        expect(useDaoSettingsSpy).toHaveBeenCalledWith(
            { urlParams: { daoId: 'multisig-test-id' } },
            expect.objectContaining({ enabled: false }),
        );

        const [minimumApproval, proposalCreation] = result.current;
        expect(minimumApproval.term).toBe('app.plugins.multisig.multisigGovernanceSettings.minimumApproval');
        expect(minimumApproval.definition).toBe(
            'app.plugins.multisig.multisigGovernanceSettings.approvals (min=1,max=1)',
        );
        expect(proposalCreation.term).toBe('app.plugins.multisig.multisigGovernanceSettings.proposalCreation');
        expect(proposalCreation.definition).toBe('app.plugins.multisig.multisigGovernanceSettings.anyWallet');
    });

    it('correctly handles only members', () => {
        const baseSettings = generateDaoMultisigSettings();
        const mockSettings = {
            ...baseSettings,
            settings: {
                ...baseSettings.settings,
                onlyListed: true,
            },
        };

        const members = [generateMember({ address: '0x123' })];
        const membersMetadata = generatePaginatedResponseMetadata({
            pageSize: 20,
            totalRecords: members.length,
        });
        const membersResponse = generatePaginatedResponse({ data: members, metadata: membersMetadata });

        useMemberListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({ data: { pages: [membersResponse], pageParams: [] } }),
        );

        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: mockSettings }));
        const { result } = renderHook(() => useMultisigGovernanceSettings({ daoId: 'multisig-test-id' }), {
            wrapper: ReactQueryWrapper,
        });

        const [, proposalCreation] = result.current;

        expect(proposalCreation.definition).toBe('app.plugins.multisig.multisigGovernanceSettings.members');
    });

    it('Renders the correct total members of the DAO', async () => {
        const baseSettings = generateDaoMultisigSettings();
        const mockSettings = {
            ...baseSettings,
            settings: {
                ...baseSettings.settings,
                minApprovals: 3,
            },
        };

        const members = [
            generateMember({ address: '0x123' }),
            generateMember({ address: '0x123' }),
            generateMember({ address: '0x123' }),
            generateMember({ address: '0x123' }),
            generateMember({ address: '0x123' }),
        ];
        const membersMetadata = generatePaginatedResponseMetadata({
            pageSize: 20,
            totalRecords: members.length,
        });
        const membersResponse = generatePaginatedResponse({ data: members, metadata: membersMetadata });

        useMemberListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({ data: { pages: [membersResponse], pageParams: [] } }),
        );

        const { result } = renderHook(
            () => useMultisigGovernanceSettings({ daoId: 'multisig-test-id', settings: mockSettings }),
            { wrapper: ReactQueryWrapper },
        );

        const [minimumApproval] = result.current;
        expect(minimumApproval.definition).toBe(
            `app.plugins.multisig.multisigGovernanceSettings.approvals (min=3,max=5)`,
        );
    });
});
