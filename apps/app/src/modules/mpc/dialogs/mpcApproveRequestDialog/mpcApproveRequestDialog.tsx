'use client';

import { Dialog, invariant } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import {
    useMpcApproveRequest,
    useMpcRejectRequest,
    useMpcSession,
} from '@/modules/mpc/api/mpcService';
import type { IMpcSignRequest } from '@/modules/mpc/api/mpcService/domain';
import { MpcErrorAlert } from '@/modules/mpc/components/mpcErrorAlert';
import { MpcOtpInput } from '@/modules/mpc/components/mpcOtpInput';
import { MpcRequestSummary } from '@/modules/mpc/components/mpcRequestSummary';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IMpcApproveRequestDialogParams {
    /**
     * Request to review.
     */
    request: IMpcSignRequest;
    /**
     * Whether the current user can approve the request.
     */
    canApprove: boolean;
    /**
     * Whether the current user can reject the request.
     */
    canReject: boolean;
}

export interface IMpcApproveRequestDialogProps
    extends IDialogComponentProps<IMpcApproveRequestDialogParams> {}

export const MpcApproveRequestDialog: React.FC<
    IMpcApproveRequestDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'MpcApproveRequestDialog: required parameters must be set.',
    );
    const { request, canApprove, canReject } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();
    const handleClose = () => close(location.id);

    const urlParams = { systemId: request.systemId, requestId: request.id };
    const [totpCode, setTotpCode] = useState('');
    const approve = useMpcApproveRequest({
        onSuccess: handleClose,
        // A rejected / spent code must be re-entered before retrying.
        onError: () => setTotpCode(''),
    });
    const reject = useMpcRejectRequest({ onSuccess: handleClose });
    const isPending = approve.isPending || reject.isPending;

    // Enrolled approvers confirm the approval with their authenticator code.
    const { data: session } = useMpcSession();
    const requiresTotp = session?.user.totpEnabled === true;

    const handleApprove = () =>
        approve.mutate({
            urlParams,
            body: { totpCode: requiresTotp ? totpCode : undefined },
        });

    return (
        <>
            <Dialog.Header
                description={t('app.mpc.mpcApproveRequestDialog.description')}
                onClose={handleClose}
                title={t('app.mpc.mpcApproveRequestDialog.title')}
            />
            <Dialog.Content className="flex flex-col gap-6 px-6 pt-4 pb-6">
                <MpcRequestSummary request={request} />
                {canApprove && requiresTotp && (
                    <MpcOtpInput
                        disabled={isPending}
                        helpText={t(
                            'app.mpc.mpcApproveRequestDialog.totp.helpText',
                        )}
                        label={t('app.mpc.mpcApproveRequestDialog.totp.label')}
                        onChange={setTotpCode}
                        value={totpCode}
                    />
                )}
                <MpcErrorAlert error={approve.error ?? reject.error} />
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={
                    canApprove
                        ? {
                              label: t(
                                  'app.mpc.mpcApproveRequestDialog.actions.approve',
                              ),
                              onClick: handleApprove,
                              isLoading: approve.isPending,
                              disabled:
                                  isPending ||
                                  (requiresTotp && totpCode.length !== 6),
                          }
                        : undefined
                }
                secondaryAction={
                    canReject
                        ? {
                              label: t(
                                  'app.mpc.mpcApproveRequestDialog.actions.reject',
                              ),
                              onClick: () => reject.mutate({ urlParams }),
                              isLoading: reject.isPending,
                              disabled: isPending,
                          }
                        : {
                              label: t(
                                  'app.mpc.mpcApproveRequestDialog.actions.close',
                              ),
                              onClick: handleClose,
                          }
                }
            />
        </>
    );
};
