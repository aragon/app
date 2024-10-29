import { generateDaoPlugin } from '@/shared/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import type { TransactionReceipt } from 'viem';
import * as viem from 'viem';
import { ProposalActionType } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import {
    generateCreateProposalFormData,
    generateProposalActionChangeMembers,
    generateProposalActionUpdateMetadata,
    generateProposalActionWithdrawToken,
} from '../../testUtils';
import { proposalAbi } from './proposalAbi';
import { publishProposalDialogUtils } from './publishProposalDialogUtils';

jest.mock('viem', () => ({ __esModule: true, ...jest.requireActual('viem') }));

describe('publishProposalDialog utils', () => {
    const getSlotFunctionSpy = jest.spyOn(pluginRegistryUtils, 'getSlotFunction');
    const parseEventLogsSpy = jest.spyOn(viem, 'parseEventLogs');

    afterEach(() => {
        getSlotFunctionSpy.mockReset();
        parseEventLogsSpy.mockReset();
    });

    describe('prepareMetadata', () => {
        it('correctly map form values to metadata object', () => {
            const formValues = generateCreateProposalFormData({
                title: 'Title',
                summary: 'Short summary',
                body: '<p>Proposal body</p>',
                resources: [{ name: 'Name', url: 'https://aragon.org' }],
            });

            expect(publishProposalDialogUtils.prepareMetadata(formValues)).toEqual({
                title: formValues.title,
                summary: formValues.summary,
                description: formValues.body,
                resources: formValues.resources,
            });
        });
    });

    describe('buildTransaction', () => {
        it('calls the plugin-specific function to prepare the transaction data and resolves with a transaction object', () => {
            const transactionData = '0xfbd56e4100000000000000000000000000000000000000000000000000000000000000e';
            const slotFunction = jest.fn(() => transactionData);
            getSlotFunctionSpy.mockReturnValue(slotFunction);

            const actionBaseValues = { data: '0x123456', to: '0x000', value: '0' };
            const values = generateCreateProposalFormData({
                actions: [
                    {
                        ...generateProposalActionUpdateMetadata(actionBaseValues),
                        daoId: 'test',
                        pluginAddress: '0x123',
                    },
                ],
            });
            const metadataCid = 'test-cid';
            const plugin = generateDaoPlugin({
                address: '0x30FF8f1Ecd022aBD2d3A79AF44fD069A7bB3EFD3',
                subdomain: 'multisig',
            });

            const transaction = publishProposalDialogUtils.buildTransaction({ values, metadataCid, plugin });

            expect(getSlotFunctionSpy).toHaveBeenCalledWith({
                pluginId: plugin.subdomain,
                slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
            });
            expect(slotFunction).toHaveBeenCalledWith({
                actions: [actionBaseValues],
                metadata: '0x697066733a2f2f746573742d636964',
                values,
            });

            expect(transaction.data).toEqual(transactionData);
            expect(transaction.to).toEqual(plugin.address);
        });
    });

    describe('getProposalId', () => {
        it('parses the transaction receipt to return the proposal id as string', () => {
            const proposalId = '16';
            const subProposalId = '20';
            const creator = '0x1234';
            const firstLog = { topics: ['12803258c575c263c24d87e4958ca7b440046a9b5898738a03189f3138e11ce7'] };
            const secondLog = { topics: ['000000000000000000000000000000000000000000000000000000006718d220'] };
            const logs = [firstLog, secondLog];

            const decodedLogs = [
                { args: { proposalId: BigInt(subProposalId), creator: '0xplugin-address' } },
                { args: { proposalId: BigInt(proposalId), creator: creator } },
            ];
            parseEventLogsSpy.mockReturnValue(decodedLogs as unknown as viem.ParseEventLogsReturnType);

            const result = publishProposalDialogUtils.getProposalId({ logs } as TransactionReceipt, creator);
            expect(parseEventLogsSpy).toHaveBeenCalledWith({ abi: proposalAbi, eventName: 'ProposalCreated', logs });
            expect(result).toEqual(proposalId);
        });
    });

    describe('prepareActions', () => {
        it('calls the prepareAction function related to the action when set', async () => {
            const updateMetadataAction = generateProposalActionUpdateMetadata({ data: 'default-data' });
            const updateMetadataActionData = 'data-with-ipfs-cid';
            const transferAction = generateProposalActionWithdrawToken({ data: '0x123' });
            const transferActionData = 'transfer-async-data';
            const actions = [
                { ...updateMetadataAction, daoId: 'test', pluginAddress: '0x123' },
                { ...transferAction, daoId: 'test', pluginAddress: '0x123' },
            ];
            const prepareActions = {
                [ProposalActionType.METADATA_UPDATE]: () => Promise.resolve(updateMetadataActionData),
                [ProposalActionType.TRANSFER]: () => Promise.resolve(transferActionData),
            };

            const result = await publishProposalDialogUtils.prepareActions({ actions, prepareActions });

            expect(result).toEqual([
                { ...actions[0], data: updateMetadataActionData },
                { ...actions[1], data: transferActionData },
            ]);
        });

        it('defaults to the action data when no prepare function is found for the aciton', async () => {
            const transferAction = generateProposalActionWithdrawToken({ data: '0x123' });
            const updateAction = generateProposalActionUpdateMetadata({ data: '0x456' });
            const actions = [
                { ...transferAction, daoId: 'test', pluginAddress: '0x123' },
                { ...updateAction, daoId: 'test', pluginAddress: '0x123' },
            ];

            const result = await publishProposalDialogUtils.prepareActions({ actions });
            expect(result).toEqual(actions);
        });
    });

    describe('formToProposalActions', () => {
        it('correctly maps the form actions to the ones needed for the transaction', () => {
            const actionsBaseData = [
                { to: '0x123', value: '10', data: '0x1234' },
                { to: '0x456', value: '0', data: '0x' },
            ];
            const actions = [
                generateProposalActionChangeMembers(actionsBaseData[0]),
                generateProposalActionUpdateMetadata(actionsBaseData[1]),
            ];
            expect(publishProposalDialogUtils['formToProposalActions'](actions)).toEqual(actionsBaseData);
        });
    });
});
