import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { NumberProgressInput } from '@/shared/components/forms/numberProgressInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';

export interface IMinParticipationFieldProps {
    /**
     * The field name for the min participation field.
     */
    minParticipationFieldName: string;
    /**
     * The min participation value.
     */
    minParticipation?: number;
    /**
     * The DAO token plugin.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
}

export const MinParticipationField: React.FC<IMinParticipationFieldProps> = (props) => {
    const { minParticipationFieldName, minParticipation, plugin } = props;

    const { symbol, totalSupply, decimals } = plugin.settings.token;

    const { t } = useTranslations();

    const amount = (Number(totalSupply) * Number(minParticipation)) / 100;
    const parsedAmount = formatUnits(BigInt(amount), decimals);
    const parsedValue = formatterUtils.formatNumber(parsedAmount, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    })!;

    return (
        <NumberProgressInput
            fieldName={minParticipationFieldName}
            label={t('app.plugins.token.tokenUpdateSettingsAction.minParticipation.label')}
            helpText={t('app.plugins.token.tokenUpdateSettingsAction.minParticipation.helpText')}
            valueLabel={`${parsedValue} ${symbol}`}
            total={100}
            prefix="≥"
            suffix="%"
        />
    );
};
