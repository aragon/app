'use client';

import { Dialog, EmptyState, invariant } from '@aragon/gov-ui-kit';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { TokenPluginDialogId } from '../../constants/tokenPluginDialogId';
import type { ITokenPluginSettingsToken } from '../../types';
import { tokenPluginUtils } from '../../utils/tokenPluginUtils';

export interface ITokenWrapOnboardingIntroDialogParams {
    token: ITokenPluginSettingsToken;
    daoId: string;
}

export interface ITokenWrapOnboardingIntroDialogProps
    extends IDialogComponentProps<ITokenWrapOnboardingIntroDialogParams> {}

export const TokenWrapOnboardingIntroDialog: React.FC<
    ITokenWrapOnboardingIntroDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'TokenWrapOnboardingIntroDialog: required parameters must be set.',
    );

    const { token, daoId } = location.params;
    const underlyingToken = tokenPluginUtils.getUnderlyingToken(token);

    const { open, close } = useDialogContext();
    const { t } = useTranslations();

    const handleWrapTokens = () => {
        open(TokenPluginDialogId.WRAP_ONBOARDING_FORM, {
            params: { token, daoId },
        });
    };

    const handleCancel = () => {
        close(TokenPluginDialogId.WRAP_ONBOARDING_INTRO);
    };

    return (
        <Dialog.Content className="flex flex-col items-center gap-4">
            <EmptyState
                description={t(
                    'app.plugins.token.tokenWrapOnboardingDialog.intro.description',
                )}
                heading={t(
                    'app.plugins.token.tokenWrapOnboardingDialog.intro.title',
                    { underlyingTokenSymbol: underlyingToken.symbol },
                )}
                objectIllustration={{ object: 'WALLET' }}
                primaryButton={{
                    label: t(
                        'app.plugins.token.tokenWrapOnboardingDialog.intro.cta',
                    ),
                    onClick: handleWrapTokens,
                    className: 'sm:w-max',
                }}
                secondaryButton={{
                    label: t(
                        'app.plugins.token.tokenWrapOnboardingDialog.intro.cancel',
                    ),
                    onClick: handleCancel,
                }}
            />
        </Dialog.Content>
    );
};
