import { generateMultisigPluginSettings } from '@/plugins/multisigPlugin/testUtils';
import { multisigSettingsUtils } from '@/plugins/multisigPlugin/utils/multisigSettingsUtils';
import {
    generatePaginatedResponse,
    generateReactQueryInfiniteResultSuccess,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import { mockTranslations } from '@/test/utils';
import { renderHook } from '@testing-library/react';
import * as governanceService from '../../../../modules/governance/api/governanceService';
import { useMultisigGovernanceSettings } from './useMultisigGovernanceSettings';

describe('useMultisigGovernanceSettings', () => {
    const useMemberListSpy = jest.spyOn(governanceService, 'useMemberList');
    const parseSettingsSpy = jest.spyOn(multisigSettingsUtils, 'parseSettings');

    beforeEach(() => {
        const defaultMemberResult = { data: { pages: [generatePaginatedResponse({ data: [] })], pageParams: [] } };
        useMemberListSpy.mockReturnValue(generateReactQueryInfiniteResultSuccess(defaultMemberResult));
    });

    afterEach(() => {
        useMemberListSpy.mockReset();
        parseSettingsSpy.mockReset();
    });

    it('returns the parsed multisig governance settings', () => {
        const membersCount = 5;
        const mockSettings = generateMultisigPluginSettings();
        const mockParsedSettings = [{ term: 'mockTerm', definition: 'mockDefinition' }];
        parseSettingsSpy.mockReturnValue(mockParsedSettings);

        const membersMetadata = { totalRecords: membersCount, page: 0, pageSize: 20, totalPages: 2 };
        const membersResult = {
            data: { pages: [generatePaginatedResponse({ data: [], metadata: membersMetadata })], pageParams: [] },
        };
        useMemberListSpy.mockReturnValue(generateReactQueryInfiniteResultSuccess(membersResult));

        const params = { daoId: 'multisig-test-id', pluginAddress: '0x123', settings: mockSettings };
        const { result } = renderHook(() => useMultisigGovernanceSettings(params), { wrapper: ReactQueryWrapper });

        expect(parseSettingsSpy).toHaveBeenCalledWith({
            settings: mockSettings,
            membersCount,
            t: mockTranslations.tMock,
        });
        expect(result.current).toEqual(mockParsedSettings);
    });
});
