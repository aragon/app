import { generateCreateProcessFormBody } from '@/modules/createDao/testUtils';
import { generateCreateProposalEndDateFormData, generateCreateProposalFormData } from '@/modules/governance/testUtils';
import { createProposalUtils } from '@/modules/governance/utils/createProposalUtils';
import { multisigPlugin } from '@/plugins/multisigPlugin/constants/multisigPlugin';
import { generateDao } from '@/shared/testUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import * as Viem from 'viem';
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
            const values = { ...generateCreateProposalFormData(), ...generateCreateProposalEndDateFormData() };
            const actions = [{ to: '0x123', data: '0x0', value: '0' }];
            const params = { metadata: '0x' as const, actions: actions, values };
            parseStartDateSpy.mockReturnValue(startDate);
            parseEndDateSpy.mockReturnValue(endDate);

            multisigTransactionUtils.buildCreateProposalData(params);
            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: multisigPluginAbi,
                functionName: 'createProposal',
                args: [params.metadata, params.actions, BigInt(0), false, false, startDate, endDate],
            });
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
