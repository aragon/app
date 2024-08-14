import { generateMember } from '@/modules/governance/testUtils';
import { generateDaoMultisigSettings } from '@/plugins/multisigPlugin/testUtils';
import { multisigSettingsUtils } from '@/plugins/multisigPlugin/utils/multisigSettingsUtils';
import * as daoService from '@/shared/api/daoService';
import {
    generatePaginatedResponse,
    generateReactQueryInfiniteResultError,
    generateReactQueryInfiniteResultSuccess,
    generateReactQueryResultError,
    generateReactQueryResultSuccess,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import { mockTranslations } from '@/test/utils';
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
    const parseSettingsSpy = jest.spyOn(multisigSettingsUtils, 'parseSettings');

    beforeEach(() => {
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDaoMultisigSettings() }));
        useMemberListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({
                data: { pages: [generatePaginatedResponse({ data: [generateMember()] })], pageParams: [] },
            }),
        );
    });

    afterEach(() => {
        useDaoSettingsSpy.mockReset();
        useMemberListSpy.mockReset();
        parseSettingsSpy.mockReset();
    });

    it('returns empty array when settings are not passed and data is not returned', () => {
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultError({ error: new Error() }));
        useMemberListSpy.mockReturnValue(generateReactQueryInfiniteResultError({ error: new Error() }));

        const { result } = renderHook(() => useMultisigGovernanceSettings({ daoId: 'multisig-test-id' }), {
            wrapper: ReactQueryWrapper,
        });

        expect(result.current).toEqual([]);
        expect(parseSettingsSpy).not.toHaveBeenCalled();
    });

    it('does not fetch when settings object passed directly to the hook and calls parseSettings', () => {
        const mockSettings = generateDaoMultisigSettings();
        const mockParsedSettings = [{ term: 'mockTerm', definition: 'mockDefinition' }];
        parseSettingsSpy.mockReturnValue(mockParsedSettings);

        const { result } = renderHook(() =>
            useMultisigGovernanceSettings({ daoId: 'multisig-test-id', settings: mockSettings }),
        );

        expect(useDaoSettingsSpy).toHaveBeenCalledWith(
            { urlParams: { daoId: 'multisig-test-id' } },
            expect.objectContaining({ enabled: false }),
        );
        expect(parseSettingsSpy).toHaveBeenCalledWith({
            settings: mockSettings,
            membersCount: expect.any(Number),
            t: mockTranslations.tMock,
        });
        expect(result.current).toEqual(mockParsedSettings);
    });

    it('fetches settings when no settings object is passed and calls parseSettings', () => {
        const mockSettings = generateDaoMultisigSettings();
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: mockSettings }));

        const { result } = renderHook(() => useMultisigGovernanceSettings({ daoId: 'multisig-test-id' }), {
            wrapper: ReactQueryWrapper,
        });

        expect(useDaoSettingsSpy).toHaveBeenCalledWith(
            { urlParams: { daoId: 'multisig-test-id' } },
            expect.objectContaining({ enabled: true }),
        );
        expect(parseSettingsSpy).toHaveBeenCalledWith({
            settings: mockSettings,
            membersCount: expect.any(Number),
            t: mockTranslations.tMock,
        });
        expect(result.current).toEqual(parseSettingsSpy.mock.results[0].value);
    });
});
