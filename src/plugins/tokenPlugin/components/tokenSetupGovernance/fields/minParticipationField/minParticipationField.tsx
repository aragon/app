import { NumberProgressInput } from '@/shared/components/forms/numberProgressInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';
import { formatUnits } from 'viem';
import type { ITokenSetupGovernanceForm, ITokenSetupGovernanceProps } from '../../tokenSetupGovernance.api';

export interface IMinParticipationFieldProps {
    /**
     * Prefix to be prepended to the form field.
     */
    formPrefix: string;
    /**
     * The token linked to the plugin.
     */
    token: ITokenSetupGovernanceProps['token'];
}

export const MinParticipationField: React.FC<IMinParticipationFieldProps> = (props) => {
    const { formPrefix, token } = props;
    const { symbol, totalSupply, decimals } = token;

    const { t } = useTranslations();

    const fieldName = `${formPrefix}.minParticipation`;
    const value = useWatch<Record<string, ITokenSetupGovernanceForm['minParticipation']>>({
        name: fieldName,
        defaultValue: 0,
    });

    const amount = (Number(totalSupply) * Number(value)) / 100;
    const parsedAmount = formatUnits(BigInt(amount), decimals);
    const formattedAmount = formatterUtils.formatNumber(parsedAmount, { format: NumberFormat.TOKEN_AMOUNT_SHORT })!;

    return (
        <NumberProgressInput
            fieldName={fieldName}
            label={t('app.plugins.token.tokenSetupGovernance.minParticipation.label')}
            helpText={t('app.plugins.token.tokenSetupGovernance.minParticipation.helpText')}
            valueLabel={`${formattedAmount} ${symbol}`}
            total={100}
            prefix="≥"
            suffix="%"
        />
    );
};
