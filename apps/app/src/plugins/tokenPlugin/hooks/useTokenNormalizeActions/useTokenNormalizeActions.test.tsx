import { renderHook } from '@testing-library/react';
import { generateProposalAction } from '@/modules/governance/testUtils';
import { generateTokenPluginSettings } from '@/plugins/tokenPlugin/testUtils';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { generateDaoPlugin } from '@/shared/testUtils';
import { mockTranslations } from '@/test/utils';
import { TokenProposalActionType } from '../../types/enum';
import { tokenActionUtils } from '../../utils/tokenActionUtils';
import { useTokenNormalizeActions } from './useTokenNormalizeActions';

jest.mock('@/shared/hooks/useDaoPlugins', () => ({
    useDaoPlugins: jest.fn(),
}));

describe('useTokenNormalizeActions hook', () => {
    const useDaoPluginsMock = jest.mocked(useDaoPlugins);
    const normalizeChangeSettingsSpy = jest.spyOn(
        tokenActionUtils,
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
            type: TokenProposalActionType.UPDATE_VOTE_SETTINGS,
        });

    const pluginAddress = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

    it('normalizes a change-settings action when its target plugin resolves', () => {
        const settings = generateTokenPluginSettings();
        const plugin = generateDaoPlugin({ address: pluginAddress, settings });
        const action = generateChangeSettingsAction(pluginAddress);
        const normalized = { normalized: true };

        useDaoPluginsMock.mockReturnValue([{ meta: plugin }] as never);
        normalizeChangeSettingsSpy.mockReturnValue(normalized as never);

        const { result } = renderHook(() =>
            useTokenNormalizeActions({ actions: [action], daoId: 'test' }),
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
            useTokenNormalizeActions({ actions: [action], daoId: 'test' }),
        );

        expect(normalizeChangeSettingsSpy).not.toHaveBeenCalled();
        expect(result.current).toEqual([action]);
    });

    it('passes through actions that are neither mint nor change-settings', () => {
        const action = generateProposalAction({ type: 'custom-action' });
        useDaoPluginsMock.mockReturnValue([] as never);

        const { result } = renderHook(() =>
            useTokenNormalizeActions({ actions: [action], daoId: 'test' }),
        );

        expect(result.current).toEqual([action]);
    });
});
