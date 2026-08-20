'use client';

import { Button, Clipboard, Heading } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import QRCode from 'react-qr-code';
import {
    useMpcTotpSetup,
    useMpcTotpVerify,
} from '@/modules/mpc/api/mpcService';
import { MpcErrorAlert } from '@/modules/mpc/components/mpcErrorAlert';
import { MpcOtpInput } from '@/modules/mpc/components/mpcOtpInput';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IMpcTotpEnrollmentProps {
    /**
     * Callback called once the enrollment is confirmed.
     */
    onSuccess?: () => void;
}

/**
 * TOTP enrollment: fetches a fresh secret from the co-signer, renders it as a QR code (plus the base32 secret
 * for manual entry) and confirms the enrollment with the first code of the authenticator app.
 */
export const MpcTotpEnrollment: React.FC<IMpcTotpEnrollmentProps> = (props) => {
    const { onSuccess } = props;

    const { t } = useTranslations();
    const [code, setCode] = useState('');

    // Setup is a query (idempotent POST): mounting the screen fetches the pending secret.
    const setup = useMpcTotpSetup();
    const verify = useMpcTotpVerify({ onSuccess });

    const handleVerify = (totpCode: string) => {
        if (totpCode.length === 6 && !verify.isPending) {
            verify.mutate({ body: { totpCode } });
        }
    };

    const handleCodeChange = (newCode: string) => {
        verify.reset();
        setCode(newCode);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <Heading size="h3">
                    {t('app.mpc.mpcTotpEnrollment.title')}
                </Heading>
                <p className="text-neutral-500 text-sm">
                    {t('app.mpc.mpcTotpEnrollment.description')}
                </p>
            </div>
            {setup.data != null && (
                <>
                    <div className="flex flex-col items-center gap-4 rounded-xl border border-neutral-100 bg-neutral-0 p-6 md:flex-row md:items-start">
                        <div className="rounded-lg bg-white p-3">
                            <QRCode size={144} value={setup.data.otpauthUri} />
                        </div>
                        <div className="flex min-w-0 flex-col gap-2">
                            <p className="text-neutral-500 text-sm">
                                {t('app.mpc.mpcTotpEnrollment.secretLabel')}
                            </p>
                            <div className="flex items-start gap-2">
                                <code className="break-all font-mono text-neutral-800 text-sm">
                                    {setup.data.secret}
                                </code>
                                <Clipboard copyValue={setup.data.secret} />
                            </div>
                        </div>
                    </div>
                    <MpcOtpInput
                        autoFocus={true}
                        disabled={verify.isPending}
                        errorMessage={
                            verify.error != null
                                ? t('app.mpc.mpcTotpEnrollment.codeError')
                                : undefined
                        }
                        helpText={t('app.mpc.mpcTotpEnrollment.codeHelpText')}
                        label={t('app.mpc.mpcTotpEnrollment.codeLabel')}
                        onChange={handleCodeChange}
                        onComplete={handleVerify}
                        value={code}
                    />
                    <div>
                        <Button
                            disabled={code.length !== 6}
                            isLoading={verify.isPending}
                            onClick={() => handleVerify(code)}
                            size="lg"
                            variant="primary"
                        >
                            {t('app.mpc.mpcTotpEnrollment.confirm')}
                        </Button>
                    </div>
                </>
            )}
            <MpcErrorAlert error={setup.error} />
        </div>
    );
};
