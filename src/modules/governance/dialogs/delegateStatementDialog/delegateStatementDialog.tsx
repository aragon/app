'use client';

import {
    AlertCard,
    Button,
    Dialog,
    IconType,
    invariant,
    TextAreaRichText,
} from '@aragon/gov-ui-kit';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { mainnet } from 'viem/chains';
import { useConnection, useSwitchChain } from 'wagmi';
import { useIpfsJson } from '@/shared/api/ipfsService';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import {
    type IDelegateStatement,
    isDelegateStatement,
} from '../../components/delegationStatementCard/delegateStatement.api';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
import type { IDelegateStatementTransactionDialogParams } from '../delegateStatementTransactionDialog';
import type { IDelegateStatementDialogParams } from './delegateStatementDialog.api';

interface IDelegateStatementFormData {
    content: string;
}

export interface IDelegateStatementDialogProps
    extends IDialogComponentProps<IDelegateStatementDialogParams> {}

export const DelegateStatementDialog: React.FC<
    IDelegateStatementDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'DelegateStatementDialog: required parameters must be set.',
    );

    const { existingCid, ensName, network, tokenAddress } = location.params;

    const { close, open } = useDialogContext();
    const { t } = useTranslations();
    const { chainId } = useConnection();
    const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

    const { data: existingStatement } = useIpfsJson<IDelegateStatement>({
        cid: existingCid ?? null,
        validate: isDelegateStatement,
    });

    const isOnMainnet = chainId === mainnet.id;
    const initialContent = existingStatement?.content ?? '';

    const defaultValues = useMemo<IDelegateStatementFormData>(
        () => ({ content: initialContent }),
        [initialContent],
    );

    const { handleSubmit, control, watch, reset } =
        useForm<IDelegateStatementFormData>({
            mode: 'onTouched',
            defaultValues,
        });

    const contentField = useFormField<IDelegateStatementFormData, 'content'>(
        'content',
        {
            label: t('app.governance.delegateStatementDialog.content.label'),
            rules: {
                required: true,
                validate: (value) =>
                    typeof value === 'string' && value.trim().length > 0,
            },
            control,
        },
    );

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const currentContent = watch('content');
    const isEmpty = currentContent.trim().length === 0;
    const isUnchanged = currentContent === initialContent;
    const isSubmitDisabled = isEmpty || isUnchanged || !isOnMainnet;

    const handleClose = () => close(GovernanceDialogId.DELEGATE_STATEMENT_FORM);

    const handleSwitchToMainnet = () => {
        switchChain({ chainId: mainnet.id });
    };

    const handleFormSubmit = (data: IDelegateStatementFormData) => {
        const txParams: IDelegateStatementTransactionDialogParams = {
            ensName,
            network,
            tokenAddress,
            content: data.content,
        };
        close(GovernanceDialogId.DELEGATE_STATEMENT_FORM);
        open(GovernanceDialogId.DELEGATE_STATEMENT_TRANSACTION, {
            params: txParams,
        });
    };

    return (
        <>
            <Dialog.Header
                onClose={handleClose}
                title={t('app.governance.delegateStatementDialog.title')}
            />
            <Dialog.Content className="flex w-full flex-col gap-4 pt-4 pb-6">
                {!isOnMainnet && (
                    <div className="flex flex-col gap-3">
                        <AlertCard
                            message={t(
                                'app.governance.delegateStatementDialog.mainnetSwitch.message',
                            )}
                            variant="warning"
                        />
                        <Button
                            disabled={isSwitchingChain}
                            onClick={handleSwitchToMainnet}
                            size="md"
                            variant="secondary"
                        >
                            {t(
                                'app.governance.delegateStatementDialog.mainnetSwitch.action',
                            )}
                        </Button>
                    </div>
                )}
                <TextAreaRichText
                    helpText={t(
                        'app.governance.delegateStatementDialog.content.helpText',
                    )}
                    immediatelyRender={false}
                    valueFormat="markdown"
                    {...contentField}
                />
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t('app.governance.delegateStatementDialog.submit'),
                    iconRight: IconType.CHEVRON_RIGHT,
                    disabled: isSubmitDisabled,
                    onClick: handleSubmit(handleFormSubmit),
                }}
                secondaryAction={{
                    label: t('app.governance.delegateStatementDialog.cancel'),
                    onClick: handleClose,
                }}
            />
        </>
    );
};
