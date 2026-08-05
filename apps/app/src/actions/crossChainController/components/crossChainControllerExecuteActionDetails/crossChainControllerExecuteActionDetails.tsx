'use client';

import {
    AlertInline,
    Avatar,
    DefinitionList,
    formatterUtils,
    InputContainer,
    type IProposalAction,
    type IProposalActionComponentProps,
    NumberFormat,
} from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import { decodeAbiParameters, type Hex } from 'viem';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { IRawActionTuple } from '@/modules/governance/types';
import { forwardMessageActionsAbi } from '@/plugins/crossChainControllerPlugin/constants/crossChainControllerAbi';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { networkUtils } from '@/shared/utils/networkUtils';
import type { ICrossChainControllerActionCrossChainExecute } from '../../types/crossChainControllerActionCrossChainExecute';
import { CrossChainControllerNestedActionsList } from '../crossChainControllerNestedActionsList';

export interface ICrossChainControllerExecuteActionDetailsProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction>
    > {}

/**
 * Decodes the `_message` payload into the raw actions tuple to check the decoded sub-actions against.
 * @param message The `_message` parameter value of the `forwardMessage` call.
 * @returns The raw actions tuple, or undefined when the payload does not hold an encoded `Action[]`.
 */
const decodeMessageActions = (
    message?: string,
): IRawActionTuple[] | undefined => {
    if (message == null) {
        return undefined;
    }

    try {
        const [actions] = decodeAbiParameters(
            forwardMessageActionsAbi,
            message as Hex,
        );

        return actions.map((action) => ({
            to: action.to,
            value: action.value.toString(),
            data: action.data,
        }));
    } catch {
        return undefined;
    }
};

export const CrossChainControllerExecuteActionDetails: React.FC<
    ICrossChainControllerExecuteActionDetailsProps
> = (props) => {
    const { action } = props;

    const { inputData } =
        action as unknown as ICrossChainControllerActionCrossChainExecute;

    const { t } = useTranslations();

    const { actions, parameters = [], destinationChainId: chainId } = inputData;

    const message = parameters.find(
        (param) => param.name === '_message',
    )?.value;
    const gasLimit = parameters.find(
        (param) => param.name === '_gasLimit',
    )?.value;

    const messageActions = useMemo(
        () =>
            decodeMessageActions(
                typeof message === 'string' ? message : undefined,
            ),
        [message],
    );

    // The destination is resolved from the chain id instead of the network reported by the backend, so that chains not
    // supported by the app are handled gracefully.
    const destinationNetwork = networkUtils.getNetworkByChainId(chainId);
    const destinationDefinition =
        destinationNetwork != null
            ? networkDefinitions[destinationNetwork]
            : undefined;

    const formattedGasLimit = formatterUtils.formatNumber(
        typeof gasLimit === 'string' ? gasLimit : null,
        { format: NumberFormat.GENERIC_LONG },
    );

    return (
        <div className="flex w-full flex-col gap-y-6">
            <DefinitionList.Container>
                <DefinitionList.Item
                    term={t(
                        'app.actions.crossChainController.crossChainControllerExecuteActionDetails.chainTerm',
                    )}
                >
                    {destinationDefinition ? (
                        <div className="flex items-center gap-2">
                            <Avatar
                                size="sm"
                                src={destinationDefinition.logo}
                            />
                            <span>{destinationDefinition.name}</span>
                        </div>
                    ) : (
                        t(
                            'app.actions.crossChainController.crossChainControllerExecuteActionDetails.chainUnknown',
                            { chainId },
                        )
                    )}
                </DefinitionList.Item>
                {formattedGasLimit != null && (
                    <DefinitionList.Item
                        term={t(
                            'app.actions.crossChainController.crossChainControllerExecuteActionDetails.gasLimitTerm',
                        )}
                    >
                        {formattedGasLimit}
                    </DefinitionList.Item>
                )}
            </DefinitionList.Container>
            <InputContainer
                helpText={t(
                    'app.actions.crossChainController.crossChainControllerExecuteActionDetails.actionsHelpText',
                )}
                id="crossChainExecuteActions"
                label={t(
                    'app.actions.crossChainController.crossChainControllerExecuteActionDetails.actionsLabel',
                )}
                useCustomWrapper={true}
            >
                {messageActions == null ? (
                    <AlertInline
                        message={t(
                            'app.actions.crossChainController.crossChainControllerExecuteActionDetails.actionsDecodeError',
                        )}
                        variant="warning"
                    />
                ) : (
                    <CrossChainControllerNestedActionsList
                        chainId={chainId}
                        rawActions={actions}
                        rawTuple={messageActions}
                    />
                )}
            </InputContainer>
        </div>
    );
};
