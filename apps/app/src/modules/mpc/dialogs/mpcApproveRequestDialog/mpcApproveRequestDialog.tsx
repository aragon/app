'use client';

import { Dialog, invariant } from '@aragon/gov-ui-kit';
import {
    useMpcApproveRequest,
    useMpcRejectRequest,
} from '@/modules/mpc/api/mpcService';
import type { IMpcSignRequest } from '@/modules/mpc/api/mpcService/domain';
import { MpcErrorAlert } from '@/modules/mpc/components/mpcErrorAlert';
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
    const approve = useMpcApproveRequest({ onSuccess: handleClose });
    const reject = useMpcRejectRequest({ onSuccess: handleClose });
    const isPending = approve.isPending || reject.isPending;

    return (
        <>
            <Dialog.Header
                description={t('app.mpc.mpcApproveRequestDialog.description')}
                onClose={handleClose}
                title={t('app.mpc.mpcApproveRequestDialog.title')}
            />
            <Dialog.Content className="flex flex-col gap-6 px-6 pt-4 pb-6">
                <MpcRequestSummary request={request} />
                <MpcErrorAlert error={approve.error ?? reject.error} />
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={
                    canApprove
                        ? {
                              label: t(
                                  'app.mpc.mpcApproveRequestDialog.actions.approve',
                              ),
                              onClick: () => approve.mutate({ urlParams }),
                              isLoading: approve.isPending,
                              disabled: isPending,
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
