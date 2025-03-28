import type { ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { CheckboxCard, InputNumber } from '@aragon/gov-ui-kit';
import type { ITokenMember } from '../../types';
import type { ITokenProposalCreationSettingsProps, ITokenVotingBodySettings } from './tokenProposalCreationSettings.api';

export const TokenProposalCreationSettings: React.FC<ITokenProposalCreationSettingsProps> = (props) => {
    const { body, onChange, checked, fieldPrefix } = props;
    const { name, description, internalId } = body;

    const totalSupply = body.membership.members.reduce(
        (supply, member) => ('tokenAmount' in member ? supply + Number(member.tokenAmount) : supply),
        0,
    );

    const { t } = useTranslations();

    const minVotingPowerField = useFormField<
        ISetupBodyForm<ITokenVotingBodySettings, ITokenMember>,
        'governance.minVotingPower'
    >('governance.minVotingPower', {
        fieldPrefix,
        defaultValue: '1',
        rules: { validate: (value) => Number(value) > 0 },
        label: t('app.plugins.token.tokenProposalCreationSettings.label'),
    });

    const handleChange = () => {...}


    return (
        <CheckboxCard
            label={name}
            description={description}
            onCheckedChange={(isChecked) => onChange(internalId, Boolean(isChecked))}
            checked={checked}
        >
            <button className="w-full text-left" onClick={(e) => e.preventDefault()}>
                <InputNumber
                    prefix="≥"
                    helpText={t('app.plugins.token.tokenProposalCreationSettings.helpText')}
                    placeholder={t('app.plugins.token.tokenProposalCreationSettings.placeholder')}
                    max={totalSupply}
                    {...minVotingPowerField}
                />
            </button>
        </CheckboxCard>
    );
};
