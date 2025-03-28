import { CheckboxCard } from '@aragon/gov-ui-kit';
import type { IMultisigVotingBodyCheckboxCardProps } from './multisigVotingBodyCheckboxCard.api';

export const MultisigVotingBodyCheckboxCard: React.FC<IMultisigVotingBodyCheckboxCardProps> = (props) => {
    const { body, onChange, checked } = props;
    const { name, description, internalId } = body;
    return (
        <CheckboxCard
            label={name}
            description={description}
            onCheckedChange={(isChecked) => onChange(internalId, Boolean(isChecked))}
            checked={checked}
        />
    );
};
