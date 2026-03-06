'use client';

import { Dialog, invariant } from '@aragon/gov-ui-kit';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { TokenDelegationForm } from '../../components/tokenMemberPanel/tokenDelegation';
import { TokenPluginDialogId } from '../../constants/tokenPluginDialogId';
import type { ITokenDelegationOnboardingDialogParams } from './tokenDelegationOnboardingFormDialog.api';

export interface ITokenDelegationOnboardingFormDialogProps
    extends IDialogComponentProps<ITokenDelegationOnboardingDialogParams> {}

export const TokenDelegationOnboardingFormDialog: React.FC<
    ITokenDelegationOnboardingFormDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'TokenDelegationOnboardingFormDialog: required parameters must be set.',
    );

    const { tokenAddress, daoId } = location.params;

    const { close } = useDialogContext();
    const { t } = useTranslations();

    const handleCancel = () => {
        close(TokenPluginDialogId.DELEGATION_ONBOARDING);
    };

    return (
        <>
            <Dialog.Header
                onClose={handleCancel}
                title={t(
                    'app.plugins.token.tokenDelegationOnboardingDialog.form.title',
                )}
            />
            <Dialog.Content className="flex w-full flex-col gap-4 pt-4 pb-6">
                <TokenDelegationForm
                    daoId={daoId}
                    mode="dialog"
                    onCancel={handleCancel}
                    tokenAddress={tokenAddress}
                />
            </Dialog.Content>
        </>
    );
};
