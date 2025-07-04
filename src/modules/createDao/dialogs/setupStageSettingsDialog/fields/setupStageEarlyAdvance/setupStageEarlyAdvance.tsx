import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Switch } from '@aragon/gov-ui-kit';
import { useFormContext } from 'react-hook-form';
import type { ISetupStageSettingsForm } from '../../setupStageSettingsDialogDefinitions';

export interface ISetupStageEarlyAdvanceProps {}

export const SetupStageEarlyAdvance: React.FC<ISetupStageEarlyAdvanceProps> = () => {
    const { t } = useTranslations();
    const { control } = useFormContext<ISetupStageSettingsForm>();

    const {
        value: earlyStageAdvance,
        onChange: onEarlyStageAdvanceChange,
        ...earlyStageField
    } = useFormField<ISetupStageSettingsForm, 'earlyStageAdvance'>('earlyStageAdvance', {
        label: t('app.createDao.setupStageSettingsDialog.fields.stageEarlyAdvance.label'),
        control,
    });
    return (
        <Switch
            helpText={t('app.createDao.setupStageSettingsDialog.fields.stageEarlyAdvance.helpText')}
            inlineLabel={t(
                `app.createDao.setupStageSettingsDialog.fields.stageEarlyAdvance.${earlyStageAdvance ? 'yes' : 'no'}`,
            )}
            onCheckedChanged={(checked) => onEarlyStageAdvanceChange(checked)}
            checked={earlyStageAdvance}
            {...earlyStageField}
        />
    );
};
