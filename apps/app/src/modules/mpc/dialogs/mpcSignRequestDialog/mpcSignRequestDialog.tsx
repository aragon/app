'use client';

import {
    AlertCard,
    DefinitionList,
    Dialog,
    Icon,
    IconType,
    invariant,
    Spinner,
} from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { formatGwei, type Hex } from 'viem';
import {
    MpcApiError,
    mpcServiceKeys,
    useMpcCompleteRequest,
    useMpcPrepareTransaction,
    useMpcServerShare,
    useMpcSession,
} from '@/modules/mpc/api/mpcService';
import type {
    IMpcPrepareTransactionResponse,
    IMpcSignRequest,
    IMpcSystem,
} from '@/modules/mpc/api/mpcService/domain';
import { MpcErrorAlert } from '@/modules/mpc/components/mpcErrorAlert';
import { MpcMockBanner } from '@/modules/mpc/components/mpcMockBanner';
import { MpcOtpInput } from '@/modules/mpc/components/mpcOtpInput';
import { MpcPasswordInput } from '@/modules/mpc/components/mpcPasswordInput';
import { MpcRequestSummary } from '@/modules/mpc/components/mpcRequestSummary';
import { mpcTransactionExplorerUrl } from '@/modules/mpc/constants/mpcConstants';
import { useMpcProvider } from '@/modules/mpc/hooks/useMpcProvider';
import { computeMpcSigningHash } from '@/modules/mpc/utils/mpcSigningHash';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';

export interface IMpcSignRequestDialogParams {
    /**
     * System the request belongs to.
     */
    system: IMpcSystem;
    /**
     * Request to sign (approved or released).
     */
    request: IMpcSignRequest;
}

export interface IMpcSignRequestDialogProps
    extends IDialogComponentProps<IMpcSignRequestDialogParams> {}

interface IMpcSignFormData {
    passphrase: string;
}

/**
 * Review data computed before the server share is requested: the digest that will be signed and, for
 * transactions, the server-prepared fields (nonce / gas / fees).
 */
interface IMpcSignReview {
    hash?: Hex;
    preparedTransaction?: IMpcPrepareTransactionResponse;
}

type MpcSignStep =
    | 'unlocking'
    | 'preparing'
    | 'releasing'
    | 'signing'
    | 'completing';

const signSteps: MpcSignStep[] = [
    'unlocking',
    'preparing',
    'releasing',
    'signing',
    'completing',
];

