import { renderHook } from '@testing-library/react';
import { generateProposalAction } from '@/modules/governance/testUtils';
import { generateLockToVotePluginSettings } from '@/plugins/lockToVotePlugin/testUtils/generators/lockToVotePluginSettings';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { generateDaoPlugin } from '@/shared/testUtils';
import { mockTranslations } from '@/test/utils';
import { LockToVoteProposalActionType } from '../../types/enum';
import { lockToVoteActionUtils } from '../../utils/lockToVoteActionUtils';
import { useLockToVoteNormalizeActions } from './useLockToVoteNormalizeActions';

jest.mock('@/shared/hooks/useDaoPlugins', () => ({
    useDaoPlugins: jest.fn(),
}));

describe('useLockToVoteNormalizeActions hook', () => {
    const useDaoPluginsMock = jest.mocked(useDaoPlugins);
    const normalizeChangeSettingsSpy = jest.spyOn(
        lockToVoteActionUtils,
        'normalizeChangeSettingsAction',
    );

    mockTranslations.setup();

    afterEach(() => {
        useDaoPluginsMock.mockReset();
        normalizeChangeSettingsSpy.mockReset();
    });

    const generateChangeSettingsAction = (to: string) =>
        generateProposalAction({
            to,
            type: LockToVoteProposalActionType.UPDATE_VOTE_SETTINGS,
        });

    const pluginAddress = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

    it('normalizes a change-settings action when its target plugin resolves', () => {
        const settings = generateLockToVotePluginSettings();
        const plugin = generateDaoPlugin({ address: pluginAddress, settings });
        const action = generateChangeSettingsAction(pluginAddress);
        const normalized = { normalized: true };

        useDaoPluginsMock.mockReturnValue([{ meta: plugin }] as never);
        normalizeChangeSettingsSpy.mockReturnValue(normalized as never);

        const { result } = renderHook(() =>
            useLockToVoteNormalizeActions({ actions: [action], daoId: 'test' }),
        );

        expect(normalizeChangeSettingsSpy).toHaveBeenCalledWith(
            expect.objectContaining({ action, token: settings.token }),
        );
        expect(result.current).toEqual([normalized]);
    });

    it('returns the raw action without crashing when the target plugin is hidden or missing', () => {
        const action = generateChangeSettingsAction(pluginAddress);

        // Hidden / uninstalled / external target → plugin lookup returns nothing.
        useDaoPluginsMock.mockReturnValue([] as never);

        const { result } = renderHook(() =>
            useLockToVoteNormalizeActions({ actions: [action], daoId: 'test' }),
        );

        expect(normalizeChangeSettingsSpy).not.toHaveBeenCalled();
        expect(result.current).toEqual([action]);
    });
});
