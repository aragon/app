import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputNumber } from '@aragon/gov-ui-kit';
import type { ICreateProcessFormProposalCreationBody } from '../../createProcessFormDefinitions';

export interface ITokenMinRequirementInputProps {
    /**
     * Total supply of the token.
     */
    totalSupply: number;
    /**
     * Prefix to be prepended to the form field.
     */
    fieldPrefix: string;
}

export const TokenMinRequirementInput: React.FC<ITokenMinRequirementInputProps> = (props) => {
    const { fieldPrefix, totalSupply } = props;

    const { t } = useTranslations();

    const minVotingPowerField = useFormField<ICreateProcessFormProposalCreationBody, 'minVotingPower'>(
        'minVotingPower',
        {
            fieldPrefix,
            defaultValue: '1',
            label: t('app.createDao.createProcessForm.permissions.tokenMinRequirementInput.label'),
        },
    );

    return (
        <button className="w-full text-left" onClick={(e) => e.preventDefault()}>
            <InputNumber
                prefix="≥"
                helpText={t('app.createDao.createProcessForm.permissions.tokenMinRequirementInput.helpText')}
                placeholder={t('app.createDao.createProcessForm.permissions.tokenMinRequirementInput.placeholder')}
                min={0}
                max={totalSupply}
                {...minVotingPowerField}
            />
        </button>
    );
};
