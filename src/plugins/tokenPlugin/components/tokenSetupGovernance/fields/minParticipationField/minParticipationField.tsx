import { formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';
import { formatUnits } from 'viem';
import { NumberProgressInput } from '@/shared/components/forms/numberProgressInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { ITokenSetupGovernanceForm, ITokenSetupGovernanceProps } from '../../tokenSetupGovernance.api';

export interface IMinParticipationFieldProps {
    /**
     * Prefix to be prepended to the form field.
     */
    formPrefix: string;
    /**
     * The token linked to the plugin.
     */
    token: ITokenSetupGovernanceProps['membershipSettings']['token'];
}

const defaultMinParticipation = 1;

export const MinParticipationField: React.FC<IMinParticipationFieldProps> = (props) => {
    const { formPrefix, token } = props;
    const { symbol, totalSupply, decimals } = token;

    const { t } = useTranslations();

    const fieldName = `${formPrefix}.minParticipation`;
    const percentageValue = useWatch<Record<string, ITokenSetupGovernanceForm['minParticipation']>>({
        name: fieldName,
        defaultValue: defaultMinParticipation,
    });

    const amount = Math.round((Number(totalSupply) * percentageValue) / 100);
    const parsedAmount = formatUnits(BigInt(amount), decimals);
    const formattedAmount = formatterUtils.formatNumber(parsedAmount, { format: NumberFormat.TOKEN_AMOUNT_SHORT })!;

    return (
        <NumberProgressInput
            defaultValue={defaultMinParticipation}
            fieldName={fieldName}
            helpText={t('app.plugins.token.tokenSetupGovernance.minParticipation.helpText')}
            label={t('app.plugins.token.tokenSetupGovernance.minParticipation.label')}
            min={0}
            prefix="≥"
            suffix="%"
            total={100}
            valueLabel={totalSupply === '0' || totalSupply == null ? undefined : `${formattedAmount} ${symbol}`}
        />
    );
};
