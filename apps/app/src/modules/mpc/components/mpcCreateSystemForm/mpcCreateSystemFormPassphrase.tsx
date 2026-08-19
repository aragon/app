'use client';

import { AlertCard } from '@aragon/gov-ui-kit';
import { useFormContext } from 'react-hook-form';
import { MPC_PASSPHRASE_MIN_LENGTH } from '@/modules/mpc/constants/mpcConstants';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { MpcPasswordInput } from '../mpcPasswordInput';
import type { IMpcCreateSystemFormData } from './mpcCreateSystemForm.api';

export interface IMpcCreateSystemFormPassphraseProps {
    /**
     * Locks the fields once the ceremony has used the passphrase.
     */
    disabled?: boolean;
}

export const MpcCreateSystemFormPassphrase: React.FC<
    IMpcCreateSystemFormPassphraseProps
> = (props) => {
    const { disabled } = props;
    const { t } = useTranslations();
    const { getValues } = useFormContext<IMpcCreateSystemFormData>();

    const passphraseField = useFormField<
        IMpcCreateSystemFormData,
        'passphrase'
    >('passphrase', {
        label: t('app.mpc.mpcCreateSystemForm.passphrase.passphrase.label'),
        rules: { required: true, minLength: MPC_PASSPHRASE_MIN_LENGTH },
        sanitizeMode: 'none',
        disabled,
    });
    const confirmField = useFormField<
        IMpcCreateSystemFormData,
        'confirmPassphrase'
    >('confirmPassphrase', {
        label: t('app.mpc.mpcCreateSystemForm.passphrase.confirm.label'),
        rules: {
            required: true,
            validate: (value) =>
                value === getValues('passphrase')
                    ? true
                    : 'app.mpc.mpcCreateSystemForm.passphrase.errors.mismatch',
        },
        sanitizeMode: 'none',
        disabled,
    });

    return (
        <div className="flex flex-col gap-6">
            <AlertCard
                message={t(
                    'app.mpc.mpcCreateSystemForm.passphrase.warning.title',
                )}
                variant="warning"
            >
                {t(
                    'app.mpc.mpcCreateSystemForm.passphrase.warning.description',
                )}
            </AlertCard>
            <MpcPasswordInput
                autoComplete="new-password"
                helpText={t(
                    'app.mpc.mpcCreateSystemForm.passphrase.passphrase.helpText',
                    { min: MPC_PASSPHRASE_MIN_LENGTH },
                )}
                {...passphraseField}
            />
            <MpcPasswordInput autoComplete="new-password" {...confirmField} />
            {disabled && (
                <p className="text-neutral-500 text-sm">
                    {t('app.mpc.mpcCreateSystemForm.passphrase.locked')}
                </p>
            )}
        </div>
    );
};
