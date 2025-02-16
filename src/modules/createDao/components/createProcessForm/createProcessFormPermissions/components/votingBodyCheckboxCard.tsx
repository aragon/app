import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { CheckboxCard } from '@aragon/gov-ui-kit';
import { type ICreateProcessFormBody } from '../../createProcessFormDefinitions';

export interface IVotingBodyCheckboxCardProps {
    /**
     * Body to render the checkbox card for.
     */
    body: ICreateProcessFormBody;
    /**
     * Callback called on body checkbox change.
     */
    onChange: (bodyId: string, checked: boolean) => void;
    /**
     * Defines if the body is checked or not.
     */
    checked: boolean;
    /**
     * Prefix to be used for the body permission settings.
     */
    fieldPrefix: string;
}

export const VotingBodyCheckboxCard: React.FC<IVotingBodyCheckboxCardProps> = (props) => {
    const { body, onChange, checked, fieldPrefix } = props;
    const { name, description, governanceType, id } = body;

    return (
        <CheckboxCard
            label={name}
            description={description}
            onCheckedChange={(isChecked) => onChange(id, Boolean(isChecked))}
            checked={checked}
        >
            <PluginSingleComponent
                slotId={GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_CREATION_REQUIREMENTS}
                pluginId={governanceType}
                body={body}
                fieldPrefix={fieldPrefix}
                Fallback={() => null}
            />
        </CheckboxCard>
    );
};
