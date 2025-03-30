import { NumberProgressInput } from '@/shared/components/forms/numberProgressInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';
import type { IMultisigSetupGovernanceForm, IMultisigSetupGovernanceProps } from './multisigSetupGovernance.api';

export const MultisigSetupGovernance: React.FC<IMultisigSetupGovernanceProps> = (props) => {
    const { formPrefix, membershipSettings, showProposalCreationSettings = false } = props;

    const { t } = useTranslations();

    // Set default values to minApprovals and onlyListed values as values are reset when deleting an item from the
    // useArrayField causing the useWatch / useFormField to return undefined before unmounting the component
    const minApprovalsFieldName = `${formPrefix}.minApprovals`;
    const minApprovalsFieldValue = useWatch<Record<string, IMultisigSetupGovernanceForm['minApprovals']>>({
        name: minApprovalsFieldName,
        defaultValue: 0,
    });

    const {
        value: onlyListedFieldValue,
        onChange: onOnlyListedFieldChange,
        ...onlyListedField
    } = useFormField<IMultisigSetupGovernanceForm, 'onlyListed'>('onlyListed', {
        fieldPrefix: formPrefix,
        label: t('app.plugins.multisig.multisigSetupGovernance.onlyListed.label'),
        defaultValue: false,
    });

    const handleRadioChange = (value: string) => onOnlyListedFieldChange(value === 'members');

    const membersCount = membershipSettings.members?.length ?? membershipSettings.membersCount ?? 0;
    const majorityThreshold = Math.floor(membersCount / 2);
    const isMinApprovalsMajority = minApprovalsFieldValue > majorityThreshold;

    const minApprovalContext = isMinApprovalsMajority ? 'majority' : 'minority';
    const minApprovalAlert = {
        message: t(`app.plugins.multisig.multisigSetupGovernance.minimumApproval.alert.${minApprovalContext}`),
        variant: isMinApprovalsMajority ? 'success' : 'warning',
    } as const;

    return (
        <div className="flex w-full flex-col gap-y-6 md:gap-y-10">
            <NumberProgressInput
                fieldName={minApprovalsFieldName}
                label={t('app.plugins.multisig.multisigSetupGovernance.minimumApproval.label')}
                helpText={t('app.plugins.multisig.multisigSetupGovernance.minimumApproval.helpText')}
                valueLabel={minApprovalsFieldValue.toString()}
                total={membersCount}
                min={1}
                totalLabel={t('app.plugins.multisig.multisigSetupGovernance.minimumApproval.total', {
                    total: membersCount,
                })}
                alert={minApprovalAlert}
            />
            {showProposalCreationSettings && (
                <RadioGroup
                    helpText={t('app.plugins.multisig.multisigSetupGovernance.onlyListed.helpText')}
                    className="w-full"
                    onValueChange={handleRadioChange}
                    value={onlyListedFieldValue ? 'members' : 'any'}
                    {...onlyListedField}
                >
                    <RadioCard
                        label={t('app.plugins.multisig.multisigSetupGovernance.onlyListed.members.label')}
                        description={t('app.plugins.multisig.multisigSetupGovernance.onlyListed.members.description')}
                        value="members"
                    />
                    <RadioCard
                        label={t('app.plugins.multisig.multisigSetupGovernance.onlyListed.anyWallet.label')}
                        description={t('app.plugins.multisig.multisigSetupGovernance.onlyListed.anyWallet.description')}
                        value="any"
                    />
                </RadioGroup>
            )}
        </div>
    );
};
