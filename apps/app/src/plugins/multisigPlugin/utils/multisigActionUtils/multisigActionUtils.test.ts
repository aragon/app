import { ProposalActionType } from '@/modules/governance/api/governanceService';
import { generateProposalAction } from '@/modules/governance/testUtils';
import { generateMultisigPluginSettings } from '../../testUtils';
import {
    type IMultisigActionChangeSettings,
    MultisigProposalActionType,
} from '../../types';
import { multisigSettingsUtils } from '../multisigSettingsUtils';
import { multisigActionUtils } from './multisigActionUtils';

describe('multisigActionUtils', () => {
    const parseSettingsSpy = jest.spyOn(multisigSettingsUtils, 'parseSettings');

    afterEach(() => {
        parseSettingsSpy.mockReset();
    });

    describe('normalizeChangeSettingsAction', () => {
        const t = jest.fn();

        const generateAction = (): IMultisigActionChangeSettings => ({
            ...generateProposalAction({ to: '0xPlugin', data: '0xdata' }),
            type: MultisigProposalActionType.UPDATE_MULTISIG_SETTINGS,
            existingSettings: generateMultisigPluginSettings({
                minApprovals: 2,
                onlyListed: false,
            }),
            proposedSettings: generateMultisigPluginSettings({
                minApprovals: 3,
            }),
        });

        it('returns an app change-settings action with the parsed existing and proposed settings', () => {
            const existingParsed = [
                { term: 'Minimum approval', definition: '2' },
            ];
            const proposedParsed = [
                { term: 'Minimum approval', definition: '3' },
            ];
            parseSettingsSpy
                .mockReturnValueOnce(existingParsed)
                .mockReturnValueOnce(proposedParsed);
            const action = generateAction();

            const result = multisigActionUtils.normalizeChangeSettingsAction({
                action,
                membersCount: 5,
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

        it('parses the existing settings and the proposed settings merged over them, with the members count', () => {
            parseSettingsSpy.mockReturnValue([]);
            const action = generateAction();

            multisigActionUtils.normalizeChangeSettingsAction({
                action,
                membersCount: 5,
                t,
            });

            expect(parseSettingsSpy).toHaveBeenNthCalledWith(1, {
                settings: action.existingSettings,
                membersCount: 5,
                t,
            });
            expect(parseSettingsSpy).toHaveBeenNthCalledWith(2, {
                settings: {
                    ...action.existingSettings,
                    ...action.proposedSettings,
                },
                membersCount: 5,
                t,
            });
        });
    });
});
