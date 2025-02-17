import type { ITokenProcessBody } from '@/plugins/tokenPlugin/components/tokenProcessBodyField';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputNumber } from '@aragon/gov-ui-kit';
import type { ICreateProcessFormProposalCreationBody } from '../../../../modules/createDao/components/createProcessForm/createProcessFormDefinitions';

export interface ITokenMinRequirementInputProps {
    /**
     * The body of the process.
     */
    body: ITokenProcessBody;
    /**
     * Prefix to be prepended to the form field.
     */
    fieldPrefix: string;
}

export const TokenMinRequirementInput: React.FC<ITokenMinRequirementInputProps> = (props) => {
    const { fieldPrefix, body } = props;

    const totalSupply = body.members.reduce(
        (supply, member) => ('tokenAmount' in member ? supply + Number(member.tokenAmount) : supply),
        0,
    );

    const { t } = useTranslations();

    const minVotingPowerField = useFormField<ICreateProcessFormProposalCreationBody, 'minVotingPower'>(
        'minVotingPower',
        {
            fieldPrefix,
            defaultValue: '1',
            rules: { validate: (value) => Number(value) > 0 },
            label: t('app.createDao.createProcessForm.permissions.tokenMinRequirementInput.label'),
        },
    );

    return (
        <button className="w-full text-left" onClick={(e) => e.preventDefault()}>
            <InputNumber
                prefix="≥"
                helpText={t('app.createDao.createProcessForm.permissions.tokenMinRequirementInput.helpText')}
                placeholder={t('app.createDao.createProcessForm.permissions.tokenMinRequirementInput.placeholder')}
                max={totalSupply}
                {...minVotingPowerField}
            />
        </button>
    );
};
