import { generateCreateProcessFormBody, generateCreateProcessFormStage } from '@/modules/createDao/testUtils';
import { generateCreateProposalEndDateFormData, generateCreateProposalFormData } from '@/modules/governance/testUtils';
import { createProposalUtils } from '@/modules/governance/utils/createProposalUtils';
import { tokenPlugin } from '@/plugins/tokenPlugin/constants/tokenPlugin';
import { generateDao } from '@/shared/testUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import * as Viem from 'viem';
import { zeroAddress } from 'viem';
import { DaoTokenVotingMode } from '../../types';
import { tokenPluginAbi, tokenPluginSetupAbi } from './tokenPluginAbi';
import { tokenTransactionUtils } from './tokenTransactionUtils';

jest.mock('viem', () => ({ __esModule: true, ...jest.requireActual<typeof Viem>('viem') }));

describe('tokenTransaction utils', () => {
    const encodeFunctionDataSpy = jest.spyOn(Viem, 'encodeFunctionData');
    const parseStartDateSpy = jest.spyOn(createProposalUtils, 'parseStartDate');
    const parseEndDateSpy = jest.spyOn(createProposalUtils, 'parseEndDate');
    const encodeAbiParametersSpy = jest.spyOn(Viem, 'encodeAbiParameters');
    const buildPrepareInstallationDataSpy = jest.spyOn(pluginTransactionUtils, 'buildPrepareInstallationData');

    afterEach(() => {
        encodeFunctionDataSpy.mockReset();
        parseStartDateSpy.mockReset();
        parseEndDateSpy.mockReset();
        encodeAbiParametersSpy.mockReset();
        buildPrepareInstallationDataSpy.mockReset();
    });

    describe('buildCreateProposalData', () => {
        it('correctly encodes the create-proposal data from the given parameters', () => {
            const startDate = 0;
            const endDate = 1728660603;
            const values = { ...generateCreateProposalFormData(), ...generateCreateProposalEndDateFormData() };
            const params = {
                metadata: '0xipfs-cid' as const,
                actions: [{ to: '0xD740fd724D616795120BC363316580dAFf41129A', data: '0x', value: '0' }],
                values,
            };
            parseStartDateSpy.mockReturnValue(startDate);
            parseEndDateSpy.mockReturnValue(endDate);
            tokenTransactionUtils.buildCreateProposalData(params);
            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: tokenPluginAbi,
                functionName: 'createProposal',
                args: [params.metadata, params.actions, BigInt(0), startDate, endDate, 0, false],
            });
        });
    });

    describe('buildVoteData', () => {
        it('correctly encodes vote data with given proposal index and vote', () => {
            const proposalIndex = '3';
            const vote = 1;
            tokenTransactionUtils.buildVoteData({ proposalIndex, vote });
            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: tokenPluginAbi,
                functionName: 'vote',
                args: [proposalIndex, vote, false],
            });
        });
    });

    describe('buildPrepareInstallData', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const votingSettingsSpy = jest.spyOn(tokenTransactionUtils as any, 'buildInstallDataVotingSettings');

        afterEach(() => {
            votingSettingsSpy.mockReset();
        });

        afterAll(() => {
            votingSettingsSpy.mockRestore();
        });

        it('calls the encodeAbiParameters with the correct params', () => {
            const metadataCid = '0xSomeMetadataCID';
            const dao = generateDao({ address: '0x001' });
            const permissionSettings = { minVotingPower: '2', bodyId: '1' };
            const body = generateCreateProcessFormBody({
                supportThreshold: 2,
                minimumParticipation: 2,
                tokenType: 'new',
            });
            const stage = generateCreateProcessFormStage({
                timing: { votingPeriod: { days: 0, hours: 2, minutes: 0 }, earlyStageAdvance: false },
            });
            encodeAbiParametersSpy.mockReturnValue('0xPluginSettingsData');

            const votingSettingsMock = {
                minDuration: BigInt(7200),
                minParticipation: 10000,
                minProposerVotingPower: BigInt(2e18),
                supportThreshold: 10000,
                votingMode: 0,
            };
            votingSettingsSpy.mockReturnValue(votingSettingsMock);

            const params = { metadataCid, dao, permissionSettings, body, stage };
            tokenTransactionUtils.buildPrepareInstallData(params);

            expect(encodeAbiParametersSpy).toHaveBeenCalledWith(tokenPluginSetupAbi, [
                votingSettingsMock,
                { addr: zeroAddress, name: '', symbol: '' },
                { amounts: [], receivers: [] },
                { operation: 1, target: zeroAddress },
                BigInt(0),
                metadataCid,
            ]);
        });

        it('builds prepare installation data correctly for a token proposal', () => {
            const encodedPluginData = '0xPluginSettingsData';
            const transactionData = '0xTransactionData';
            const metadataCid = '0xSomeMetadataCID';
            const dao = generateDao({ address: '0x001' });
            const permissionSettings = { minVotingPower: '1', bodyId: '1' };
            const body = generateCreateProcessFormBody();
            const stage = generateCreateProcessFormStage();

            encodeAbiParametersSpy.mockReturnValue(encodedPluginData);
            buildPrepareInstallationDataSpy.mockReturnValue(transactionData);

            const params = { metadataCid, dao, permissionSettings, body, stage };
            const result = tokenTransactionUtils.buildPrepareInstallData(params);

            expect(buildPrepareInstallationDataSpy).toHaveBeenCalledWith(
                tokenPlugin.repositoryAddresses[dao.network],
                tokenPlugin.installVersion,
                encodedPluginData,
                dao.address,
            );

            expect(result).toBe(transactionData);
        });
    });

    describe('buildInstallDataVotingSettings', () => {
        it('returns the correct voting mode when vote change is enabled', () => {
            const body = generateCreateProcessFormBody({ voteChange: true });
            const stage = generateCreateProcessFormStage();
            const permissionSettings = { minVotingPower: '1', bodyId: '' };

            const params = { body, stage, permissionSettings };
            const result = tokenTransactionUtils['buildInstallDataVotingSettings'](params);

            expect(result.votingMode).toBe(DaoTokenVotingMode.VOTE_REPLACEMENT);
        });

        it('returns the correct voting mode when early execution is enabled', () => {
            const body = generateCreateProcessFormBody();
            const stage = generateCreateProcessFormStage({
                timing: { votingPeriod: { days: 1, hours: 0, minutes: 0 }, earlyStageAdvance: true },
            });
            const permissionSettings = { minVotingPower: '1', bodyId: '' };

            const params = { body, stage, permissionSettings };
            const result = tokenTransactionUtils['buildInstallDataVotingSettings'](params);

            expect(result.votingMode).toBe(DaoTokenVotingMode.EARLY_EXECUTION);
        });

        it('returns standard voting mode when vote replacement and early execution are not set', () => {
            const body = generateCreateProcessFormBody();
            const stage = generateCreateProcessFormStage();
            const permissionSettings = { minVotingPower: '3', bodyId: '' };

            const params = { body, stage, permissionSettings };
            const result = tokenTransactionUtils['buildInstallDataVotingSettings'](params);

            expect(result.votingMode).toBe(DaoTokenVotingMode.STANDARD);
        });

        it('returns 0 for min proposer voting power when permissionSettings are undefined', () => {
            const body = generateCreateProcessFormBody();
            const stage = generateCreateProcessFormStage();
            const params = { body, stage, permissionSettings: undefined };

            const result = tokenTransactionUtils['buildInstallDataVotingSettings'](params);
            expect(result.minProposerVotingPower).toBe(BigInt(0));
        });

        it('correctly calculates the voting settings', () => {
            const body = generateCreateProcessFormBody({ supportThreshold: 3, minimumParticipation: 4 });
            const stage = generateCreateProcessFormStage({
                timing: { votingPeriod: { days: 0, hours: 2, minutes: 0 }, earlyStageAdvance: false },
            });
            const permissionSettings = { minVotingPower: '2', bodyId: '' };

            const params = { body, stage, permissionSettings };
            const result = tokenTransactionUtils['buildInstallDataVotingSettings'](params);

            const expectedResult = {
                votingMode: DaoTokenVotingMode.STANDARD,
                supportThreshold: 30000,
                minParticipation: 40000,
                minDuration: BigInt(7200),
                minProposerVotingPower: BigInt(2e18),
            };

            expect(result).toEqual(expectedResult);
        });
    });
});
