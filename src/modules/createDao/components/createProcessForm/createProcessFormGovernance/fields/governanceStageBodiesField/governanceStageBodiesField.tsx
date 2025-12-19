import {
    Button,
    CardEmptyState,
    IconType,
    InputContainer,
} from '@aragon/gov-ui-kit';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';
import type {
    ISetupBodyDialogParams,
    ISetupBodyForm,
} from '@/modules/createDao/dialogs/setupBodyDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { BodyType } from '../../../../../types/enum';
import { GovernanceBodyField } from '../governanceBodyField';

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
    /**
     * If the component field is read-only.
     * @default false
     */
    readOnly?: boolean;
}

export const GovernanceStageBodiesField: React.FC<
    IGovernanceStageBodiesFieldProps
> = (props) => {
    const {
        daoId,
        formPrefix,
        labelContext = 'normal',
        readOnly = false,
    } = props;

    const { t } = useTranslations();
    const { getFieldState } = useFormContext();

    const { open, close } = useDialogContext();

    const fieldName = `${formPrefix}.bodies`;

    const { fields, remove, update, append } = useFieldArray<
        Record<string, ISetupBodyForm[]>
    >({ name: fieldName });

    const bodiesWatch = useWatch<Record<string, ISetupBodyForm[]>>({
        name: fieldName,
    });
    const bodies = fields.map((field, index) => ({
        ...field,
        ...bodiesWatch[index],
    }));

    const handleBodySubmit = (index?: number) => (values: ISetupBodyForm) => {
        if (index == null) {
            const bodyId = crypto.randomUUID();
            append({ ...values, internalId: bodyId, canCreateProposal: true });
        } else {
            update(index, values);
        }
        close();
    };

    const openSetupBodyDialog = (index?: number) => {
        const initialValues = index != null ? bodies[index] : undefined;
        const onSubmit = handleBodySubmit(index);
        const params: ISetupBodyDialogParams = {
            onSubmit,
            initialValues,
            isSubPlugin: true,
            daoId,
        };
        open(CreateDaoDialogId.SETUP_BODY, { params });
    };

    const { message: fieldErrorMessage } =
        getFieldState(fieldName).error?.root ?? {};
    const fieldAlert = fieldErrorMessage
        ? { message: t(fieldErrorMessage), variant: 'critical' as const }
        : undefined;

    return (
        <InputContainer
            alert={fieldAlert}
            className="flex flex-col gap-2"
            helpText={t(
                'app.createDao.createProcessForm.governance.stageBodiesField.helpText',
            )}
            id="bodies"
            label={t(
                `app.createDao.createProcessForm.governance.stageBodiesField.label.${labelContext}`,
            )}
            useCustomWrapper={true}
        >
            {bodies.length === 0 && (
                <CardEmptyState
                    className="border border-neutral-100"
                    description={t(
                        'app.createDao.createProcessForm.governance.stageBodiesField.timelockStage.description',
                    )}
                    heading={t(
                        'app.createDao.createProcessForm.governance.stageBodiesField.timelockStage.heading',
                    )}
                    isStacked={false}
                    objectIllustration={{ object: 'TIMELOCK' }}
                    secondaryButton={
                        readOnly
                            ? undefined
                            : {
                                  label: t(
                                      'app.createDao.createProcessForm.governance.stageBodiesField.action.add',
                                  ),
                                  onClick: () => openSetupBodyDialog(),
                                  iconLeft: IconType.PLUS,
                              }
                    }
                />
            )}
            {bodies.length > 0 && (
                <div className="flex flex-col gap-3 md:gap-2">
                    {bodies.map((body, index) => (
                        <GovernanceBodyField
                            body={body}
                            daoId={daoId}
                            fieldName={`${formPrefix}.bodies.${index.toString()}`}
                            key={body.id}
                            onDelete={() => remove(index)}
                            onEdit={
                                body.type !== BodyType.EXISTING
                                    ? () => openSetupBodyDialog(index)
                                    : undefined
                            }
                            readOnly={readOnly}
                        />
                    ))}
                    {!readOnly && (
                        <Button
                            className="w-fit"
                            iconLeft={IconType.PLUS}
                            onClick={() => openSetupBodyDialog()}
                            size="md"
                            variant="tertiary"
                        >
                            {t(
                                'app.createDao.createProcessForm.governance.stageBodiesField.action.add',
                            )}
                        </Button>
                    )}
                </div>
            )}
        </InputContainer>
    );
};
