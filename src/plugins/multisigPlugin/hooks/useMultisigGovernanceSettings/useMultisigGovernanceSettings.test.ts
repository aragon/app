import { generateMember } from '@/modules/governance/testUtils';
import { generateMultisigPluginSettings } from '@/plugins/multisigPlugin/testUtils';
import { multisigSettingsUtils } from '@/plugins/multisigPlugin/utils/multisigSettingsUtils';
import * as usePluginSettings from '@/shared/hooks/usePluginSettings';
import {
    generatePaginatedResponse,
    generateReactQueryInfiniteResultError,
    generateReactQueryInfiniteResultSuccess,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import { mockTranslations } from '@/test/utils';
import { renderHook } from '@testing-library/react';
import * as governanceService from '../../../../modules/governance/api/governanceService';
import { useMultisigGovernanceSettings } from './useMultisigGovernanceSettings';

// Needed to spy on useMemberList hook
jest.mock('../../../../modules/governance/api/governanceService', () => ({
    __esModule: true,
    ...jest.requireActual('../../../../modules/governance/api/governanceService'),
}));

describe('useMultisigGovernanceSettings', () => {
    const usePluginSettingsSpy = jest.spyOn(usePluginSettings, 'usePluginSettings');
    const useMemberListSpy = jest.spyOn(governanceService, 'useMemberList');
    const parseSettingsSpy = jest.spyOn(multisigSettingsUtils, 'parseSettings');

    beforeEach(() => {
        usePluginSettingsSpy.mockReturnValue(generateMultisigPluginSettings());
        useMemberListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({
                data: { pages: [generatePaginatedResponse({ data: [generateMember()] })], pageParams: [] },
            }),
        );
    });

    afterEach(() => {
        usePluginSettingsSpy.mockReset();
        useMemberListSpy.mockReset();
        parseSettingsSpy.mockReset();
    });

    it('returns empty array when settings are not passed and data is not returned', () => {
        usePluginSettingsSpy.mockReturnValue(undefined);
        useMemberListSpy.mockReturnValue(generateReactQueryInfiniteResultError({ error: new Error() }));

        const { result } = renderHook(() => useMultisigGovernanceSettings({ daoId: 'multisig-test-id' }), {
            wrapper: ReactQueryWrapper,
        });

        expect(result.current).toEqual([]);
        expect(parseSettingsSpy).not.toHaveBeenCalled();
    });

    it('retrieves plugin settings correctly', () => {
        const mockSettings = generateMultisigPluginSettings();
        usePluginSettingsSpy.mockReturnValue(mockSettings);

        const { result } = renderHook(() => useMultisigGovernanceSettings({ daoId: 'multisig-test-id' }), {
            wrapper: ReactQueryWrapper,
        });

        expect(usePluginSettingsSpy).toHaveBeenCalledWith({ daoId: 'multisig-test-id' });
        expect(parseSettingsSpy).toHaveBeenCalledWith({
            settings: mockSettings,
            membersCount: expect.any(Number),
            t: mockTranslations.tMock,
        });
        expect(result.current).toEqual(parseSettingsSpy.mock.results[0].value);
    });
});
