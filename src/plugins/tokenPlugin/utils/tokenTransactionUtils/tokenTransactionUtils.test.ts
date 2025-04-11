import type { ISetupBodyFormMembership } from '@/modules/createDao/dialogs/setupBodyDialog';
import { generateCreateProcessFormBody } from '@/modules/createDao/testUtils';
import { generateToken } from '@/modules/finance/testUtils';
import { generateCreateProposalEndDateFormData, generateProposalCreate } from '@/modules/governance/testUtils';
import { createProposalUtils } from '@/modules/governance/utils/createProposalUtils';
import { tokenPlugin } from '@/plugins/tokenPlugin/constants/tokenPlugin';
import { generateDao } from '@/shared/testUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
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
            const proposal = { ...generateProposalCreate(), ...generateCreateProposalEndDateFormData() };
            const actions: ITransactionRequest[] = [
                { to: '0xD740fd724D616795120BC363316580dAFf41129A', data: '0x', value: BigInt(0) },
            ];
            const params = { metadata: '0xipfs-cid' as const, actions, proposal };
            const transactionData = '0xdata';
            parseStartDateSpy.mockReturnValue(startDate);
            parseEndDateSpy.mockReturnValue(endDate);
            encodeFunctionDataSpy.mockReturnValue(transactionData);

            const result = tokenTransactionUtils.buildCreateProposalData(params);
            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: tokenPluginAbi,
                functionName: 'createProposal',
                args: [params.metadata, params.actions, BigInt(0), startDate, endDate, 0, false],
            });
            expect(result).toEqual(transactionData);
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
        const tokenSettingsSpy = jest.spyOn(tokenTransactionUtils as any, 'buildInstallDataTokenSettings');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const votingSettingsSpy = jest.spyOn(tokenTransactionUtils as any, 'buildInstallDataVotingSettings');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mintSettingsSpy = jest.spyOn(tokenTransactionUtils as any, 'buildInstallDataMintSettings');
        const getPluginTargetConfigSpy = jest.spyOn(pluginTransactionUtils, 'getPluginTargetConfig');

        type BuildDataParams = Parameters<typeof tokenTransactionUtils.buildPrepareInstallData>;

        beforeEach(() => {
            encodeAbiParametersSpy.mockReturnValue('0x');
        });

        afterEach(() => {
            tokenSettingsSpy.mockReset();
            votingSettingsSpy.mockReset();
            mintSettingsSpy.mockReset();
            getPluginTargetConfigSpy.mockReset();
        });

        afterAll(() => {
            tokenSettingsSpy.mockRestore();
            votingSettingsSpy.mockRestore();
            mintSettingsSpy.mockRestore();
        });

        it('calls the encodeAbiParameters with the correct params', () => {
            const metadata = '0xSomeMetadataCID';
            const dao = generateDao({ address: '0x001' });
            const token = { address: zeroAddress, name: '', symbol: '' };
            const body = generateCreateProcessFormBody({
                membership: { members: [], token } as ISetupBodyFormMembership,
                governance: { supportThreshold: 2, minParticipation: 2, minDuration: 1000000 },
            });

            const target = { operation: 0, target: dao.address as Viem.Hex };
            const votingSettingsMock = { minDuration: BigInt(7200) };
            const minSettingsMock = [''];
            const tokenSettingsMock = { addr: '0x123' };
            mintSettingsSpy.mockReturnValue(minSettingsMock);
            votingSettingsSpy.mockReturnValue(votingSettingsMock);
            tokenSettingsSpy.mockReturnValue(tokenSettingsMock);
            getPluginTargetConfigSpy.mockReturnValue(target);

            const params = [{ metadata, dao, body }] as unknown as BuildDataParams;
            tokenTransactionUtils.buildPrepareInstallData(...params);

            expect(encodeAbiParametersSpy).toHaveBeenCalledWith(tokenPluginSetupAbi, [
                votingSettingsMock,
                tokenSettingsMock,
                minSettingsMock,
                target,
                BigInt(0),
                metadata,
            ]);
        });

        it('correctly builds the data of the prepare install plugin transaction', () => {
            const encodedPluginData = '0xPluginSettingsData';
            const transactionData = '0xTransactionData';
            const metadata = '0xSomeMetadataCID';
            const dao = generateDao({ address: '0x001' });
            const body = generateCreateProcessFormBody({
                membership: { members: [], token: {} } as ISetupBodyFormMembership,
            });

            encodeAbiParametersSpy.mockReturnValue(encodedPluginData);
            buildPrepareInstallationDataSpy.mockReturnValue(transactionData);

            const params = [{ metadata, dao, body }] as unknown as BuildDataParams;
            const result = tokenTransactionUtils.buildPrepareInstallData(...params);

            expect(buildPrepareInstallationDataSpy).toHaveBeenCalledWith(
                tokenPlugin.repositoryAddresses[dao.network],
                tokenPlugin.installVersion,
                encodedPluginData,
                dao.address,
            );

            expect(result).toBe(transactionData);
        });

        it('correctly builds the target config for advanced governance processes', () => {
            const stageVotingPeriod = { days: 0, hours: 4, minutes: 0 };
            const dao = generateDao();
            const body = generateCreateProcessFormBody();
            const params = [{ metadata: '', dao, body, stageVotingPeriod }] as unknown as BuildDataParams;
            tokenTransactionUtils.buildPrepareInstallData(...params);
            expect(getPluginTargetConfigSpy).toHaveBeenCalledWith(dao, true);
        });
    });

    describe('buildInstallDataTokenSettings', () => {
        it('returns the token settings for the plugin installation', () => {
            const token = generateToken({ address: '0x123', symbol: 'MTT', name: 'My Token' });
            expect(tokenTransactionUtils['buildInstallDataTokenSettings'](token)).toEqual({
                addr: token.address,
                name: token.name,
                symbol: token.symbol,
            });
        });
    });

    describe('buildInstallDataMintSettings', () => {
        it('returns the mint settings for the plugin installation', () => {
            const members = [
                { address: '0x123', tokenAmount: 0.01 },
                { address: '0x456', tokenAmount: 1.5 },
            ];
            const result = tokenTransactionUtils['buildInstallDataMintSettings'](members);
            expect(result).toEqual({
                receivers: ['0x123', '0x456'],
                amounts: [BigInt(10000000000000000), BigInt(1500000000000000000)],
            });
        });
    });

    describe('buildInstallDataVotingSettings', () => {
        it('returns the governance settings for the plugin installation', () => {
            const settings = {
                votingMode: DaoTokenVotingMode.STANDARD,
                supportThreshold: 3,
                minParticipation: 4,
                minDuration: 7200,
                minProposerVotingPower: '100',
            };
            const token = generateToken({ decimals: 18 });
            const body = generateCreateProcessFormBody({
                governance: settings,
                membership: { members: [], token } as ISetupBodyFormMembership,
            });

            const params = [{ body }] as Parameters<typeof tokenTransactionUtils.buildPrepareInstallData>;
            const result = tokenTransactionUtils['buildInstallDataVotingSettings'](...params);

            expect(result).toEqual({
                votingMode: settings.votingMode,
                supportThreshold: 30000,
                minParticipation: 40000,
                minDuration: BigInt(settings.minDuration),
                minProposerVotingPower: BigInt(100000000000000000000),
            });
        });

        it('uses the stage voting period instead of the governance min duration when set', () => {
            const stageVotingPeriod = { days: 1, hours: 0, minutes: 0 };
            const settings = { minDuration: 7200, minProposerVotingPower: '1' };
            const token = generateToken({ decimals: 18 });
            const body = generateCreateProcessFormBody({
                governance: settings,
                membership: { members: [], token } as ISetupBodyFormMembership,
            });

            const params = [{ body, stageVotingPeriod }] as Parameters<
                typeof tokenTransactionUtils.buildPrepareInstallData
            >;
            const result = tokenTransactionUtils['buildInstallDataVotingSettings'](...params);
            expect(result.minDuration).toEqual(BigInt(86400));
        });
    });
});
