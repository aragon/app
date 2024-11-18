import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IUseFormFieldReturn } from '@/shared/hooks/useFormField';
import { Card, InputNumber, RadioCard, RadioGroup } from '@aragon/gov-ui-kit';

export interface IProposalCreationEligibilityFieldProps {
    /**
     * The token symbol.
     */
    tokenSymbol: string;
    /**
     * The min voting power form field.
     */
    minVotingPowerField: IUseFormFieldReturn<ITokenPluginSettings, 'minProposerVotingPower'>;
}

export const ProposalCreationEligibilityField: React.FC<IProposalCreationEligibilityFieldProps> = (props) => {
    const { tokenSymbol, minVotingPowerField } = props;
    const { onChange: onMinVotingPowerChange, value: minVotingPowerValue } = minVotingPowerField;

    const handleRadioChange = (value: string) => onMinVotingPowerChange(value === 'members' ? '1' : '0');

    const { t } = useTranslations();

    return (
        <Card className="flex flex-col gap-6 border border-neutral-100 p-6 shadow-neutral-sm">
            <RadioGroup
                label={t('app.plugins.token.tokenUpdateSettingsAction.eligibleField.label')}
                helpText={t('app.plugins.token.tokenUpdateSettingsAction.eligibleField.helpText')}
                className="w-full"
                onValueChange={handleRadioChange}
                value={Number(minVotingPowerValue) > 0 ? 'members' : 'any'}
            >
                <RadioCard
                    label={t('app.plugins.token.tokenUpdateSettingsAction.eligibleField.members.label')}
                    description={t('app.plugins.token.tokenUpdateSettingsAction.eligibleField.members.description')}
                    value="members"
                />
                <RadioCard
                    label={t('app.plugins.token.tokenUpdateSettingsAction.eligibleField.anyWallet.label')}
                    description={t('app.plugins.token.tokenUpdateSettingsAction.eligibleField.anyWallet.description')}
                    value="any"
                />
            </RadioGroup>
            {Number(minVotingPowerValue) > 0 && (
                <InputNumber
                    {...minVotingPowerField}
                    className="w-full"
                    helpText={t('app.plugins.token.tokenUpdateSettingsAction.minVotingPower.helpText')}
                    placeholder={`≥ 1 ${tokenSymbol}`}
                    prefix="≥"
                    suffix={tokenSymbol}
                    onChange={onMinVotingPowerChange}
                />
            )}
        </Card>
    );
};
