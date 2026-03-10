'use client';

import { Dialog, invariant } from '@aragon/gov-ui-kit';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { TokenWrapForm } from '../../components/tokenMemberPanel/tokenWrap';
import { TokenPluginDialogId } from '../../constants/tokenPluginDialogId';
import { tokenPluginUtils } from '../../utils/tokenPluginUtils';
import type { ITokenWrapOnboardingFormDialogParams } from './tokenWrapOnboardingFormDialog.api';

export interface ITokenWrapOnboardingFormDialogProps
    extends IDialogComponentProps<ITokenWrapOnboardingFormDialogParams> {}

export const TokenWrapOnboardingFormDialog: React.FC<
    ITokenWrapOnboardingFormDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'TokenWrapOnboardingFormDialog: required parameters must be set.',
    );

    const { token, daoId } = location.params;
    const underlyingToken = tokenPluginUtils.getUnderlyingToken(token);

    const { close } = useDialogContext();
    const { t } = useTranslations();

    const handleCancel = () => {
        close(TokenPluginDialogId.WRAP_ONBOARDING_FORM);
    };

    return (
        <>
            <Dialog.Header
                onClose={handleCancel}
                title={t(
                    'app.plugins.token.tokenWrapOnboardingDialog.form.title',
                )}
            />
            <Dialog.Content className="flex w-full flex-col gap-4 pt-4 pb-6">
                <TokenWrapForm
                    daoId={daoId}
                    token={token}
                    underlyingToken={underlyingToken}
                />
            </Dialog.Content>
        </>
    );
};
