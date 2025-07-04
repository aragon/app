import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';
import type { ISetupBodyDialogParams, ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, CardEmptyState, IconType, InputContainer } from '@aragon/gov-ui-kit';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { GovernanceBodyField } from '../governanceBodyField';
import { ProcessStageType } from '@/modules/createDao/components/createProcessForm/createProcessFormDefinitions';

export interface IGovernanceStageBodiesFieldProps {
    /**
     * ID of the DAO to setup the bodies for.
     */
    daoId: string;
    /**
     * Prefix to be prepended to the field name.
     */
    formPrefix: string;
    /**
     * Context of the body field label.
     * @default normal
     */
    labelContext?: 'veto' | 'normal';
}

export const GovernanceStageBodiesField: React.FC<IGovernanceStageBodiesFieldProps> = (props) => {
    const { daoId, formPrefix, labelContext = 'normal' } = props;

    const { t } = useTranslations();
    const { getFieldState, setValue } = useFormContext();
    const { open, close } = useDialogContext();

    const fieldName = `${formPrefix}.bodies`;
    const bodiesWatch = useWatch<Record<string, ISetupBodyForm[]>>({ name: fieldName });

    const requiredErrorMessage = 'app.createDao.createProcessForm.governance.stageBodiesField.error.required';
    const { fields, remove, update, append } = useFieldArray<Record<string, ISetupBodyForm[]>>({
        name: fieldName,
        rules: { required: { value: bodiesWatch.length > 0, message: requiredErrorMessage } },
    });

    const bodies = fields.map((field, index) => ({ ...field, ...bodiesWatch[index] }));

    const handleBodySubmit = (index?: number) => (values: ISetupBodyForm) => {
        if (index == null) {
            const bodyId = crypto.randomUUID();
            append({ ...values, internalId: bodyId });
            setValue(`${formPrefix}.settings.type`, ProcessStageType.NORMAL);
        } else {
            update(index, values);
        }
        close();
    };

    const openSetupBodyDialog = (index?: number) => {
        const initialValues = index != null ? bodies[index] : undefined;
        const onSubmit = handleBodySubmit(index);
        const params: ISetupBodyDialogParams = { onSubmit, initialValues, isSubPlugin: true, daoId };
        open(CreateDaoDialogId.SETUP_BODY, { params });
    };

    const { message: fieldErrorMessage } = getFieldState(fieldName).error?.root ?? {};
    const fieldAlert = fieldErrorMessage ? { message: t(fieldErrorMessage), variant: 'critical' as const } : undefined;

    const handleDelete = (index: number) => {
        remove(index);
        // Make sure stage type is back to timelock when last body is removed
        if (bodies.length === 1) {
            setValue(`${formPrefix}.settings.type`, ProcessStageType.TIMELOCK);
        }
    };

    return (
        <>
            <InputContainer
                className="flex flex-col gap-2"
                id="bodies"
                label={t(`app.createDao.createProcessForm.governance.stageBodiesField.label.${labelContext}`)}
                helpText={t('app.createDao.createProcessForm.governance.stageBodiesField.helpText')}
                useCustomWrapper={true}
                alert={fieldAlert}
            >
                {bodies.length === 0 ? (
                    <CardEmptyState
                        heading={t('app.createDao.createProcessForm.governance.stageBodiesField.noBodies.heading')}
                        description={t(
                            'app.createDao.createProcessForm.governance.stageBodiesField.noBodies.description',
                        )}
                        objectIllustration={{ object: 'SETTINGS' }}
                        secondaryButton={{
                            label: t('app.createDao.createProcessForm.governance.stageBodiesField.action.add'),
                            onClick: () => openSetupBodyDialog(),
                            iconLeft: IconType.PLUS,
                        }}
                        isStacked={false}
                        className="border border-neutral-100"
                    />
                ) : (
                    <div className="flex flex-col gap-3 md:gap-2">
                        {bodies.map((body, index) => (
                            <GovernanceBodyField
                                daoId={daoId}
                                key={body.id}
                                fieldName={`${formPrefix}.bodies.${index.toString()}`}
                                body={body}
                                onEdit={() => openSetupBodyDialog(index)}
                                onDelete={() => handleDelete(index)}
                            />
                        ))}
                        <Button
                            size="md"
                            variant="tertiary"
                            className="w-fit"
                            iconLeft={IconType.PLUS}
                            onClick={() => openSetupBodyDialog()}
                        >
                            {t('app.createDao.createProcessForm.governance.stageBodiesField.action.add')}
                        </Button>
                    </div>
                )}
            </InputContainer>
        </>
    );
};
