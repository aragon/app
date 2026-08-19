'use client';

import { InputText, Switch, TextArea } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import {
    type IMpcPolicyFormData,
    validateAddressList,
    validateApprovals,
    validateChainIds,
    validateEthAmount,
} from './mpcPolicyFormUtils';

export interface IMpcPolicyFormProps {
    /**
     * Prefix of the policy fields inside the parent form.
     */
    fieldPrefix?: string;
}

/**
 * Full IMpcPolicy form (to be rendered inside a FormProvider). Amounts are entered in ETH.
 */
export const MpcPolicyForm: React.FC<IMpcPolicyFormProps> = (props) => {
    const { fieldPrefix } = props;
    const { t } = useTranslations();

    const chainIdsField = useFormField<IMpcPolicyFormData, 'allowedChainIds'>(
        'allowedChainIds',
        {
            fieldPrefix,
            label: t('app.mpc.mpcPolicyForm.allowedChainIds.label'),
            rules: { required: true, validate: validateChainIds },
            trimOnBlur: true,
        },
    );

    const restrictField = useFormField<
        IMpcPolicyFormData,
        'restrictRecipients'
    >('restrictRecipients', { fieldPrefix, defaultValue: false });
    const allowlistField = useFormField<
        IMpcPolicyFormData,
        'recipientAllowlist'
    >('recipientAllowlist', {
        fieldPrefix,
        label: t('app.mpc.mpcPolicyForm.recipientAllowlist.label'),
        rules: { validate: validateAddressList },
        sanitizeMode: 'multiline',
    });

    const maxValueField = useFormField<IMpcPolicyFormData, 'maxValuePerTxEth'>(
        'maxValuePerTxEth',
        {
            fieldPrefix,
            label: t('app.mpc.mpcPolicyForm.maxValuePerTx.label'),
            rules: { validate: validateEthAmount },
            trimOnBlur: true,
        },
    );
    const dailyLimitField = useFormField<IMpcPolicyFormData, 'dailyLimitEth'>(
        'dailyLimitEth',
        {
            fieldPrefix,
            label: t('app.mpc.mpcPolicyForm.dailyLimit.label'),
            rules: { validate: validateEthAmount },
            trimOnBlur: true,
        },
    );
    const approvalAboveField = useFormField<
        IMpcPolicyFormData,
        'requireApprovalAboveEth'
    >('requireApprovalAboveEth', {
        fieldPrefix,
        label: t('app.mpc.mpcPolicyForm.requireApprovalAbove.label'),
        rules: { validate: validateEthAmount },
        trimOnBlur: true,
    });
    const approvalsField = useFormField<
        IMpcPolicyFormData,
        'approvalsRequired'
    >('approvalsRequired', {
        fieldPrefix,
        label: t('app.mpc.mpcPolicyForm.approvalsRequired.label'),
        rules: { required: true, validate: validateApprovals },
        trimOnBlur: true,
    });
    const contractCallsField = useFormField<
        IMpcPolicyFormData,
        'allowContractCalls'
    >('allowContractCalls', { fieldPrefix, defaultValue: true });
    const messageSigningField = useFormField<
        IMpcPolicyFormData,
        'allowMessageSigning'
    >('allowMessageSigning', { fieldPrefix, defaultValue: true });
    const messageApprovalField = useFormField<
        IMpcPolicyFormData,
        'requireApprovalForMessages'
    >('requireApprovalForMessages', { fieldPrefix, defaultValue: false });

    return (
        <div className="flex flex-col gap-6">
            <InputText
                helpText={t('app.mpc.mpcPolicyForm.allowedChainIds.helpText')}
                placeholder="11155111"
                {...chainIdsField}
            />
            <Switch
                checked={restrictField.value}
                helpText={t(
                    'app.mpc.mpcPolicyForm.restrictRecipients.helpText',
                )}
                inlineLabel={t(
                    'app.mpc.mpcPolicyForm.restrictRecipients.inlineLabel',
                )}
                label={t('app.mpc.mpcPolicyForm.restrictRecipients.label')}
                onCheckedChanged={restrictField.onChange}
            />
            {restrictField.value === true && (
                <TextArea
                    helpText={t(
                        'app.mpc.mpcPolicyForm.recipientAllowlist.helpText',
                    )}
                    placeholder="0x..."
                    {...allowlistField}
                />
            )}
            <InputText
                helpText={t('app.mpc.mpcPolicyForm.maxValuePerTx.helpText')}
                isOptional={true}
                placeholder="0.1"
                {...maxValueField}
            />
            <InputText
                helpText={t('app.mpc.mpcPolicyForm.dailyLimit.helpText')}
                isOptional={true}
                placeholder="1"
                {...dailyLimitField}
            />
            <InputText
                helpText={t(
                    'app.mpc.mpcPolicyForm.requireApprovalAbove.helpText',
                )}
                isOptional={true}
                placeholder="0.05"
                {...approvalAboveField}
            />
            <InputText
                helpText={t('app.mpc.mpcPolicyForm.approvalsRequired.helpText')}
                placeholder="1"
                {...approvalsField}
            />
            <Switch
                checked={contractCallsField.value}
                helpText={t(
                    'app.mpc.mpcPolicyForm.allowContractCalls.helpText',
                )}
                inlineLabel={t(
                    'app.mpc.mpcPolicyForm.allowContractCalls.inlineLabel',
                )}
                label={t('app.mpc.mpcPolicyForm.allowContractCalls.label')}
                onCheckedChanged={contractCallsField.onChange}
            />
            <Switch
                checked={messageSigningField.value}
                helpText={t(
                    'app.mpc.mpcPolicyForm.allowMessageSigning.helpText',
                )}
                inlineLabel={t(
                    'app.mpc.mpcPolicyForm.allowMessageSigning.inlineLabel',
                )}
                label={t('app.mpc.mpcPolicyForm.allowMessageSigning.label')}
                onCheckedChanged={messageSigningField.onChange}
            />
            {messageSigningField.value === true && (
                <Switch
                    checked={messageApprovalField.value}
                    helpText={t(
                        'app.mpc.mpcPolicyForm.requireApprovalForMessages.helpText',
                    )}
                    inlineLabel={t(
                        'app.mpc.mpcPolicyForm.requireApprovalForMessages.inlineLabel',
                    )}
                    label={t(
                        'app.mpc.mpcPolicyForm.requireApprovalForMessages.label',
                    )}
                    onCheckedChanged={messageApprovalField.onChange}
                />
            )}
        </div>
    );
};
