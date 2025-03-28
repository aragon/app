import { ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { CheckboxCard, InputNumber } from '@aragon/gov-ui-kit';
import { ITokenMember } from '../../types';
import type { ITokenVotingBodyCheckboxCardProps, ITokenVotingBodySettings } from './tokenVotingBodyCheckboxCard.api';

export const TokenVotingBodyCheckboxCard: React.FC<ITokenVotingBodyCheckboxCardProps> = (props) => {
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
        label: t('app.plugins.token.tokenProposalCreationRequirements.label'),
    });

    console.log('body', body);
    console.log('minVotingPowerField', minVotingPowerField);

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
                    helpText={t('app.plugins.token.tokenProposalCreationRequirements.helpText')}
                    placeholder={t('app.plugins.token.tokenProposalCreationRequirements.placeholder')}
                    max={totalSupply}
                    {...minVotingPowerField}
                />
            </button>
        </CheckboxCard>
    );
};
