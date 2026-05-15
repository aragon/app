'use client';

import {
    AlertCard,
    Dialog,
    IconType,
    invariant,
    TextAreaRichText,
} from '@aragon/gov-ui-kit';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { mainnet } from 'viem/chains';
import { useConnection } from 'wagmi';
import { useDelegateStatement } from '@/shared/api/delegateStatementService';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
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

    const { data: existingStatement } = useDelegateStatement(
        { cid: existingCid ?? '' },
        { enabled: existingCid != null && existingCid.length > 0 },
    );

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
            rules: { required: true },
            control,
        },
    );

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const currentContent = watch('content');
    const isEmpty = currentContent.trim().length === 0;
    const isUnchanged = currentContent === initialContent;
    const isSubmitDisabled = isEmpty || isUnchanged;

    const handleClose = () => close(GovernanceDialogId.DELEGATE_STATEMENT_FORM);

    const handleFormSubmit = (data: IDelegateStatementFormData) => {
        const txParams: IDelegateStatementTransactionDialogParams = {
            ensName,
            network,
            tokenAddress,
            content: data.content,
        };
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
                    <div>
                        <AlertCard
                            message={t(
                                'app.governance.delegateStatementDialog.mainnetSwitch.message',
                            )}
                            variant="warning"
                        />
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
