import type { ICreateProcessFormProposalCreationBody } from '@/modules/createDao/components/createProcessForm/createProcessFormDefinitions';
import type { ITokenProcessBody } from '@/plugins/tokenPlugin/components/tokenProcessBodyField';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputNumber } from '@aragon/gov-ui-kit';

export interface ITokenProposalCreationRequirementsProps {
    /**
     * The body of the process.
     */
    body: ITokenProcessBody;
    /**
     * Prefix to be prepended to the form field.
     */
    fieldPrefix: string;
}

export const TokenProposalCreationRequirements: React.FC<ITokenProposalCreationRequirementsProps> = (props) => {
    const { fieldPrefix, body } = props;

    const totalSupply = body.members.reduce(
        (supply, member) => ('tokenAmount' in member ? supply + Number(member.tokenAmount) : supply),
        0,
    );

    const { t } = useTranslations();
    const keyNamespace = `app.plugins.token.tokenProposalCreationRequirements`;

    const minVotingPowerField = useFormField<ICreateProcessFormProposalCreationBody, 'minVotingPower'>(
        'minVotingPower',
        {
            fieldPrefix,
            defaultValue: '1',
            rules: { validate: (value) => Number(value) > 0 },
            label: t(`${keyNamespace}.label`),
        },
    );

    return (
        <button className="w-full text-left" onClick={(e) => e.preventDefault()}>
            <InputNumber
                prefix="≥"
                helpText={t(`${keyNamespace}.helpText`)}
                placeholder={t(`${keyNamespace}.placeholder`)}
                max={totalSupply}
                {...minVotingPowerField}
            />
        </button>
    );
};
