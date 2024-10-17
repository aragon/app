import { useTranslations } from '@/shared/components/translationsProvider';
import { InputNumber } from '@aragon/ods';
import type { Body } from '../createProcessFormPermissions.api';

interface ITokenMinRequirementInputProps {
    body: Body;
    handleMinRequirementChange: (bodyName: string, value: number) => void;
}

export const TokenMinRequirementInput: React.FC<ITokenMinRequirementInputProps> = (props) => {
    const { body, handleMinRequirementChange } = props;

    const { t } = useTranslations();

    return (
        <button className="text-left" onClick={(e) => e.preventDefault()}>
            <InputNumber
                prefix="≥"
                label={t('app.governance.createProcessForm.permissions.tokenMinRequirementInput.label')}
                helpText={t('app.governance.createProcessForm.permissions.tokenMinRequirementInput.helpText')}
                placeholder="≥ 1"
                onChange={(value) => handleMinRequirementChange(body.bodyNameField, Number(value))}
            />
        </button>
    );
};
