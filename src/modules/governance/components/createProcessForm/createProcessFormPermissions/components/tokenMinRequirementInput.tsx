import { useTranslations } from '@/shared/components/translationsProvider';
import { InputNumber } from '@aragon/gov-ui-kit';

interface ITokenMinRequirementInputProps {
    handleMinRequirementChange: (value: number) => void;
    maxTokens: number;
}

export const TokenMinRequirementInput: React.FC<ITokenMinRequirementInputProps> = (props) => {
    const { handleMinRequirementChange, maxTokens } = props;

    const { t } = useTranslations();

    return (
        <button className="text-left" onClick={(e) => e.preventDefault()}>
            <InputNumber
                prefix="≥"
                label={t('app.governance.createProcessForm.permissions.tokenMinRequirementInput.label')}
                helpText={t('app.governance.createProcessForm.permissions.tokenMinRequirementInput.helpText')}
                placeholder={t('app.governance.createProcessForm.permissions.tokenMinRequirementInput.placeholder')}
                onChange={(value) => handleMinRequirementChange(Number(value))}
                min={0}
                max={maxTokens}
                defaultValue={0}
            />
        </button>
    );
};
