import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { encodeAbiParameters, type Hex } from 'viem';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { IRawActionTuple } from '@/modules/governance/types';
import { forwardMessageActionsAbi } from '@/plugins/crossChainControllerPlugin/constants/crossChainControllerAbi';
import type { ICrossChainControllerActionForwardMessage } from '../../types/crossChainControllerActionForwardMessage';
import { CrossChainControllerActionType } from '../../types/enum/crossChainControllerActionType';
import {
    CrossChainControllerForwardMessageDetails,
    type ICrossChainControllerForwardMessageDetailsProps,
} from './crossChainControllerForwardMessageDetails';

jest.mock('../crossChainControllerNestedActionsList', () => ({
    CrossChainControllerNestedActionsList: ({
        rawActions,
        rawTuple,
        chainId,
    }: {
        rawActions?: IProposalAction[];
        rawTuple?: IRawActionTuple[];
        chainId?: number;
    }) => (
        <div data-testid="nested-actions-list">
            {`nested-count:${(rawActions ?? []).length.toString()} tuple-count:${(rawTuple ?? []).length.toString()} chain-id:${chainId?.toString() ?? ''}`}
        </div>
    ),
}));

describe('<CrossChainControllerForwardMessageDetails /> component', () => {
    const encodeMessage = (actions: IRawActionTuple[]): Hex =>
        encodeAbiParameters(forwardMessageActionsAbi, [
            actions.map(({ to, value, data }) => ({
                to: to as Hex,
                value: BigInt(value),
                data: data as Hex,
            })),
        ]);

    const buildAction = (
        params?: Partial<{
            message: string;
            gasLimit: string;
            destinationChainId: number;
            actions: IProposalAction[];
        }>,
    ): IProposalActionData<ICrossChainControllerActionForwardMessage> => {
        const {
            message = encodeMessage([]),
            gasLimit = '3000000',
            destinationChainId = 42_161,
            actions,
        } = params ?? {};

        return {
            type: CrossChainControllerActionType.CROSS_CHAIN_CONTROLLER_FORWARD_MESSAGE,
            from: '0x0',
            to: '0x1',
            data: '0x',
            value: '0',
            daoId: 'dao-id',
            meta: undefined,
            inputData: {
                function: 'forwardMessage',
                contract: 'CrossChainController',
                destinationChainId,
                actions,
                parameters: [
                    {
                        name: '_destinationChainId',
                        type: 'uint256',
                        value: destinationChainId.toString(),
                    },
                    { name: '_gasLimit', type: 'uint256', value: gasLimit },
                    { name: '_message', type: 'bytes', value: message },
                ],
            },
        };
    };

    const createTestComponent = (
        props?: Partial<ICrossChainControllerForwardMessageDetailsProps>,
    ) => {
        const completeProps: ICrossChainControllerForwardMessageDetailsProps = {
            action: buildAction(),
            index: 0,
            chainId: 1,
            ...props,
        };

        return (
            <GukModulesProvider>
                <CrossChainControllerForwardMessageDetails {...completeProps} />
            </GukModulesProvider>
        );
    };

    const generateNestedAction = (
        overrides?: Partial<IProposalAction>,
    ): IProposalAction => ({
        type: 'Unknown',
        from: '0x0',
        to: '0xa0Ab554dEa45be64F12E3B0085DDC59852eFF9fc',
        data: '0xd09de08a',
        value: '0',
        inputData: null,
        ...overrides,
    });

    it('renders the destination chain, the gas limit and the actions decoded from the message', () => {
        const nestedAction = generateNestedAction();
        const action = buildAction({
            actions: [nestedAction],
            message: encodeMessage([
                {
                    to: nestedAction.to,
                    value: nestedAction.value,
                    data: nestedAction.data,
                },
            ]),
        });

        render(createTestComponent({ action }));

        expect(screen.getByText('Arbitrum')).toBeInTheDocument();
        expect(screen.getByText('3,000,000')).toBeInTheDocument();
        expect(screen.getByTestId('nested-actions-list')).toHaveTextContent(
            'nested-count:1 tuple-count:1 chain-id:42161',
        );
    });

    it('renders the chain id when the destination chain is not supported by the app', () => {
        const action = buildAction({ destinationChainId: 999 });

        render(createTestComponent({ action }));

        expect(
            screen.getByText(
                'app.actions.crossChainController.crossChainControllerForwardMessageDetails.chainUnknown (chainId=999)',
            ),
        ).toBeInTheDocument();
    });

    it('renders a warning instead of the actions list when the message cannot be decoded', () => {
        const action = buildAction({ message: '0x1234' });

        render(createTestComponent({ action }));

        expect(
            screen.queryByTestId('nested-actions-list'),
        ).not.toBeInTheDocument();
        expect(
            screen.getByText(
                'app.actions.crossChainController.crossChainControllerForwardMessageDetails.actionsDecodeError',
            ),
        ).toBeInTheDocument();
    });
});