export const MpcSignRequestDialog: React.FC<IMpcSignRequestDialogProps> = (
    props,
) => {
    const { location } = props;
    invariant(
        location.params != null,
        'MpcSignRequestDialog: required parameters must be set.',
    );
    const { system, request } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();
    const handleClose = () => close(location.id);

    const provider = useMpcProvider(system.providerId);
    const queryClient = useQueryClient();
    const [activeStep, setActiveStep] = useState<MpcSignStep>();
    const [review, setReview] = useState<IMpcSignReview>();
    const [result, setResult] = useState<IMpcSignRequest>();
    const [error, setError] = useState<unknown>();
    const [totpCode, setTotpCode] = useState('');

    // Enrolled users confirm the share release with their authenticator code.
    const { data: session } = useMpcSession();
    const requiresTotp = session?.user.totpEnabled === true;

    const { control, handleSubmit } = useForm<IMpcSignFormData>({
        mode: 'onTouched',
        defaultValues: { passphrase: '' },
    });
    const passphraseField = useFormField<IMpcSignFormData, 'passphrase'>(
        'passphrase',
        {
            control,
            label: t('app.mpc.mpcSignRequestDialog.passphrase.label'),
            rules: { required: true },
            sanitizeMode: 'none',
        },
    );

    const { mutateAsync: releaseServerShare } = useMpcServerShare();
    const { mutateAsync: prepareTransaction } = useMpcPrepareTransaction();
    const { mutateAsync: completeRequest } = useMpcCompleteRequest();

    const isTransaction = request.type === 'transaction';
    const isBusy = activeStep != null && result == null && error == null;
    const isReviewing = review != null && result == null;
    // A completion rejected by the co-signer (signature check / broadcast) marks the request as failed there:
    // the flow cannot be retried. Network errors (request never processed) can be retried.
    const isTerminalError =
        error != null &&
        activeStep === 'completing' &&
        MpcApiError.isMpcApiError(error);

    const invalidateRequests = () =>
        void queryClient.invalidateQueries({
            queryKey: mpcServiceKeys.requests({
                urlParams: { systemId: system.id },
            }),
        });

    // Phase 1: unlock the device share locally and prepare the transaction (nothing is released yet), then show
    // the digest / prepared fields for confirmation.
    const onReview = handleSubmit(async ({ passphrase }) => {
        setError(undefined);

        try {
            setActiveStep('unlocking');
            await provider.verifyDeviceShare({
                systemId: system.id,
                passphrase,
            });

            let preparedTransaction: IMpcPrepareTransactionResponse | undefined;
            if (isTransaction) {
                setActiveStep('preparing');
                preparedTransaction = await prepareTransaction({
                    urlParams: { systemId: system.id, requestId: request.id },
                });
            }

            setReview({
                hash: computeMpcSigningHash(request, preparedTransaction),
                preparedTransaction,
            });
            setActiveStep(undefined);
        } catch (reviewError: unknown) {
            setError(reviewError);
        }
    });

    // Phase 2: release the server share bound to the request, sign in the browser and complete.
    const onSign = handleSubmit(async ({ passphrase }) => {
        const urlParams = { systemId: system.id, requestId: request.id };
        setError(undefined);

        try {
            setActiveStep('releasing');
            const { serverShare } = await releaseServerShare({
                urlParams: { systemId: system.id },
                body: {
                    purpose: 'sign',
                    requestId: request.id,
                    totpCode: requiresTotp ? totpCode : undefined,
                },
            });

            setActiveStep('signing');
            // POC / mock: the key is reconstructed in the browser only inside provider.sign.
            const signed = await provider.sign({
                systemId: system.id,
                passphrase,
                request,
                serverShare,
                preparedTransaction: review?.preparedTransaction,
            });

            setActiveStep('completing');
            const completed = await completeRequest({
                urlParams,
                body: {
                    signature: signed.signature,
                    signedTransaction: signed.signedTransaction,
                },
            });
            setResult(completed);
        } catch (signError: unknown) {
            setError(signError);
            // A rejected / spent code must be re-entered before retrying.
            setTotpCode('');
            // Refresh the list so the request reflects the status stored by the co-signer (released / failed).
            invalidateRequests();
        }
    });

    const handleBack = () => {
        setReview(undefined);
        setActiveStep(undefined);
        setError(undefined);
    };

    const renderStep = (step: MpcSignStep) => {
        const stepIndex = signSteps.indexOf(step);
        const activeIndex =
            activeStep != null ? signSteps.indexOf(activeStep) : -1;
        const isDone =
            result != null ||
            stepIndex < activeIndex ||
            (isReviewing && stepIndex < signSteps.indexOf('releasing'));
        const isCurrent = stepIndex === activeIndex && result == null;
        const isSkipped = step === 'preparing' && !isTransaction;

        if (isSkipped) {
            return null;
        }

        return (
            <li
                className={classNames('flex items-center gap-3', {
                    'text-neutral-800': isDone || isCurrent,
                    'text-neutral-400': !isDone && !isCurrent,
                })}
                key={step}
            >
                {isCurrent && error == null ? (
                    <Spinner size="sm" variant="primary" />
                ) : isCurrent && error != null ? (
                    <Icon
                        className="text-critical-500"
                        icon={IconType.CRITICAL}
                        size="sm"
                    />
                ) : (
                    <Icon
                        className={isDone ? 'text-success-500' : undefined}
                        icon={isDone ? IconType.CHECKMARK : IconType.CLOCK}
                        size="sm"
                    />
                )}
                <span>{t(`app.mpc.mpcSignRequestDialog.steps.${step}`)}</span>
            </li>
        );
    };

    const renderReview = (data: IMpcSignReview) => {
        const prepared = data.preparedTransaction;

        return (
            <div className="flex flex-col gap-4">
                <AlertCard
                    message={t('app.mpc.mpcSignRequestDialog.review.title')}
                    variant="warning"
                >
                    {t('app.mpc.mpcSignRequestDialog.review.description')}
                </AlertCard>
                <DefinitionList.Container>
                    <DefinitionList.Item
                        copyValue={data.hash}
                        term={t('app.mpc.mpcSignRequestDialog.review.hash')}
                    >
                        <span className="break-all font-mono text-sm">
                            {data.hash ??
                                t(
                                    'app.mpc.mpcSignRequestDialog.review.hashUnavailable',
                                )}
                        </span>
                    </DefinitionList.Item>
                    {prepared != null && (
                        <>
                            <DefinitionList.Item
                                term={t(
                                    'app.mpc.mpcSignRequestDialog.review.nonce',
                                )}
                            >
                                {prepared.nonce}
                            </DefinitionList.Item>
                            <DefinitionList.Item
                                term={t(
                                    'app.mpc.mpcSignRequestDialog.review.gas',
                                )}
                            >
                                {prepared.gas}
                            </DefinitionList.Item>
                            <DefinitionList.Item
                                term={t(
                                    'app.mpc.mpcSignRequestDialog.review.maxFeePerGas',
                                )}
                            >
                                {t('app.mpc.mpcSignRequestDialog.review.gwei', {
                                    value: formatGwei(
                                        BigInt(prepared.maxFeePerGasWei),
                                    ),
                                })}
                            </DefinitionList.Item>
                            <DefinitionList.Item
                                term={t(
                                    'app.mpc.mpcSignRequestDialog.review.maxPriorityFeePerGas',
                                )}
                            >
                                {t('app.mpc.mpcSignRequestDialog.review.gwei', {
                                    value: formatGwei(
                                        BigInt(
                                            prepared.maxPriorityFeePerGasWei,
                                        ),
                                    ),
                                })}
                            </DefinitionList.Item>
                        </>
                    )}
                </DefinitionList.Container>
            </div>
        );
    };

    const primaryAction =
        result != null || isTerminalError
            ? {
                  label: t('app.mpc.mpcSignRequestDialog.actions.close'),
                  onClick: handleClose,
              }
            : isReviewing
              ? {
                    label: t(
                        error != null
                            ? 'app.mpc.mpcSignRequestDialog.actions.retry'
                            : 'app.mpc.mpcSignRequestDialog.actions.sign',
                    ),
                    onClick: onSign,
                    isLoading: isBusy,
                    disabled: requiresTotp && totpCode.length !== 6,
                }
              : {
                    label: t(
                        error != null
                            ? 'app.mpc.mpcSignRequestDialog.actions.retry'
                            : 'app.mpc.mpcSignRequestDialog.actions.review',
                    ),
                    onClick: onReview,
                    isLoading: isBusy,
                };

    const secondaryAction =
        result != null || isTerminalError
            ? undefined
            : isReviewing
              ? {
                    label: t('app.mpc.mpcSignRequestDialog.actions.back'),
                    onClick: handleBack,
                    disabled: isBusy,
                }
              : {
                    label: t('app.mpc.mpcSignRequestDialog.actions.cancel'),
                    onClick: handleClose,
                    disabled: isBusy,
                };

    return (
        <>
            <Dialog.Header
                description={t('app.mpc.mpcSignRequestDialog.description')}
                onClose={handleClose}
                title={t('app.mpc.mpcSignRequestDialog.title')}
            />
            <Dialog.Content className="flex flex-col gap-6 px-6 pt-4 pb-6">
                <MpcRequestSummary request={result ?? request} />
                {result == null && !isReviewing && (
                    <>
                        <MpcMockBanner />
                        <MpcPasswordInput
                            autoComplete="off"
                            disabled={isBusy}
                            helpText={t(
                                'app.mpc.mpcSignRequestDialog.passphrase.helpText',
                            )}
                            {...passphraseField}
                        />
                    </>
                )}
                {isReviewing && renderReview(review)}
                {isReviewing && requiresTotp && result == null && (
                    <MpcOtpInput
                        disabled={isBusy}
                        helpText={t(
                            'app.mpc.mpcSignRequestDialog.totp.helpText',
                        )}
                        label={t('app.mpc.mpcSignRequestDialog.totp.label')}
                        onChange={setTotpCode}
                        value={totpCode}
                    />
                )}
                {(activeStep != null || isReviewing) && (
                    <ul className="flex flex-col gap-2 rounded-xl border border-neutral-100 p-4">
                        {signSteps.map(renderStep)}
                    </ul>
                )}
                {result != null && (
                    <AlertCard
                        message={t(
                            `app.mpc.mpcSignRequestDialog.result.${result.status}.title`,
                        )}
                        variant={
                            result.status === 'failed' ? 'critical' : 'success'
                        }
                    >
                        {result.txHash != null ? (
                            <a
                                className="break-all font-mono underline"
                                href={mpcTransactionExplorerUrl(result.txHash)}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                {result.txHash}
                            </a>
                        ) : (
                            <span className="break-all font-mono">
                                {result.signature ?? result.error}
                            </span>
                        )}
                    </AlertCard>
                )}
                <MpcErrorAlert error={error} />
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={primaryAction}
                secondaryAction={secondaryAction}
            />
        </>
    );
};
