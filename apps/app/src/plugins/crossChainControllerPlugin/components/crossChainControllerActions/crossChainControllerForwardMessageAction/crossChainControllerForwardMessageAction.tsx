'use client';

import {
    AlertCard,
    AlertInline,
    addressUtils,
    Button,
    Card,
    CardEmptyState,
    ChainEntityType,
    IconType,
    InputContainer,
    InputNumber,
    type IProposalActionComponentProps,
    invariant,
    Link,
    RadioCard,
    RadioGroup,
} from '@aragon/gov-ui-kit';
import { useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { encodeAbiParameters, encodeFunctionData, type Hex } from 'viem';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { useCreateProposalFormContext } from '@/modules/governance/components/createProposalForm';
import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import type { INestedActionsDialogParams } from '@/modules/governance/dialogs/nestedActionsDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useFormField } from '@/shared/hooks/useFormField';
import { networkUtils } from '@/shared/utils/networkUtils';
import {
    forwardMessageAbi,
    forwardMessageActionsAbi,
} from '../../../constants/crossChainControllerAbi';
import { crossChainControllerGas } from '../../../constants/crossChainControllerGas';
import type {
    ICrossChainControllerActionForwardMessage,
    ICrossChainControllerPlugin,
} from '../../../types';
import { CrossChainControllerProposalActionType } from '../../../types';
import { crossChainControllerGasUtils } from './crossChainControllerGasUtils';
import { useCrossChainControllerGasLimit } from './useCrossChainControllerGasLimit';

export interface ICrossChainControllerForwardMessageActionProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction, ICrossChainControllerPlugin>
    > {}

export const CrossChainControllerForwardMessageAction: React.FC<
    ICrossChainControllerForwardMessageActionProps
> = (props) => {
    const { index, action } = props;
    const { daoId } = action;

    // The DAO chain is needed to exclude it from the destination chains, so this view only supports
    // actions composed in DAO context.
    invariant(
        daoId != null,
        'CrossChainControllerForwardMessageAction: daoId must be set on the action.',
    );

    const { lanes } = action.meta.settings.crossChain;

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { setValue } = useFormContext();
    const {
        buildEntityUrl,
        chainId: daoChainId,
        network: daoNetwork,
    } = useDaoChain({ daoId });

    // The nested actions are part of the proposal, so they are restricted by the process creating it.
    const { processPlugin } = useCreateProposalFormContext();

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
                        network,
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
        rules: {
            validate: (value) =>
                (value != null && value.length > 0) ||
                'app.plugins.crossChainController.crossChainControllerForwardMessageAction.actions.mandatory',
        },
        fieldPrefix: actionFieldName,
    });

    const {
        onChange: onGasLimitChange,
        value: gasLimit,
        ...gasLimitField
    } = useFormField<ICrossChainControllerActionForwardMessage, 'gasLimit'>(
        'gasLimit',
        {
            label: t(
                'app.plugins.crossChainController.crossChainControllerForwardMessageAction.gas.label',
            ),
            rules: {
                required: true,
                min: crossChainControllerGas.minGasLimit,
                max: crossChainControllerGas.maxGasLimit,
                // The masked input accepts the radix character, so a manually typed fraction has to
                // be rejected here - it is neither a valid gas figure nor encodable as a uint256.
                validate: (value: string | undefined) =>
                    crossChainControllerGasUtils.parseGasLimit(value) != null ||
                    'app.plugins.crossChainController.crossChainControllerForwardMessageAction.gas.notWholeNumber',
            },
            fieldPrefix: actionFieldName,
        },
    );

    const handleDestinationChainChange = (value: string) => {
        const newDestinationChainId = Number(value);

        // Guard against re-selecting the current chain, which must not discard the actions.
        if (newDestinationChainId === destinationChainId) {
            return;
        }

        onDestinationChainChange(newDestinationChainId);

        // The nested actions target contracts on the previous destination chain, so they cannot
        // survive a change of destination. The gas limit is cleared by the estimation hook.
        onNestedActionsChange([]);
    };

    // The nested actions are executed by the destination chain controller, therefore they are composed
    // for the selected destination network instead of the DAO network.
    const destinationNetwork = destinationChains.find(
        ({ chainId }) => chainId === destinationChainId,
    )?.network;

    // The messaging fee is paid by the controller on the DAO chain with the fee token set on the
    // local adapter of the selected lane, which the backend indexes onto the lane.
    const feeToken = lanes.find(
        ({ chainId }) => chainId === destinationChainId,
    )?.token;

    const handleOpenActionsDialog = () => {
        invariant(
            destinationNetwork != null,
            'CrossChainControllerForwardMessageAction: destination network must be set.',
        );

        const params: INestedActionsDialogParams = {
            hostDaoId: daoId,
            processPluginAddress: processPlugin?.address,
            crossChainNetwork: destinationNetwork,
            initialActions: nestedActions,
            // Prevent showing nested forward actions.
            excludeActionTypes: [
                CrossChainControllerProposalActionType.FORWARD_MESSAGE,
            ],
            onSubmit: onNestedActionsChange,
        };

        open(GovernanceDialogId.NESTED_ACTIONS, {
            params,
            disableOutsideClick: true,
        });
    };

    const encodedMessage = useMemo(
        () =>
            encodeAbiParameters(forwardMessageActionsAbi, [
                nestedActions.map(({ to, value, data }) => ({
                    to: to as Hex,
                    value: BigInt(value || 0),
                    data: (data || '0x') as Hex,
                })),
            ]),
        [nestedActions],
    );

    const hasNestedActions = nestedActions.length > 0;

    const {
        handleEstimateGasLimit,
        isEstimating,
        estimationAlert,
        simulationUrl,
    } = useCrossChainControllerGasLimit({
        daoNetwork,
        controllerAddress: action.meta.address,
        destinationChainId,
        nestedActions,
        onGasLimitChange,
    });

    useEffect(() => {
        if (destinationChainId == null) {
            return;
        }

        // Encodes to zero while the limit is unset or not a whole number. The field is required and
        // rejects fractions, so a proposal can never be created in that state.
        const encodedGasLimit =
            crossChainControllerGasUtils.parseGasLimit(gasLimit) ?? BigInt(0);

        const newData = encodeFunctionData({
            abi: [forwardMessageAbi],
            functionName: 'forwardMessage',
            args: [BigInt(destinationChainId), encodedGasLimit, encodedMessage],
        });

        setValue(`${actionFieldName}.data`, newData);
        setValue(
            `${actionFieldName}.inputData.parameters[0].value`,
            destinationChainId.toString(),
        );
        setValue(
            `${actionFieldName}.inputData.parameters[1].value`,
            encodedGasLimit.toString(),
        );
        setValue(
            `${actionFieldName}.inputData.parameters[2].value`,
            encodedMessage,
        );
    }, [
        actionFieldName,
        destinationChainId,
        encodedMessage,
        gasLimit,
        setValue,
    ]);

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
                            disabled={destinationNetwork == null}
                            iconLeft={IconType.PEN}
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
                        heading={t(
                            'app.plugins.crossChainController.crossChainControllerForwardMessageAction.actions.emptyHeading',
                        )}
                        isStacked={false}
                        objectIllustration={{ object: 'SMART_CONTRACT' }}
                        secondaryButton={{
                            label: t(
                                'app.plugins.crossChainController.crossChainControllerForwardMessageAction.actions.add',
                            ),
                            disabled: destinationNetwork == null,
                            onClick: handleOpenActionsDialog,
                            iconLeft: IconType.PLUS,
                        }}
                    />
                )}
            </InputContainer>

            {hasNestedActions && (
                <div className="flex flex-col gap-3">
                    <InputNumber
                        helpText={t(
                            'app.plugins.crossChainController.crossChainControllerForwardMessageAction.gas.helpText',
                        )}
                        max={crossChainControllerGas.maxGasLimit}
                        min={crossChainControllerGas.minGasLimit}
                        onChange={onGasLimitChange}
                        placeholder={t(
                            'app.plugins.crossChainController.crossChainControllerForwardMessageAction.gas.placeholder',
                        )}
                        step={1000}
                        value={gasLimit ?? ''}
                        {...gasLimitField}
                    />
                    <Button
                        disabled={destinationChainId == null}
                        iconLeft={IconType.RELOAD}
                        isLoading={isEstimating}
                        onClick={handleEstimateGasLimit}
                        size="md"
                        type="button"
                        variant="secondary"
                    >
                        {t(
                            'app.plugins.crossChainController.crossChainControllerForwardMessageAction.gas.calculate',
                        )}
                    </Button>

                    {(estimationAlert != null || simulationUrl != null) && (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            {estimationAlert != null && (
                                <AlertInline
                                    message={estimationAlert.message}
                                    variant={estimationAlert.variant}
                                />
                            )}
                            {simulationUrl != null && (
                                <Link
                                    className="shrink-0"
                                    href={simulationUrl}
                                    isExternal={true}
                                    showUrl={false}
                                >
                                    {t(
                                        'app.plugins.crossChainController.crossChainControllerForwardMessageAction.gas.viewSimulation',
                                    )}
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            )}

            <AlertCard
                message={t(
                    'app.plugins.crossChainController.crossChainControllerForwardMessageAction.fee.title',
                )}
                variant="info"
            >
                <div>
                    {t(
                        'app.plugins.crossChainController.crossChainControllerForwardMessageAction.fee.descriptionStart',
                    )}{' '}
                    <Link
                        href={buildEntityUrl?.({
                            type: ChainEntityType.ADDRESS,
                            id: action.meta.address,
                        })}
                        isExternal={true}
                        showUrl={false}
                    >
                        {addressUtils.truncateAddress(action.meta.address)}
                    </Link>{' '}
                    {t(
                        'app.plugins.crossChainController.crossChainControllerForwardMessageAction.fee.description',
                        {
                            token:
                                feeToken?.symbol ??
                                t(
                                    'app.plugins.crossChainController.crossChainControllerForwardMessageAction.fee.defaultToken',
                                ),
                        },
                    )}
                </div>
            </AlertCard>
        </div>
    );
};
