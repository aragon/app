'use client';

import {
    AlertInline,
    Button,
    Card,
    CardEmptyState,
    IconType,
    InputContainer,
    type IProposalActionComponentProps,
    invariant,
    RadioCard,
    RadioGroup,
} from '@aragon/gov-ui-kit';
import { useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { encodeAbiParameters, encodeFunctionData, type Hex } from 'viem';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import type { INestedActionsDialogParams } from '@/modules/governance/dialogs/nestedActionsDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useFormField } from '@/shared/hooks/useFormField';
import { networkUtils } from '@/shared/utils/networkUtils';
import type {
    ICrossChainControllerActionForwardMessage,
    ICrossChainControllerPlugin,
} from '../../../types';
import { CrossChainControllerProposalActionType } from '../../../types';

export interface ICrossChainControllerForwardMessageActionProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction, ICrossChainControllerPlugin>
    > {}

const forwardMessageAbi = {
    type: 'function',
    inputs: [
        {
            name: '_destinationChainId',
            internalType: 'uint256',
            type: 'uint256',
        },
        { name: '_gasLimit', internalType: 'uint256', type: 'uint256' },
        { name: '_message', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'forwardMessage',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'nonpayable',
} as const;

// The `_message` payload is the ABI encoding of the OSx `Action[]` the destination controller hands
// to its executor.
const messageAbiParameters = [
    {
        name: 'actions',
        type: 'tuple[]',
        components: [
            { name: 'to', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'data', type: 'bytes' },
        ],
    },
] as const;

// TODO(APP-1029): expose the gas limit once the product decides between a user input and a quote derived from the destination chain.
const defaultGasLimit = BigInt(1_000_000);

export const CrossChainControllerForwardMessageAction: React.FC<
    ICrossChainControllerForwardMessageActionProps
> = (props) => {
    const { index, action } = props;
    const { daoId } = action;

    // The nested action composer resolves its DAO data from the action, so this view only supports
    // actions composed in DAO context.
    invariant(
        daoId != null,
        'CrossChainControllerForwardMessageAction: daoId must be set on the action.',
    );

    const { lanes } = action.meta.settings.crossChain;

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { setValue } = useFormContext();
    const { chainId: daoChainId } = useDaoChain({ daoId });

    const actionFieldName = `actions.[${index.toString()}]`;
    useFormField<Record<string, IProposalActionData>, typeof actionFieldName>(
        actionFieldName,
    );

    // Filter out DAO's own chain
    const destinationChains = useMemo(
        () =>
            lanes
                .filter(({ chainId }) => chainId !== daoChainId)
                .map(({ chainId }) => {
                    const network = networkUtils.getNetworkByChainId(chainId);
                    const definition =
                        network != null
                            ? networkDefinitions[network]
                            : undefined;

                    return {
                        chainId,
                        name: definition?.name,
                        logo: definition?.logo,
                    };
                }),
        [lanes, daoChainId],
    );

    const {
        onChange: onDestinationChainChange,
        value: destinationChainId,
        ...destinationChainField
    } = useFormField<
        ICrossChainControllerActionForwardMessage,
        'destinationChainId'
    >('destinationChainId', {
        label: t(
            'app.plugins.crossChainController.crossChainControllerForwardMessageAction.chain.label',
        ),
        rules: { required: true },
        fieldPrefix: actionFieldName,
    });

    const {
        onChange: onNestedActionsChange,
        value: nestedActions = [],
        alert: nestedActionsAlert,
        label: nestedActionsLabel,
    } = useFormField<
        ICrossChainControllerActionForwardMessage,
        'nestedActions'
    >('nestedActions', {
        label: t(
            'app.plugins.crossChainController.crossChainControllerForwardMessageAction.actions.label',
        ),
        rules: { validate: (value) => value != null && value.length > 0 },
        fieldPrefix: actionFieldName,
    });

    const handleDestinationChainChange = (value: string) =>
        onDestinationChainChange(Number(value));

    const handleOpenActionsDialog = () => {
        const params: INestedActionsDialogParams = {
            daoId,
            initialActions: nestedActions,
            // Prevent showing nested forward actions.
            excludeActionTypes: [
                CrossChainControllerProposalActionType.FORWARD_MESSAGE,
            ],
            onSubmit: onNestedActionsChange,
        };

        open(GovernanceDialogId.NESTED_ACTIONS, { params, stack: true });
    };

    const encodedMessage = useMemo(
        () =>
            encodeAbiParameters(messageAbiParameters, [
                nestedActions.map(({ to, value, data }) => ({
                    to: to as Hex,
                    value: BigInt(value || 0),
                    data: (data || '0x') as Hex,
                })),
            ]),
        [nestedActions],
    );

    useEffect(() => {
        if (destinationChainId == null) {
            return;
        }

        const newData = encodeFunctionData({
            abi: [forwardMessageAbi],
            functionName: 'forwardMessage',
            args: [BigInt(destinationChainId), defaultGasLimit, encodedMessage],
        });

        setValue(`${actionFieldName}.data`, newData);
        setValue(
            `${actionFieldName}.inputData.parameters[0].value`,
            destinationChainId.toString(),
        );
        setValue(
            `${actionFieldName}.inputData.parameters[1].value`,
            defaultGasLimit.toString(),
        );
        setValue(
            `${actionFieldName}.inputData.parameters[2].value`,
            encodedMessage,
        );
    }, [actionFieldName, destinationChainId, encodedMessage, setValue]);

    const hasNestedActions = nestedActions.length > 0;

    return (
        <div className="flex w-full flex-col gap-6">
            {destinationChains.length > 0 ? (
                <RadioGroup
                    helpText={t(
                        'app.plugins.crossChainController.crossChainControllerForwardMessageAction.chain.helpText',
                    )}
                    onValueChange={handleDestinationChainChange}
                    value={destinationChainId?.toString()}
                    {...destinationChainField}
                >
                    {destinationChains.map(({ chainId, name, logo }) => (
                        <RadioCard
                            avatar={logo}
                            key={chainId}
                            label={
                                name ??
                                t(
                                    'app.plugins.crossChainController.crossChainControllerForwardMessageAction.chain.unknown',
                                    { chainId },
                                )
                            }
                            value={chainId.toString()}
                        />
                    ))}
                </RadioGroup>
            ) : (
                <AlertInline
                    message={t(
                        'app.plugins.crossChainController.crossChainControllerForwardMessageAction.chain.empty',
                    )}
                    variant="warning"
                />
            )}

            <InputContainer
                alert={nestedActionsAlert}
                helpText={t(
                    'app.plugins.crossChainController.crossChainControllerForwardMessageAction.actions.helpText',
                )}
                id={`${actionFieldName}.nestedActions`}
                label={nestedActionsLabel}
                useCustomWrapper={true}
            >
                {hasNestedActions ? (
                    <Card className="flex flex-col gap-4 rounded-xl border border-neutral-100 bg-neutral-0 p-4 md:flex-row md:items-center md:justify-between md:p-6">
                        <p className="text-neutral-800">
                            {t(
                                nestedActions.length === 1
                                    ? 'app.plugins.crossChainController.crossChainControllerForwardMessageAction.actions.selected'
                                    : 'app.plugins.crossChainController.crossChainControllerForwardMessageAction.actions.selectedPlural',
                                { count: nestedActions.length },
                            )}
                        </p>
                        <Button
                            iconLeft={IconType.SETTINGS}
                            onClick={handleOpenActionsDialog}
                            size="md"
                            variant="secondary"
                        >
                            {t(
                                'app.plugins.crossChainController.crossChainControllerForwardMessageAction.actions.edit',
                            )}
                        </Button>
                    </Card>
                ) : (
                    <CardEmptyState
                        className="border border-neutral-100"
                        description={t(
                            'app.plugins.crossChainController.crossChainControllerForwardMessageAction.actions.emptyDescription',
                        )}
                        heading={t(
                            'app.plugins.crossChainController.crossChainControllerForwardMessageAction.actions.emptyHeading',
                        )}
                        isStacked={false}
                        objectIllustration={{ object: 'ACTION' }}
                        secondaryButton={{
                            label: t(
                                'app.plugins.crossChainController.crossChainControllerForwardMessageAction.actions.add',
                            ),
                            onClick: handleOpenActionsDialog,
                            iconLeft: IconType.PLUS,
                        }}
                    />
                )}
            </InputContainer>
        </div>
    );
};
