import { generateMember } from '@/modules/governance/testUtils';
import { generateDaoMultisigSettings } from '@/plugins/multisigPlugin/testUtils';
import * as daoService from '@/shared/api/daoService';
import {
    generatePaginatedResponse,
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultError,
    generateReactQueryInfiniteResultSuccess,
    generateReactQueryResultError,
    generateReactQueryResultSuccess,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import { renderHook } from '@testing-library/react';
import * as governanceService from '../../../../modules/governance/api/governanceService';
import { useMultisigGovernanceSettings } from './useMultisigGovernanceSettings';

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

    it('returns empty array when dao members are null', () => {
        useMemberListSpy.mockReturnValue(generateReactQueryInfiniteResultError({ error: new Error() }));
        const { result } = renderHook(() => useMultisigGovernanceSettings({ daoId: 'multisig-test-id' }), {
            wrapper: ReactQueryWrapper,
        });
        expect(result.current).toEqual([]);
    });

    it('correctly handles different approval modes', () => {
        const baseSettings = generateDaoMultisigSettings();
        const mockSettings = { ...baseSettings, settings: { ...baseSettings.settings, minApprovals: 3 } };

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

        expect(result.current.length).toBeGreaterThan(0);
    });
});
