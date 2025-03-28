import type { ISetupBodyFormMembership } from '@/modules/createDao/dialogs/setupBodyDialog';
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
            const token = { address: zeroAddress, name: '', symbol: '' };
            const body = generateCreateProcessFormBody({
                membership: { members: [], token } as ISetupBodyFormMembership,
                governance: {
                    supportThreshold: 2,
                    minParticipation: 2,
                    tokenType: 'new',
                },
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

            const params = [{ metadataCid, dao, body, stage }] as Parameters<
                typeof tokenTransactionUtils.buildPrepareInstallData
            >;
            tokenTransactionUtils.buildPrepareInstallData(...params);

            expect(encodeAbiParametersSpy).toHaveBeenCalledWith(tokenPluginSetupAbi, [
                votingSettingsMock,
                { addr: token.address, name: token.name, symbol: token.symbol },
                { amounts: [], receivers: [] },
                { operation: 1, target: '0x56ce4D8006292Abf418291FaE813C1E3769240A4' },
                BigInt(0),
                metadataCid,
            ]);
        });

        it('builds prepare installation data correctly for a token proposal', () => {
            const encodedPluginData = '0xPluginSettingsData';
            const transactionData = '0xTransactionData';
            const metadataCid = '0xSomeMetadataCID';
            const dao = generateDao({ address: '0x001' });
            const body = generateCreateProcessFormBody({
                membership: { members: [], token: {} } as ISetupBodyFormMembership,
            });
            const stage = generateCreateProcessFormStage();

            encodeAbiParametersSpy.mockReturnValue(encodedPluginData);
            buildPrepareInstallationDataSpy.mockReturnValue(transactionData);

            const params = [{ metadataCid, dao, body, stage }] as Parameters<
                typeof tokenTransactionUtils.buildPrepareInstallData
            >;
            const result = tokenTransactionUtils.buildPrepareInstallData(...params);

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
        it('returns the correct voting mode', () => {
            const body = generateCreateProcessFormBody({
                governance: { votingMode: DaoTokenVotingMode.VOTE_REPLACEMENT, minProposerVotingPower: '1' },
                membership: { members: [], token: { decimals: 18 } } as ISetupBodyFormMembership,
            });
            const stage = generateCreateProcessFormStage();
            const params = [{ body, stage }] as Parameters<typeof tokenTransactionUtils.buildPrepareInstallData>;
            const result = tokenTransactionUtils['buildInstallDataVotingSettings'](...params);
            expect(result.votingMode).toBe(DaoTokenVotingMode.VOTE_REPLACEMENT);
        });

        it('correctly calculates the voting settings', () => {
            const body = generateCreateProcessFormBody({
                governance: {
                    supportThreshold: 3,
                    minParticipation: 4,
                    votingMode: DaoTokenVotingMode.STANDARD,
                    minProposerVotingPower: '100',
                },
                membership: { members: [], token: { decimals: 18 } } as ISetupBodyFormMembership,
            });
            const stage = generateCreateProcessFormStage({
                timing: { votingPeriod: { days: 0, hours: 2, minutes: 0 }, earlyStageAdvance: false },
            });

            const params = [{ body, stage }] as Parameters<typeof tokenTransactionUtils.buildPrepareInstallData>;
            const result = tokenTransactionUtils['buildInstallDataVotingSettings'](...params);

            const expectedResult = {
                votingMode: DaoTokenVotingMode.STANDARD,
                supportThreshold: 30000,
                minParticipation: 40000,
                minDuration: BigInt(7200),
                minProposerVotingPower: BigInt(100000000000000000000),
            };

            expect(result).toEqual(expectedResult);
        });
    });
});
