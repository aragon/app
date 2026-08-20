'use client';

import {
    AlertCard,
    addressUtils,
    Button,
    Dialog,
    InputText,
    invariant,
    Radio,
    RadioGroup,
    Switch,
    TextArea,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { type Address, formatEther, type Hex, isHex, parseEther } from 'viem';
import {
    useMpcCreateRequest,
    useMpcSimulate,
    useMpcUpdateRequest,
} from '@/modules/mpc/api/mpcService';
import type {
    IMpcSignRequest,
    IMpcSystem,
    MpcSignRequestPayload,
    MpcSignRequestType,
} from '@/modules/mpc/api/mpcService/domain';
import { MpcErrorAlert } from '@/modules/mpc/components/mpcErrorAlert';
import { MpcRequestSummary } from '@/modules/mpc/components/mpcRequestSummary';
import { MPC_SEPOLIA_CHAIN_ID } from '@/modules/mpc/constants/mpcConstants';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';

export interface IMpcNewRequestDialogParams {
    /**
     * System the request is created for.
     */
    system: IMpcSystem;
    /**
     * Existing (editable) request to modify instead of creating a new one.
     */
    request?: IMpcSignRequest;
    /**
     * Callback called after the request has been created (or modified).
     */
    onCreated?: (request: IMpcSignRequest) => void;
}

export interface IMpcNewRequestDialogProps
    extends IDialogComponentProps<IMpcNewRequestDialogParams> {}

interface IMpcNewRequestFormData {
    type: MpcSignRequestType;
    to: string;
    valueEth: string;
    data: string;
    message: string;
    typedDataJson: string;
    editable: boolean;
}

/**
 * Form values of an existing request (edit mode).
 */
const requestToFormData = (
    request: IMpcSignRequest,
): IMpcNewRequestFormData => {
    const { payload } = request;

    return {
        type: payload.type,
        to: payload.type === 'transaction' ? payload.transaction.to : '',
        valueEth:
            payload.type === 'transaction'
                ? formatEther(BigInt(payload.transaction.valueWei))
                : '',
        data:
            payload.type === 'transaction'
                ? (payload.transaction.data ?? '')
                : '',
        message: payload.type === 'message' ? payload.message.message : '',
        typedDataJson:
            payload.type === 'typedData' ? payload.typedData.typedDataJson : '',
        editable: request.editable === true,
    };
};

const requestTypes: MpcSignRequestType[] = [
    'transaction',
    'message',
    'typedData',
];

const validateAddress = (value: string) =>
    addressUtils.isAddress(value)
        ? true
        : 'app.mpc.mpcNewRequestDialog.errors.address';

const validateEth = (value: string) => {
    try {
        return parseEther(value.trim().length > 0 ? value.trim() : '0') >=
            BigInt(0)
            ? true
            : 'app.mpc.mpcNewRequestDialog.errors.amount';
    } catch {
        return 'app.mpc.mpcNewRequestDialog.errors.amount';
    }
};

const validateData = (value: string) =>
    value.trim().length === 0 || isHex(value.trim())
        ? true
        : 'app.mpc.mpcNewRequestDialog.errors.data';

const validateTypedData = (value: string) => {
    try {
        const parsed: unknown = JSON.parse(value);
        return parsed != null && typeof parsed === 'object'
            ? true
            : 'app.mpc.mpcNewRequestDialog.errors.typedData';
    } catch {
        return 'app.mpc.mpcNewRequestDialog.errors.typedData';
    }
};

const buildPayload = (
    values: IMpcNewRequestFormData,
): MpcSignRequestPayload => {
    if (values.type === 'transaction') {
        const data = values.data.trim();
        return {
            type: 'transaction',
            transaction: {
                chainId: MPC_SEPOLIA_CHAIN_ID,
                to: values.to.trim() as Address,
                valueWei: parseEther(
                    values.valueEth.trim().length > 0
                        ? values.valueEth.trim()
                        : '0',
                ).toString(),
                data:
                    data.length > 0 && data !== '0x'
                        ? (data as Hex)
                        : undefined,
            },
        };
    }

    if (values.type === 'message') {
        return { type: 'message', message: { message: values.message } };
    }

    return {
        type: 'typedData',
        typedData: { typedDataJson: values.typedDataJson.trim() },
    };
};

export const MpcNewRequestDialog: React.FC<IMpcNewRequestDialogProps> = (
    props,
) => {
    const { location } = props;
    invariant(
        location.params != null,
        'MpcNewRequestDialog: required parameters must be set.',
    );
    const { system, request: editedRequest, onCreated } = location.params;
    const isEditMode = editedRequest != null;

    const { t } = useTranslations();
    const { close } = useDialogContext();
    const handleClose = () => close(location.id);

    const [createdRequest, setCreatedRequest] = useState<IMpcSignRequest>();
    // Server-side preview (dry run): decoded summary + policy decision shown before the request is created.
    const [preview, setPreview] = useState<IMpcSignRequest>();

    const { control, handleSubmit, getValues, trigger } =
        useForm<IMpcNewRequestFormData>({
            mode: 'onTouched',
            defaultValues:
                editedRequest != null
                    ? requestToFormData(editedRequest)
                    : {
                          type: 'transaction',
                          to: '',
                          valueEth: '',
                          data: '',
                          message: '',
                          typedDataJson: '',
                          editable: false,
                      },
        });
    const editableField = useFormField<IMpcNewRequestFormData, 'editable'>(
        'editable',
        {
            control,
            label: t('app.mpc.mpcNewRequestDialog.editable.label'),
        },
    );

    const typeField = useFormField<IMpcNewRequestFormData, 'type'>('type', {
        control,
        label: t('app.mpc.mpcNewRequestDialog.type.label'),
    });
    const isTransaction = typeField.value === 'transaction';
    const isMessage = typeField.value === 'message';
    const isTypedData = typeField.value === 'typedData';

    const toField = useFormField<IMpcNewRequestFormData, 'to'>('to', {
        control,
        label: t('app.mpc.mpcNewRequestDialog.to.label'),
        rules: {
            validate: (value, values) =>
                values.type === 'transaction' ? validateAddress(value) : true,
        },
        trimOnBlur: true,
    });
    const valueField = useFormField<IMpcNewRequestFormData, 'valueEth'>(
        'valueEth',
        {
            control,
            label: t('app.mpc.mpcNewRequestDialog.value.label'),
            rules: {
                validate: (value, values) =>
                    values.type === 'transaction' ? validateEth(value) : true,
            },
            trimOnBlur: true,
        },
    );
    const dataField = useFormField<IMpcNewRequestFormData, 'data'>('data', {
        control,
        label: t('app.mpc.mpcNewRequestDialog.data.label'),
        rules: {
            validate: (value, values) =>
                values.type === 'transaction' ? validateData(value) : true,
        },
        trimOnBlur: true,
    });
    const messageField = useFormField<IMpcNewRequestFormData, 'message'>(
        'message',
        {
            control,
            label: t('app.mpc.mpcNewRequestDialog.message.label'),
            rules: {
                validate: (value, values) =>
                    values.type !== 'message' || value.trim().length > 0
                        ? true
                        : 'app.mpc.mpcNewRequestDialog.errors.message',
            },
            sanitizeMode: 'none',
        },
    );
    const typedDataField = useFormField<
        IMpcNewRequestFormData,
        'typedDataJson'
    >('typedDataJson', {
        control,
        label: t('app.mpc.mpcNewRequestDialog.typedData.label'),
        rules: {
            validate: (value, values) =>
                values.type === 'typedData' ? validateTypedData(value) : true,
        },
        sanitizeMode: 'none',
    });

    const simulate = useMpcSimulate();
    const previewRequest = useMpcCreateRequest({
        onSuccess: (request) => setPreview(request),
    });
    const createRequest = useMpcCreateRequest({
        onSuccess: (request) => {
            setCreatedRequest(request);
            onCreated?.(request);
        },
    });
    const updateRequest = useMpcUpdateRequest({
        onSuccess: (request) => {
            setCreatedRequest(request);
            onCreated?.(request);
        },
    });

    const handleSimulate = async () => {
        const isValid = await trigger(['to', 'valueEth', 'data']);
        if (!isValid) {
            return;
        }
        const payload = buildPayload(getValues());
        if (payload.type !== 'transaction') {
            return;
        }
        simulate.mutate({
            urlParams: { systemId: system.id },
            body: {
                chainId: payload.transaction.chainId,
                to: payload.transaction.to,
                valueWei: payload.transaction.valueWei,
                data: payload.transaction.data,
            },
        });
    };

    const onPreview = handleSubmit((values) =>
        previewRequest.mutate({
            urlParams: { systemId: system.id },
            body: { payload: buildPayload(values), dryRun: true },
        }),
    );

    const onSubmit = handleSubmit((values) =>
        editedRequest != null
            ? updateRequest.mutate({
                  urlParams: {
                      systemId: system.id,
                      requestId: editedRequest.id,
                  },
                  body: { payload: buildPayload(values) },
              })
            : createRequest.mutate({
                  urlParams: { systemId: system.id },
                  body: {
                      payload: buildPayload(values),
                      editable: values.editable,
                  },
              }),
    );
    const submitMutation =
        editedRequest != null ? updateRequest : createRequest;

    const handleBack = () => {
        setPreview(undefined);
        createRequest.reset();
        updateRequest.reset();
    };

    if (createdRequest != null) {
        return (
            <>
                <Dialog.Header
                    onClose={handleClose}
                    title={t(
                        isEditMode
                            ? 'app.mpc.mpcNewRequestDialog.updated.title'
                            : 'app.mpc.mpcNewRequestDialog.created.title',
                    )}
                />
                <Dialog.Content className="flex flex-col gap-6 px-6 pt-4 pb-6">
                    <AlertCard
                        message={t(
                            `app.mpc.mpcNewRequestDialog.created.status.${createdRequest.status}.title`,
                        )}
                        variant={
                            createdRequest.status === 'rejected'
                                ? 'critical'
                                : createdRequest.status === 'pending_approval'
                                  ? 'warning'
                                  : 'success'
                        }
                    >
                        {t(
                            `app.mpc.mpcNewRequestDialog.created.status.${createdRequest.status}.description`,
                        )}
                    </AlertCard>
                    <MpcRequestSummary request={createdRequest} />
                </Dialog.Content>
                <Dialog.Footer
                    primaryAction={{
                        label: t('app.mpc.mpcNewRequestDialog.actions.close'),
                        onClick: handleClose,
                    }}
                />
            </>
        );
    }

    if (preview != null) {
        const isDenied = !preview.policyDecision.allowed;

        return (
            <>
                <Dialog.Header
                    description={t(
                        'app.mpc.mpcNewRequestDialog.preview.description',
                    )}
                    onClose={handleClose}
                    title={t('app.mpc.mpcNewRequestDialog.preview.title')}
                />
                <Dialog.Content className="flex flex-col gap-6 px-6 pt-4 pb-6">
                    <AlertCard
                        message={t(
                            `app.mpc.mpcNewRequestDialog.preview.status.${preview.status}.title`,
                        )}
                        variant={
                            isDenied
                                ? 'critical'
                                : preview.status === 'pending_approval'
                                  ? 'warning'
                                  : 'success'
                        }
                    >
                        <p>
                            {t(
                                `app.mpc.mpcNewRequestDialog.preview.status.${preview.status}.description`,
                            )}
                        </p>
                        {preview.policyDecision.reasons.length > 0 && (
                            <ul className="mt-2 list-disc pl-5">
                                {preview.policyDecision.reasons.map(
                                    (reason) => (
                                        <li key={reason}>{reason}</li>
                                    ),
                                )}
                            </ul>
                        )}
                    </AlertCard>
                    <MpcRequestSummary request={preview} />
                    <MpcErrorAlert error={submitMutation.error} />
                </Dialog.Content>
                <Dialog.Footer
                    primaryAction={{
                        label: t(
                            isEditMode
                                ? 'app.mpc.mpcNewRequestDialog.actions.update'
                                : 'app.mpc.mpcNewRequestDialog.actions.submit',
                        ),
                        onClick: onSubmit,
                        isLoading: submitMutation.isPending,
                        disabled: isDenied,
                    }}
                    secondaryAction={{
                        label: t('app.mpc.mpcNewRequestDialog.actions.back'),
                        onClick: handleBack,
                        disabled: submitMutation.isPending,
                    }}
                />
            </>
        );
    }

    return (
        <>
            <Dialog.Header
                description={t(
                    isEditMode
                        ? 'app.mpc.mpcNewRequestDialog.editDescription'
                        : 'app.mpc.mpcNewRequestDialog.description',
                )}
                onClose={handleClose}
                title={t(
                    isEditMode
                        ? 'app.mpc.mpcNewRequestDialog.editTitle'
                        : 'app.mpc.mpcNewRequestDialog.title',
                )}
            />
            <Dialog.Content className="flex flex-col gap-6 px-6 pt-4 pb-6">
                <RadioGroup
                    disabled={isEditMode}
                    label={typeField.label}
                    onValueChange={typeField.onChange}
                    value={typeField.value}
                >
                    {requestTypes.map((type) => (
                        <Radio
                            key={type}
                            label={t(`app.mpc.mpcRequestItem.type.${type}`)}
                            value={type}
                        />
                    ))}
                </RadioGroup>
                {isTransaction && (
                    <>
                        <p className="text-neutral-500 text-sm">
                            {t('app.mpc.mpcNewRequestDialog.chainNotice', {
                                chainId: MPC_SEPOLIA_CHAIN_ID,
                            })}
                        </p>
                        <InputText placeholder="0x..." {...toField} />
                        <InputText
                            helpText={t(
                                'app.mpc.mpcNewRequestDialog.value.helpText',
                            )}
                            placeholder="0.01"
                            {...valueField}
                        />
                        <TextArea
                            helpText={t(
                                'app.mpc.mpcNewRequestDialog.data.helpText',
                            )}
                            isOptional={true}
                            placeholder="0x"
                            {...dataField}
                        />
                        <div className="flex flex-col gap-2">
                            <div>
                                <Button
                                    isLoading={simulate.isPending}
                                    onClick={handleSimulate}
                                    size="sm"
                                    variant="tertiary"
                                >
                                    {t(
                                        'app.mpc.mpcNewRequestDialog.actions.simulate',
                                    )}
                                </Button>
                            </div>
                            {simulate.data != null && (
                                <AlertCard
                                    message={
                                        simulate.data.ok
                                            ? t(
                                                  'app.mpc.mpcNewRequestDialog.simulation.ok',
                                                  {
                                                      gas:
                                                          simulate.data.gas ??
                                                          '',
                                                  },
                                              )
                                            : t(
                                                  'app.mpc.mpcNewRequestDialog.simulation.failed',
                                                  {
                                                      error:
                                                          simulate.data.error ??
                                                          '',
                                                  },
                                              )
                                    }
                                    variant={
                                        simulate.data.ok
                                            ? 'success'
                                            : 'critical'
                                    }
                                />
                            )}
                            <MpcErrorAlert error={simulate.error} />
                        </div>
                    </>
                )}
                {isMessage && (
                    <TextArea
                        helpText={t(
                            'app.mpc.mpcNewRequestDialog.message.helpText',
                        )}
                        placeholder={t(
                            'app.mpc.mpcNewRequestDialog.message.placeholder',
                        )}
                        {...messageField}
                    />
                )}
                {isTypedData && (
                    <TextArea
                        helpText={t(
                            'app.mpc.mpcNewRequestDialog.typedData.helpText',
                        )}
                        placeholder='{"domain":{...},"types":{...},"primaryType":"...","message":{...}}'
                        {...typedDataField}
                    />
                )}
                {!isEditMode && (
                    <Switch
                        checked={editableField.value}
                        helpText={t(
                            'app.mpc.mpcNewRequestDialog.editable.helpText',
                        )}
                        inlineLabel={t(
                            'app.mpc.mpcNewRequestDialog.editable.inlineLabel',
                        )}
                        onCheckedChanged={editableField.onChange}
                    />
                )}
                <MpcErrorAlert error={previewRequest.error} />
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t('app.mpc.mpcNewRequestDialog.actions.review'),
                    onClick: onPreview,
                    isLoading: previewRequest.isPending,
                }}
                secondaryAction={{
                    label: t('app.mpc.mpcNewRequestDialog.actions.cancel'),
                    onClick: handleClose,
                }}
            />
        </>
    );
};
