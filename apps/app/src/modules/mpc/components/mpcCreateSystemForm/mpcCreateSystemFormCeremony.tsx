'use client';

import { AlertCard, Button, Icon, IconType, Spinner } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useEffect } from 'react';
import type { MpcCeremonyStep } from '@/modules/mpc/providers';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { MpcErrorAlert } from '../mpcErrorAlert';
import { MpcMockBanner } from '../mpcMockBanner';
import { MpcRecoveryShareCard } from '../mpcRecoveryShareCard';
import type { IMpcCreateSystemFormData } from './mpcCreateSystemForm.api';

export type MpcCeremonyStatus = 'idle' | 'running' | 'done' | 'error';

export interface IMpcCeremonyState {
    /**
     * Status of the ceremony.
     */
    status: MpcCeremonyStatus;
    /**
     * Current / last reached provider step.
     */
    step?: MpcCeremonyStep;
    /**
     * ID of the created system (available once the system has been created on the co-signer).
     */
    systemId?: string;
    /**
     * Address derived from the generated key.
     */
    address?: string;
    /**
     * Serialized recovery share (shown once). Undefined when the key had already been registered by a previous
     * attempt (the share of that attempt cannot be shown again).
     */
    recoveryShareText?: string;
    /**
     * Set when a retry found the key already registered on the co-signer: no new key was generated.
     */
    keyAlreadyRegistered?: boolean;
    /**
     * Error of the ceremony when failed.
     */
    error?: unknown;
}

export interface IMpcCreateSystemFormCeremonyProps {
    /**
     * State of the ceremony (owned by the page so it survives step navigation).
     */
    state: IMpcCeremonyState;
    /**
     * Starts (or retries) the ceremony.
     */
    onStart: () => void;
}

const ceremonySteps: MpcCeremonyStep[] = [
    'generating',
    'splitting',
    'storing_device_share',
    'registering_server_share',
    'done',
];

export const MpcCreateSystemFormCeremony: React.FC<
    IMpcCreateSystemFormCeremonyProps
> = (props) => {
    const { state, onStart } = props;
    const { t } = useTranslations();

    const {
        value: acknowledged,
        onChange: onAcknowledgedChange,
        alert,
    } = useFormField<IMpcCreateSystemFormData, 'recoveryAcknowledged'>(
        'recoveryAcknowledged',
        {
            label: t('app.mpc.mpcCreateSystemForm.ceremony.acknowledge.label'),
            rules: {
                // No recovery share to acknowledge when the key was registered by a previous attempt.
                validate: (value) =>
                    value === true || state.recoveryShareText == null
                        ? true
                        : 'app.mpc.mpcCreateSystemForm.ceremony.errors.acknowledge',
            },
            defaultValue: false,
        },
    );

    const { status } = state;

    // Start the ceremony automatically when the step is displayed for the first time.
    useEffect(() => {
        if (status === 'idle') {
            onStart();
        }
    }, [status, onStart]);

    const activeIndex =
        state.step != null ? ceremonySteps.indexOf(state.step) : -1;

    return (
        <div className="flex flex-col gap-6">
            <MpcMockBanner />
            <ul className="flex flex-col gap-2 rounded-xl border border-neutral-100 p-4">
                {ceremonySteps.map((step, index) => {
                    const isDone =
                        status === 'done' ||
                        index < activeIndex ||
                        (index === activeIndex && step === 'done');
                    const isCurrent =
                        index === activeIndex && status === 'running';
                    const isFailed =
                        index === activeIndex && status === 'error';

                    return (
                        <li
                            className={classNames('flex items-center gap-3', {
                                'text-neutral-800': isDone || isCurrent,
                                'text-critical-600': isFailed,
                                'text-neutral-400':
                                    !isDone && !isCurrent && !isFailed,
                            })}
                            key={step}
                        >
                            {isCurrent ? (
                                <Spinner size="sm" variant="primary" />
                            ) : (
                                <Icon
                                    className={
                                        isDone
                                            ? 'text-success-500'
                                            : isFailed
                                              ? 'text-critical-500'
                                              : undefined
                                    }
                                    icon={
                                        isFailed
                                            ? IconType.CRITICAL
                                            : isDone
                                              ? IconType.CHECKMARK
                                              : IconType.CLOCK
                                    }
                                    size="sm"
                                />
                            )}
                            <span>
                                {t(
                                    `app.mpc.mpcCreateSystemForm.ceremony.steps.${step}`,
                                )}
                            </span>
                        </li>
                    );
                })}
            </ul>
            {status === 'error' && (
                <div className="flex flex-col gap-3">
                    <MpcErrorAlert error={state.error} />
                    <div>
                        <Button onClick={onStart} size="md" variant="secondary">
                            {t('app.mpc.mpcCreateSystemForm.ceremony.retry')}
                        </Button>
                    </div>
                </div>
            )}
            {status === 'done' && state.keyAlreadyRegistered === true && (
                <AlertCard
                    message={t(
                        'app.mpc.mpcCreateSystemForm.ceremony.alreadyRegistered.title',
                    )}
                    variant="warning"
                >
                    {t(
                        'app.mpc.mpcCreateSystemForm.ceremony.alreadyRegistered.description',
                        { address: state.address ?? '' },
                    )}
                </AlertCard>
            )}
            {status === 'done' && state.recoveryShareText != null && (
                <>
                    {state.address != null && (
                        <p className="text-neutral-500 text-sm">
                            {t('app.mpc.mpcCreateSystemForm.ceremony.address', {
                                address: state.address,
                            })}
                        </p>
                    )}
                    <MpcRecoveryShareCard
                        acknowledged={acknowledged === true}
                        alertMessage={alert?.message}
                        fileName={`aragon-mpc-recovery-${state.systemId ?? 'system'}-epoch-1.txt`}
                        onAcknowledgedChange={onAcknowledgedChange}
                        recoveryShareText={state.recoveryShareText}
                    />
                </>
            )}
        </div>
    );
};
