import { generateDaoPlugin } from '@/shared/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import * as Viem from 'viem';
import { ProposalActionType } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import {
    generateCreateProposalFormData,
    generateProposalActionUpdateMetadata,
    generateProposalActionWithdrawToken,
} from '../../testUtils';
import { publishProposalDialogUtils } from './publishProposalDialogUtils';

describe('publishProposalDialog utils', () => {
    const getSlotFunctionSpy = jest.spyOn(pluginRegistryUtils, 'getSlotFunction');
    const parseEventLogsSpy = jest.spyOn(Viem, 'parseEventLogs');

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
        it('calls the plugin-specific function to prepare the transaction data and resolves with a transaction object', async () => {
            const transactionData = '0xfbd56e4100000000000000000000000000000000000000000000000000000000000000e';
            const slotFunction = jest.fn(() => transactionData);
            getSlotFunctionSpy.mockReturnValue(slotFunction);

            const actionBaseValues = { data: '0x123456', to: '0x000', value: '4' };
            const values = generateCreateProposalFormData({
                actions: [
                    { ...generateProposalActionUpdateMetadata(actionBaseValues), daoId: 'test', meta: undefined },
                ],
            });
            const metadataCid = 'test-cid';
            const plugin = generateDaoPlugin({ address: '0x123', subdomain: 'multisig' });

            const transaction = await publishProposalDialogUtils.buildTransaction({ values, metadataCid, plugin });

            expect(getSlotFunctionSpy).toHaveBeenCalledWith({
                pluginId: plugin.subdomain,
                slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
            });
            expect(slotFunction).toHaveBeenCalledWith({
                actions: [{ ...actionBaseValues, value: BigInt(actionBaseValues.value) }],
                metadata: '0x697066733a2f2f746573742d636964',
                values,
            });

            expect(transaction.data).toEqual(transactionData);
            expect(transaction.to).toEqual(plugin.address);
        });
    });

    describe('prepareActions', () => {
        it('calls the prepareAction function related to the action when set', async () => {
            const updateMetadataAction = generateProposalActionUpdateMetadata({ data: 'default-data' });
            const updateMetadataActionData = 'data-with-ipfs-cid';
            const transferAction = generateProposalActionWithdrawToken({ data: '0x123' });
            const transferActionData = 'transfer-async-data';
            const actions = [
                { ...updateMetadataAction, daoId: 'test', meta: undefined },
                { ...transferAction, daoId: 'test', meta: undefined },
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
                { ...transferAction, daoId: 'test', meta: undefined },
                { ...updateAction, daoId: 'test', meta: undefined },
            ];

            const result = await publishProposalDialogUtils.prepareActions({ actions });
            expect(result).toEqual(actions);
        });
    });

    describe('proposalActionToTransactionRequest', () => {
        it('correctly maps a proposal action to a transaction request', () => {
            const actionBaseData = { to: '0x123', value: '10', data: '0x1234' };
            const action = generateProposalActionWithdrawToken(actionBaseData);
            expect(publishProposalDialogUtils['actionToTransactionRequest'](action)).toEqual({
                ...actionBaseData,
                value: BigInt(actionBaseData.value),
            });
        });
    });
});
