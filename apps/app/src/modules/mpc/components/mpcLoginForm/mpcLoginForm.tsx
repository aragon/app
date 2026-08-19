'use client';

import { Button, InputText } from '@aragon/gov-ui-kit';
import { useForm } from 'react-hook-form';
import { useMpcLogin, useMpcRegister } from '@/modules/mpc/api/mpcService';
import type { IMpcSession } from '@/modules/mpc/api/mpcService/domain';
import { MPC_PASSWORD_MIN_LENGTH } from '@/modules/mpc/constants/mpcConstants';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { MpcErrorAlert } from '../mpcErrorAlert';
import { MpcPasswordInput } from '../mpcPasswordInput';

export type MpcLoginFormMode = 'login' | 'register';

export interface IMpcLoginFormData {
    username: string;
    password: string;
}

export interface IMpcLoginFormProps {
    /**
     * Login or register (POC mock auth).
     */
    mode: MpcLoginFormMode;
    /**
     * Callback called when the session has been created.
     */
    onSuccess?: (session: IMpcSession) => void;
}

/**
 * POC mock authentication form (username / password against the mock co-signer).
 */
export const MpcLoginForm: React.FC<IMpcLoginFormProps> = (props) => {
    const { mode, onSuccess } = props;
    const { t } = useTranslations();

    const { control, handleSubmit } = useForm<IMpcLoginFormData>({
        mode: 'onTouched',
        defaultValues: { username: '', password: '' },
    });

    const usernameField = useFormField<IMpcLoginFormData, 'username'>(
        'username',
        {
            control,
            label: t('app.mpc.mpcLoginForm.username.label'),
            rules: { required: true, minLength: 3, maxLength: 32 },
            trimOnBlur: true,
        },
    );
    const passwordField = useFormField<IMpcLoginFormData, 'password'>(
        'password',
        {
            control,
            label: t('app.mpc.mpcLoginForm.password.label'),
            rules: { required: true, minLength: MPC_PASSWORD_MIN_LENGTH },
            sanitizeMode: 'none',
        },
    );

    const login = useMpcLogin({ onSuccess });
    const register = useMpcRegister({ onSuccess });
    const { mutate, isPending, error } = mode === 'login' ? login : register;

    const onSubmit = handleSubmit((values) => mutate({ body: values }));

    return (
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <InputText
                autoComplete="username"
                placeholder={t('app.mpc.mpcLoginForm.username.placeholder')}
                {...usernameField}
            />
            <MpcPasswordInput
                autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                }
                helpText={
                    mode === 'register'
                        ? t('app.mpc.mpcLoginForm.password.helpText', {
                              min: MPC_PASSWORD_MIN_LENGTH,
                          })
                        : undefined
                }
                {...passwordField}
            />
            <MpcErrorAlert error={error} />
            <Button isLoading={isPending} size="lg" type="submit">
                {t(`app.mpc.mpcLoginForm.submit.${mode}`)}
            </Button>
            <p className="text-neutral-500 text-sm">
                {t('app.mpc.mpcLoginForm.disclaimer')}
            </p>
        </form>
    );
};
