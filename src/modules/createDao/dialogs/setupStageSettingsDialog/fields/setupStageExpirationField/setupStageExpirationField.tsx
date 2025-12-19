import { Card, Switch } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { AdvancedDateInputDuration } from '@/shared/components/forms/advancedDateInput/advancedDateInputDuration';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IDateDuration } from '@/shared/utils/dateUtils';

export interface ISetupStageExpirationFieldProps {
    /**
     * Default value for the stage expiration.
     */
    defaultExpirationValue?: IDateDuration;
}

const defaultExpiration = { days: 7, hours: 0, minutes: 0 };

export const SetupStageExpirationField: React.FC<
    ISetupStageExpirationFieldProps
> = (props) => {
    const { defaultExpirationValue } = props;
    const { t } = useTranslations();
    const { setValue } = useFormContext();

    const [displayExpiration, setDisplayExpiration] = useState(
        defaultExpirationValue != null,
    );

    const handleToggleExpiration = (checked: boolean) => {
        setDisplayExpiration(checked);
        // The timeout here is needed because the advanced-date component needs to be rendered and the form field to be
        // registered before we can set its value on the form.
        setTimeout(
            () =>
                setValue(
                    'stageExpiration',
                    checked ? defaultExpiration : undefined,
                ),
            0,
        );
    };
    return (
        <>
            <Switch
                checked={displayExpiration}
                helpText={t(
                    'app.createDao.setupStageSettingsDialog.fields.stageExpirationField.helpText',
                )}
                inlineLabel={t(
                    `app.createDao.setupStageSettingsDialog.fields.stageExpirationField.${displayExpiration ? 'yes' : 'no'}`,
                )}
                label={t(
                    'app.createDao.setupStageSettingsDialog.fields.stageExpirationField.label',
                )}
                onCheckedChanged={handleToggleExpiration}
            />
            {displayExpiration && (
                <Card className="border border-neutral-100">
                    <AdvancedDateInputDuration
                        field="stageExpiration"
                        infoDisplay="inline"
                        infoText={t(
                            'app.createDao.setupStageSettingsDialog.fields.stageExpirationField.infoText',
                        )}
                        label={t(
                            'app.createDao.setupStageSettingsDialog.fields.stageExpirationField.label',
                        )}
                    />
                </Card>
            )}
        </>
    );
};
