import { CheckboxCard } from '@aragon/gov-ui-kit';
import type { IMultisigVotingBodyCheckboxCardProps } from './multisigVotingBodyCheckboxCard.api';

export const MultisigVotingBodyCheckboxCard: React.FC<IMultisigVotingBodyCheckboxCardProps> = (props) => {
    const { body, onChange, checked } = props;
    const { name, description, id } = body;
    return (
        <CheckboxCard
            label={name}
            description={description}
            onCheckedChange={(isChecked) => onChange(id, Boolean(isChecked))}
            checked={checked}
        />
    );
};
