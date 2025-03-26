import type { IMultisigPluginSettings } from '@/plugins/multisigPlugin/types';
import { NumberProgressInput } from '@/shared/components/forms/numberProgressInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';

export interface IMultisigSetupGovernanceForm extends Pick<IMultisigPluginSettings, 'minApprovals' | 'onlyListed'> {}

export interface IMultisigSetupGovernanceProps {
    /**
     * Field prefix for the form fields. This is expected to always be a sub-form of the main form.
     */
    fieldPrefix: string;
    /**
     * Total number of members in the body of the DAO. It is a prop because it can either come from the API (actions) or
     * from the local members field (create process form).
     */
    membersCount: number;
    /**
     * Whether to show the proposal creation settings (who can vote, any vs members). This option is only used for the
     * update-multisig-settings action.
     */
    showProposalCreationSettings?: boolean;
}

export const MultisigSetupGovernance: React.FC<IMultisigSetupGovernanceProps> = (props) => {
    const { fieldPrefix, membersCount, showProposalCreationSettings = false } = props;

    const { t } = useTranslations();

    // Set default values to minimumApproval and onlyListed values as values are reset when deleting an item from the
    // useArrayField causing the useWatch / useFormField to return undefined before unmounting the component
    const minimumApprovalFieldName = `${fieldPrefix}.minApprovals`;
    const minimumApproval = useWatch<Record<string, IMultisigSetupGovernanceForm['minApprovals']>>({
        name: minimumApprovalFieldName,
        defaultValue: 0,
    });

    const {
        value: onlyListedFieldValue,
        onChange: onOnlyListedFieldChange,
        ...onlyListedField
    } = useFormField<IMultisigSetupGovernanceForm, 'onlyListed'>('onlyListed', {
        fieldPrefix,
        label: t('app.plugins.multisig.multisigSetupGovernance.onlyListed.label'),
        defaultValue: false,
    });

    const handleRadioChange = (value: string) => onOnlyListedFieldChange(value === 'members');

    const majorityThreshold = Math.floor(membersCount / 2);
    const isMinApprovalsMajority = minimumApproval > majorityThreshold;

    const minApprovalContext = isMinApprovalsMajority ? 'majority' : 'minority';
    const minApprovalAlert = {
        message: t(`app.plugins.multisig.multisigSetupGovernance.minimumApproval.alert.${minApprovalContext}`),
        variant: isMinApprovalsMajority ? 'success' : 'warning',
    } as const;

    return (
        <div className="flex w-full flex-col gap-y-6 md:gap-y-10">
            <NumberProgressInput
                fieldName={minimumApprovalFieldName}
                label={t('app.plugins.multisig.multisigSetupGovernance.minimumApproval.label')}
                helpText={t('app.plugins.multisig.multisigSetupGovernance.minimumApproval.helpText')}
                valueLabel={minimumApproval.toString()}
                total={membersCount}
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
