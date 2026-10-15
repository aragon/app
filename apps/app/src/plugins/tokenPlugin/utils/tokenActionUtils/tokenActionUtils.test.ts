import { ProposalActionType } from '@/modules/governance/api/governanceService';
import { generateProposalAction } from '@/modules/governance/testUtils';
import {
    generateTokenPluginSettings,
    generateTokenPluginSettingsToken,
} from '../../testUtils';
import {
    type ITokenActionChangeSettings,
    TokenProposalActionType,
} from '../../types';
import { tokenSettingsUtils } from '../tokenSettingsUtils';
import { tokenActionUtils } from './tokenActionUtils';

describe('tokenActionUtils', () => {
    const parseSettingsSpy = jest.spyOn(tokenSettingsUtils, 'parseSettings');

    afterEach(() => {
        parseSettingsSpy.mockReset();
    });

    describe('normalizeChangeSettingsAction', () => {
        const t = jest.fn();
        const token = generateTokenPluginSettingsToken({ symbol: 'PDC' });

        const generateAction = (): ITokenActionChangeSettings => {
            const { token: _existingToken, ...existingSettings } =
                generateTokenPluginSettings({ supportThreshold: 50 });
            const { token: _proposedToken, ...proposedSettings } =
                generateTokenPluginSettings({ supportThreshold: 60 });

            return {
                ...generateProposalAction({ to: '0xPlugin', data: '0xdata' }),
                type: TokenProposalActionType.UPDATE_VOTE_SETTINGS,
                existingSettings,
                proposedSettings,
            };
        };

        it('returns an app change-settings action with the parsed existing and proposed settings', () => {
            const existingParsed = [
                { term: 'Support threshold', definition: '50%' },
            ];
            const proposedParsed = [
                { term: 'Support threshold', definition: '60%' },
            ];
            parseSettingsSpy
                .mockReturnValueOnce(existingParsed)
                .mockReturnValueOnce(proposedParsed);
            const action = generateAction();

            const result = tokenActionUtils.normalizeChangeSettingsAction({
                action,
                token,
                t,
            });

            expect(result).toEqual({
                from: action.from,
                to: action.to,
                data: action.data,
                value: action.value,
                inputData: action.inputData,
                type: ProposalActionType.CHANGE_SETTINGS,
                existingSettings: existingParsed,
                proposedSettings: proposedParsed,
            });
        });

        it('parses both sides with the plugin token, the proposed settings merged over the existing ones', () => {
            parseSettingsSpy.mockReturnValue([]);
            const action = generateAction();

            tokenActionUtils.normalizeChangeSettingsAction({
                action,
                token,
                t,
            });

            expect(parseSettingsSpy).toHaveBeenNthCalledWith(1, {
                settings: { ...action.existingSettings, token },
                t,
            });
            expect(parseSettingsSpy).toHaveBeenNthCalledWith(2, {
                settings: {
                    ...action.existingSettings,
                    token,
                    ...action.proposedSettings,
                },
                t,
            });
        });
    });
});
