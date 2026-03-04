'use client';

import { Dialog, EmptyState, invariant } from '@aragon/gov-ui-kit';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { TokenPluginDialogId } from '../../constants/tokenPluginDialogId';
import type { ITokenDelegationOnboardingDialogParams } from './tokenDelegationOnboardingDialog.api';

export interface ITokenDelegationOnboardingIntroDialogProps
    extends IDialogComponentProps<ITokenDelegationOnboardingDialogParams> {}

export const TokenDelegationOnboardingIntroDialog: React.FC<
    ITokenDelegationOnboardingIntroDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'TokenDelegationOnboardingIntroDialog: required parameters must be set.',
    );

    const { tokenAddress, tokenSymbol, daoId } = location.params;

    const { open, close } = useDialogContext();
    const { t } = useTranslations();

    const handleSetupDelegation = () => {
        open(TokenPluginDialogId.DELEGATION_ONBOARDING, {
            params: { tokenAddress, tokenSymbol, daoId },
            stack: false,
        });
    };

    const handleCancel = () => {
        close(TokenPluginDialogId.DELEGATION_ONBOARDING_INTRO);
    };

    return (
        <Dialog.Content className="flex flex-col items-center gap-4">
            <EmptyState
                description={t(
                    'app.plugins.token.tokenDelegationOnboardingDialog.intro.description',
                )}
                heading={t(
                    'app.plugins.token.tokenDelegationOnboardingDialog.intro.title',
                    { tokenSymbol },
                )}
                humanIllustration={{
                    body: 'ELEVATING',
                    hairs: 'SHORT',
                    accessory: 'PIERCINGS_TATTOO',
                    sunglasses: 'LARGE_STYLIZED',
                    expression: 'SMILE_WINK',
                }}
                primaryButton={{
                    label: t(
                        'app.plugins.token.tokenDelegationOnboardingDialog.intro.cta',
                    ),
                    onClick: handleSetupDelegation,
                    className: 'sm:w-max',
                }}
                secondaryButton={{
                    label: t(
                        'app.plugins.token.tokenDelegationOnboardingDialog.intro.cancel',
                    ),
                    onClick: handleCancel,
                }}
            />
        </Dialog.Content>
    );
};
