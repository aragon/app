import { Button, IconType, InputContainer } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';
import type { ISetupBodyDialogParams, ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { ICreateProcessFormData } from '../../../createProcessFormDefinitions';
import { GovernanceBodyField } from '../governanceBodyField';

export interface IGovernanceBasicBodyFieldProps {
    /**
     * ID of the DAO to setup the body for.
     */
    daoId: string;
    /**
     * If the component field is read-only.
     * @default false
     */
    readOnly?: boolean;
}

export const GovernanceBasicBodyField: React.FC<IGovernanceBasicBodyFieldProps> = (props) => {
    const { daoId, readOnly = false } = props;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();

    const requiredErrorMessage = 'app.createDao.createProcessForm.governance.basicBodyField.error.required';
    const {
        value: body,
        onChange: onBodyChange,
        ...bodyField
    } = useFormField<Record<string, ISetupBodyForm | undefined>, 'body'>('body', {
        label: t('app.createDao.createProcessForm.governance.basicBodyField.label'),
        rules: { required: { value: true, message: requiredErrorMessage } },
    });

    const processName = useWatch<ICreateProcessFormData, 'name'>({
        name: 'name',
    });

    const handleBodySubmit = (values: ISetupBodyForm) => {
        const bodyId = crypto.randomUUID();
        onBodyChange({
            ...values,
            internalId: bodyId,
            name: processName,
            canCreateProposal: true,
        });
        close();
    };

    const openSetupDialog = () => {
        const onSubmit = handleBodySubmit;
        const params: ISetupBodyDialogParams = {
            onSubmit,
            initialValues: body,
            isSubPlugin: false,
            daoId,
        };
        open(CreateDaoDialogId.SETUP_BODY, { params });
    };

    // Set body to null instead of undefined to make sure react-hook-form library triggers a rerender
    const handleDelete = () => onBodyChange(null);

    // Keep body-name & process-name in sync when setting up a simple governance process. Other metadata (description,
    // process-key, resources) is processed right before pinning the metadata for the simple governance process.
    useEffect(() => {
        if (readOnly || body == null || body.name === processName) {
            return;
        }

        onBodyChange({ ...body, name: processName });
    }, [body, onBodyChange, processName, readOnly]);

    return (
        <InputContainer
            helpText={t('app.createDao.createProcessForm.governance.basicBodyField.helpText')}
            id="basicBody"
            useCustomWrapper={true}
            {...bodyField}
        >
            {body != null && (
                <GovernanceBodyField
                    body={body}
                    daoId={daoId}
                    fieldName="body"
                    onDelete={handleDelete}
                    onEdit={openSetupDialog}
                    readOnly={readOnly}
                />
            )}
            {body == null && !readOnly && (
                <Button
                    className="w-fit"
                    iconLeft={IconType.PLUS}
                    onClick={() => openSetupDialog()}
                    size="md"
                    type="button"
                    variant="tertiary"
                >
                    {t('app.createDao.createProcessForm.governance.basicBodyField.action.add')}
                </Button>
            )}
        </InputContainer>
    );
};
