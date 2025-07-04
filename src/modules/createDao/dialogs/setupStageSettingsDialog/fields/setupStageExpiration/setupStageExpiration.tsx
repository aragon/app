import { AdvancedDateInputDuration } from '@/shared/components/forms/advancedDateInput/advancedDateInputDuration';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IDateDuration } from '@/shared/utils/dateUtils';
import { Card, Switch } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

export interface ISetupStageExpirationProps {
    /**
     * Default value for the stage expiration.
     */
    defaultExpirationValue?: IDateDuration;
}

const defaultExpiration = { days: 7, hours: 0, minutes: 0 };

export const SetupStageExpiration: React.FC<ISetupStageExpirationProps> = (props) => {
    const { defaultExpirationValue } = props;
    const { t } = useTranslations();
    const { setValue } = useFormContext();

    const [displayExpiration, setDisplayExpiration] = useState(defaultExpirationValue != null);

    const handleToggleExpiration = (checked: boolean) => {
        setDisplayExpiration(checked);
        // The timeout here is needed because the advanced-date component needs to be rendered and the form field to be
        // registered before we can set its value on the form.
        setTimeout(() => setValue('stageExpiration', checked ? defaultExpiration : undefined), 0);
    };
    return (
        <>
            <Switch
                label={t('app.createDao.setupStageSettingsDialog.fields.stageExpiration.label')}
                helpText={t('app.createDao.setupStageSettingsDialog.fields.stageExpiration.helpText')}
                inlineLabel={t(
                    `app.createDao.setupStageSettingsDialog.fields.stageExpiration.${displayExpiration ? 'yes' : 'no'}`,
                )}
                onCheckedChanged={handleToggleExpiration}
                checked={displayExpiration}
            />
            {displayExpiration && (
                <Card className="border border-neutral-100">
                    <AdvancedDateInputDuration
                        field="stageExpiration"
                        label={t('app.createDao.setupStageSettingsDialog.fields.stageExpiration.label')}
                        infoText={t('app.createDao.setupStageSettingsDialog.fields.stageExpiration.infoText')}
                        infoDisplay="inline"
                    />
                </Card>
            )}
        </>
    );
};
