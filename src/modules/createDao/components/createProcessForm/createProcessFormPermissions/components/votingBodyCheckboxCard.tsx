import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { CheckboxCard } from '@aragon/gov-ui-kit';
import type { ICreateProcessFormData } from '../../createProcessFormDefinitions';

export interface IVotingBodyCheckboxCardProps {
    /**
     * Body to render the checkbox card for.
     */
    body: ICreateProcessFormData['bodies'][number];
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
    const { name, description, plugin, id } = body;

    const LoadedComponent = pluginRegistryUtils.getSlotComponent({
        slotId: CreateDaoSlotId.CREATE_DAO_PROPOSAL_CREATION_REQUIREMENTS,
        pluginId: plugin,
    });

    return (
        <CheckboxCard
            label={name}
            description={description}
            onCheckedChange={(isChecked) => onChange(id, Boolean(isChecked))}
            checked={checked}
        >
            {LoadedComponent && <LoadedComponent body={body} fieldPrefix={fieldPrefix} />}
        </CheckboxCard>
    );
};
