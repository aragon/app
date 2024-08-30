import { AdvancedDateInput } from '@/shared/components/advancedDateInput';

export interface IMultisigCreateProposalSettingsFormProps {}

export const MultisigCreateProposalSettingsForm: React.FC<IMultisigCreateProposalSettingsFormProps> = () => {
    return (
        <>
            <AdvancedDateInput
                label="Start Time"
                helpText="Define when a proposal should be active to receive approvals. If now is selected, the proposal is immediately active after publishing."
                useDuration={false}
            />
            <AdvancedDateInput
                label="Expiration Time"
                helpText="Define when a proposal should expire. After the expiration time, there is no way to approve or execute the proposal."
                useDuration={true}
            />
        </>
    );
};
