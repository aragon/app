import type { ICreateProcessFormProposalCreationBody } from '@/modules/createDao/components/createProcessForm';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { CheckboxCard, InputNumber } from '@aragon/gov-ui-kit';
import type { ITokenVotingBodyCheckboxCardProps, ITokenVotingBodySettings } from './tokenVotingBodyCheckboxCard.api';

type TokenVotingBody = ICreateProcessFormProposalCreationBody<ITokenVotingBodySettings>;

export const TokenVotingBodyCheckboxCard: React.FC<ITokenVotingBodyCheckboxCardProps> = (props) => {
    const { body, onChange, checked, fieldPrefix } = props;
    const { name, description, internalId } = body;

    const totalSupply = body.membership.members.reduce(
        (supply, member) => ('tokenAmount' in member ? supply + Number(member.tokenAmount) : supply),
        0,
    );

    const { t } = useTranslations();

    const minVotingPowerField = useFormField<TokenVotingBody, 'settings.minVotingPower'>('settings.minVotingPower', {
        fieldPrefix,
        defaultValue: '1',
        rules: { validate: (value) => Number(value) > 0 },
        label: t('app.plugins.token.tokenProposalCreationRequirements.label'),
    });

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
