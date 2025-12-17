import { Switch } from '@aragon/gov-ui-kit';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { ISetupStageSettingsForm } from '../../setupStageSettingsDialogDefinitions';

export const SetupStageEarlyAdvanceField: React.FC = () => {
    const { t } = useTranslations();
    const { control } = useFormContext<ISetupStageSettingsForm>();

    const {
        value: earlyStageAdvance,
        onChange: onEarlyStageAdvanceChange,
        ...earlyStageField
    } = useFormField<ISetupStageSettingsForm, 'earlyStageAdvance'>('earlyStageAdvance', {
        label: t('app.createDao.setupStageSettingsDialog.fields.stageEarlyAdvanceField.label'),
        control,
    });
    return (
        <Switch
            checked={earlyStageAdvance}
            helpText={t('app.createDao.setupStageSettingsDialog.fields.stageEarlyAdvanceField.helpText')}
            inlineLabel={t(`app.createDao.setupStageSettingsDialog.fields.stageEarlyAdvanceField.${earlyStageAdvance ? 'yes' : 'no'}`)}
            onCheckedChanged={(checked) => onEarlyStageAdvanceChange(checked)}
            {...earlyStageField}
        />
    );
};
