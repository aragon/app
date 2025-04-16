import { generateCreateProcessFormBody } from '@/modules/createDao/testUtils';
import {
    generateCreateProposalEndDateFormData,
    generateCreateProposalStartDateFormData,
    generateProposalCreate,
} from '@/modules/governance/testUtils';
import { createProposalUtils } from '@/modules/governance/utils/createProposalUtils';
import { multisigPlugin } from '@/plugins/multisigPlugin/constants/multisigPlugin';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import { DateTime } from 'luxon';
import * as Viem from 'viem';
import { timeUtils } from '../../../../test/utils';
import { generateMultisigPluginSettings } from '../../testUtils';
import { multisigPluginAbi, multisigPluginSetupAbi } from './multisigPluginAbi';
import { multisigTransactionUtils } from './multisigTransactionUtils';

describe('multisigTransaction utils', () => {
    const encodeFunctionDataSpy = jest.spyOn(Viem, 'encodeFunctionData');
    const encodeAbiParametersSpy = jest.spyOn(Viem, 'encodeAbiParameters');
    const parseStartDateSpy = jest.spyOn(createProposalUtils, 'parseStartDate');
    const parseEndDateSpy = jest.spyOn(createProposalUtils, 'parseEndDate');

    beforeEach(() => {
        encodeFunctionDataSpy.mockReturnValue('0x');
    });

    afterEach(() => {
        encodeFunctionDataSpy.mockReset();
        encodeAbiParametersSpy.mockReset();
        parseStartDateSpy.mockReset();
        parseEndDateSpy.mockReset();
    });

    describe('buildCreateProposalData', () => {
        it('correctly encodes the create-proposal data from the given parameters', () => {
            const startDate = 0;
            const endDate = 1728660603;
            const proposal = { ...generateProposalCreate(), ...generateCreateProposalEndDateFormData() };
            const actions: ITransactionRequest[] = [{ to: '0x123', data: '0x0', value: BigInt(0) }];
            const plugin = generateDaoPlugin({
                address: '0x123',
                subdomain: 'multisig',
                settings: generateMultisigPluginSettings(),
            });
            const params = { metadata: '0x' as const, actions: actions, proposal, plugin };
            parseStartDateSpy.mockReturnValue(startDate);
            parseEndDateSpy.mockReturnValue(endDate);

            multisigTransactionUtils.buildCreateProposalData(params);
            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: multisigPluginAbi,
                functionName: 'createProposal',
                args: [params.metadata, params.actions, BigInt(0), false, false, startDate, endDate],
            });
        });

        it('correctly sets default startDate and endDate when timing data not provided', () => {
            parseStartDateSpy.mockRestore();
            parseEndDateSpy.mockRestore();
            timeUtils.setTime('2025-04-16T09:30:00');
            const proposal = generateProposalCreate();
            const actions: ITransactionRequest[] = [{ to: '0x123', data: '0x0', value: BigInt(0) }];
            const plugin = generateDaoPlugin({
                address: '0x123',
                subdomain: 'multisig',
                settings: generateMultisigPluginSettings(),
            });
            const params = { metadata: '0x' as const, actions: actions, proposal, plugin };

            multisigTransactionUtils.buildCreateProposalData(params);

            // assert
            const sevenDaysFromNowInSeconds = DateTime.now().toSeconds() + 7 * 24 * 60 * 60;
            const encodeFunctionDataArgs = encodeFunctionDataSpy.mock.calls[0][0];
            const finalStartDate = encodeFunctionDataArgs.args![5];
            const finalEndDate = encodeFunctionDataArgs.args![6];

            expect(finalStartDate).toBe(0);
            expect(finalEndDate).toBe(sevenDaysFromNowInSeconds);
        });

        it('correctly sets startDate and endDate from provided timing data', () => {
            parseStartDateSpy.mockRestore();
            parseEndDateSpy.mockRestore();
            timeUtils.setTime('2025-04-16T09:30:00');
            const proposal = {
                ...generateProposalCreate(),
                ...generateCreateProposalStartDateFormData(),
                ...generateCreateProposalEndDateFormData(),
            };
            const actions: ITransactionRequest[] = [{ to: '0x123', data: '0x0', value: BigInt(0) }];
            const plugin = generateDaoPlugin({
                address: '0x123',
                subdomain: 'multisig',
                settings: generateMultisigPluginSettings(),
            });
            const params = { metadata: '0x' as const, actions: actions, proposal, plugin };

            multisigTransactionUtils.buildCreateProposalData(params);

            const twoDaysFromNowInSeconds = DateTime.now().toSeconds() + 2 * 24 * 60 * 60;
            const encodeFunctionDataArgs = encodeFunctionDataSpy.mock.calls[0][0];
            const finalStartDate = encodeFunctionDataArgs.args![5];
            const finalEndDate = encodeFunctionDataArgs.args![6];

            expect(finalStartDate).toBe(0);
            expect(finalEndDate).toBe(twoDaysFromNowInSeconds);
        });
    });

    describe('buildVoteData', () => {
        it('correctly encodes vote data with the given proposal index', () => {
            const proposalIndex = '3';
            multisigTransactionUtils.buildVoteData({ proposalIndex });
            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: multisigPluginAbi,
                functionName: 'approve',
                args: [proposalIndex, false],
            });
        });
    });

    describe('buildPrepareInstallData', () => {
        const buildPrepareInstallationDataSpy = jest.spyOn(pluginTransactionUtils, 'buildPrepareInstallationData');
        const getPluginTargetConfigSpy = jest.spyOn(pluginTransactionUtils, 'getPluginTargetConfig');

        afterEach(() => {
            buildPrepareInstallationDataSpy.mockReset();
        });

        type BuildDataParams = Parameters<typeof multisigTransactionUtils.buildPrepareInstallData>;

        it('encodes the plugin settings correctly using encodeAbiParameters', () => {
            const metadata = 'test-metadata';
            const members = [{ address: '0x1' }, { address: '0x2' }];
            const governance = { minApprovals: 3, onlyListed: true };
            const body = generateCreateProcessFormBody({ membership: { members }, governance });
            const dao = generateDao();

            const params = [{ metadata, body, dao }] as unknown as BuildDataParams;
            encodeAbiParametersSpy.mockReturnValue('0x');
            multisigTransactionUtils.buildPrepareInstallData(...params);

            const expectedMultisigTarget = { target: dao.address, operation: 0 };

            expect(encodeAbiParametersSpy).toHaveBeenCalledWith(multisigPluginSetupAbi, [
                members.map((member) => member.address),
                body.governance,
                expectedMultisigTarget,
                metadata,
            ]);
        });

        it('builds prepare installation data correctly using buildPrepareInstallationData', () => {
            const dao = generateDao({ address: '0x1' });
            const body = generateCreateProcessFormBody();
            const pluginSettingsData = '0xPluginSettingsData';
            const transactionData = '0xTransactionData';

            encodeAbiParametersSpy.mockReturnValue(pluginSettingsData);
            buildPrepareInstallationDataSpy.mockReturnValue(transactionData);

            const params = [{ metadata: '', body, dao }] as unknown as Parameters<
                typeof multisigTransactionUtils.buildPrepareInstallData
            >;

            const result = multisigTransactionUtils.buildPrepareInstallData(...params);

            expect(buildPrepareInstallationDataSpy).toHaveBeenCalledWith(
                multisigPlugin.repositoryAddresses[dao.network],
                multisigPlugin.installVersion,
                pluginSettingsData,
                dao.address,
            );

            expect(result).toBe(transactionData);
        });

        it('correctly builds the target config for advanced governance processes', () => {
            const stageVotingPeriod = { days: 1, hours: 4, minutes: 0 };
            const dao = generateDao();
            const body = generateCreateProcessFormBody();
            const params = [{ metadata: '', dao, body, stageVotingPeriod }] as unknown as BuildDataParams;
            multisigTransactionUtils.buildPrepareInstallData(...params);
            expect(getPluginTargetConfigSpy).toHaveBeenCalledWith(dao, true);
        });
    });
});
