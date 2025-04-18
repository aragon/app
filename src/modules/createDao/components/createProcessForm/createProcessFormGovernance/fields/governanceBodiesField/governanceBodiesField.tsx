import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';
import type { ISetupBodyDialogParams, ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType, InputContainer } from '@aragon/gov-ui-kit';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { GovernanceBodiesFieldItem } from './governanceBodiesFieldItem';

export interface IGovernanceBodiesFieldProps {
    /**
     * ID of the DAO to setup the bodies for.
     */
    daoId: string;
    /**
     * Name of the bodies field.
     */
    fieldName: string;
    /**
     * Context of the body field label.
     * @default normal
     */
    labelContext?: 'veto' | 'normal';
    /**
     * Error message displayed on the field.
     * @default minLength
     */
    errorMessage?: string;
    /**
     * Setup the governance bodies as subplugins when set to true.
     * @default false
     */
    subPluginSetup?: boolean;
    /**
     * Sets the field as required when
     */
    hidden?: boolean;
}

export const GovernanceBodiesField: React.FC<IGovernanceBodiesFieldProps> = (props) => {
    const { daoId, fieldName, errorMessage, labelContext = 'normal', subPluginSetup = false } = props;

    const { t } = useTranslations();
    const { getFieldState } = useFormContext();
    const { open, close } = useDialogContext();

    const fieldMessage = errorMessage ?? 'app.createDao.createProcessForm.governance.bodiesField.error.minLength';
    const { fields, remove, update, append } = useFieldArray<Record<string, ISetupBodyForm[]>>({
        name: fieldName,
        rules: { required: { value: true, message: fieldMessage } },
    });

    const bodiesWatch = useWatch<Record<string, ISetupBodyForm[]>>({ name: fieldName });
    const bodies = fields.map((field, index) => ({ ...field, ...bodiesWatch[index] }));

    const handleBodySubmit = (index?: number) => (values: ISetupBodyForm) => {
        if (index == null) {
            const bodyId = crypto.randomUUID();
            append({ ...values, internalId: bodyId });
        } else {
            update(index, values);
        }
        close();
    };

    const openSetupBodyDialog = (index?: number) => {
        const initialValues = index != null ? bodies[index] : undefined;
        const onSubmit = handleBodySubmit(index);
        const params: ISetupBodyDialogParams = { onSubmit, initialValues, isSubPlugin: subPluginSetup, daoId };
        open(CreateDaoDialogId.SETUP_BODY, { params });
    };

    const renderAddButton = subPluginSetup || bodies.length === 0;

    const { message: fieldErrorMessage } = getFieldState(fieldName).error?.root ?? {};
    const fieldAlert = fieldErrorMessage ? { message: t(fieldErrorMessage), variant: 'critical' as const } : undefined;

    return (
        <>
            <InputContainer
                className="flex flex-col gap-2"
                id="bodies"
                label={t(`app.createDao.createProcessForm.governance.bodiesField.label.${labelContext}`)}
                helpText={t('app.createDao.createProcessForm.governance.bodiesField.helpText')}
                useCustomWrapper={true}
                alert={fieldAlert}
            >
                <div className="flex flex-col gap-3 md:gap-2">
                    {bodies.map((body, index) => (
                        <GovernanceBodiesFieldItem
                            key={body.id}
                            fieldName={`bodies.${index.toString()}`}
                            body={body}
                            onEdit={() => openSetupBodyDialog(index)}
                            onDelete={() => remove(index)}
                        />
                    ))}
                    {renderAddButton && (
                        <Button
                            size="md"
                            variant="tertiary"
                            className="w-fit"
                            iconLeft={IconType.PLUS}
                            onClick={() => openSetupBodyDialog()}
                        >
                            {t('app.createDao.createProcessForm.governance.bodiesField.action.add')}
                        </Button>
                    )}
                </div>
            </InputContainer>
        </>
    );
};
