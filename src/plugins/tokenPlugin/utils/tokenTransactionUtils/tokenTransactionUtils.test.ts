import { generateCreateProcessFormBody, generateCreateProcessFormStage } from '@/modules/createDao/testUtils';
import { generateCreateProposalEndDateFormData, generateCreateProposalFormData } from '@/modules/governance/testUtils';
import { createProposalUtils } from '@/modules/governance/utils/createProposalUtils';
import { plugin } from '@/plugins/tokenPlugin/constants/plugin';
import { generateDao } from '@/shared/testUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import * as Viem from 'viem';
import { zeroAddress } from 'viem';
import { tokenPluginAbi, tokenPluginSetupAbi } from './tokenPluginAbi';
import { tokenTransactionUtils } from './tokenTransactionUtils';

jest.mock('viem', () => ({ __esModule: true, ...jest.requireActual<typeof Viem>('viem') }));

describe('tokenTransaction utils', () => {
    const encodeFunctionDataSpy = jest.spyOn(Viem, 'encodeFunctionData');
    const parseStartDateSpy = jest.spyOn(createProposalUtils, 'parseStartDate');
    const parseEndDateSpy = jest.spyOn(createProposalUtils, 'parseEndDate');

    afterEach(() => {
        encodeFunctionDataSpy.mockReset();
        parseStartDateSpy.mockReset();
        parseEndDateSpy.mockReset();
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
        const encodeAbiParametersSpy = jest.spyOn(Viem, 'encodeAbiParameters');
        const buildPrepareInstallationDataSpy = jest.spyOn(pluginTransactionUtils, 'buildPrepareInstallationData');

        afterEach(() => {
            encodeAbiParametersSpy.mockReset();
            buildPrepareInstallationDataSpy.mockReset();
        });

        it('builds prepare installation data correctly for a token proposal', () => {
            const metadataCid = '0xSomeMetadataCID';
            const dao = generateDao({ address: '0x001' });
            const permissionSettings = { minVotingPower: '1', bodyId: '1' };
            const body = generateCreateProcessFormBody();
            const stage = generateCreateProcessFormStage();
            encodeAbiParametersSpy.mockReturnValue('0xPluginSettingsData');
            buildPrepareInstallationDataSpy.mockReturnValue('0xTransactionData');
            const params = { metadataCid, dao, permissionSettings, body, stage };
            const result = tokenTransactionUtils.buildPrepareInstallData(params);
            expect(encodeAbiParametersSpy).toHaveBeenCalledWith(
                tokenPluginSetupAbi,
                expect.arrayContaining([
                    {
                        minDuration: BigInt(86400),
                        minParticipation: 10000,
                        minProposerVotingPower: BigInt(1e18),
                        supportThreshold: 10000,
                        votingMode: 0,
                    },
                    expect.objectContaining({
                        addr: zeroAddress,
                        name: '',
                        symbol: '',
                    }),
                    { amounts: [], receivers: [] },
                    { operation: 1, target: zeroAddress },
                    BigInt(0),
                    metadataCid,
                ]),
            );
            expect(buildPrepareInstallationDataSpy).toHaveBeenCalledWith(
                plugin.repositoryAddresses[dao.network],
                plugin.installVersion,
                '0xPluginSettingsData',
                dao.address,
            );
            expect(result).toBe('0xTransactionData');
        });
    });
});
