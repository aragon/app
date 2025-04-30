import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';
import type { ISetupBodyDialogParams, ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Button, IconType, InputContainer } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { ICreateProcessFormData } from '../../../createProcessFormDefinitions';
import { GovernanceBodyField } from '../governanceBodyField';

export interface IGovernanceBasicBodyFieldProps {
    /**
     * ID of the DAO to setup the body for.
     */
    daoId: string;
}

export const GovernanceBasicBodyField: React.FC<IGovernanceBasicBodyFieldProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();
    const { setValue, resetField } = useFormContext();

    const requiredErrorMessage = 'app.createDao.createProcessForm.governance.basicBodyField.error.required';
    const {
        value: body,
        onChange: onBodyChange,
        onBlur: onBodyBlur,
        ...bodyField
    } = useFormField<Record<string, ISetupBodyForm | undefined>, 'body'>('body', {
        label: t('app.createDao.createProcessForm.governance.basicBodyField.label'),
        rules: { required: { value: true, message: requiredErrorMessage } },
    });
    const processName = useWatch<ICreateProcessFormData, 'name'>({ name: 'name' });

    const handleBodySubmit = (values: ISetupBodyForm) => {
        const bodyId = crypto.randomUUID();
        onBodyChange({
            ...values,
            internalId: bodyId,
            // defaultValue does not set canCreateProposal reliably in every case, so it's important do the init here.
            canCreateProposal: true,
            // useForm does not always return the latest value set by setValue in the sync useEffect!
            name: processName,
        });
        close();
    };

    const openSetupDialog = () => {
        const onSubmit = handleBodySubmit;
        const params: ISetupBodyDialogParams = { onSubmit, initialValues: body, isSubPlugin: false, daoId };
        open(CreateDaoDialogId.SETUP_BODY, { params });
    };

    const handleDelete = () => {
        onBodyChange(undefined);
    };

    const isBodySet = body != null;
    // Keep body-name & process-name in sync when setting up a simple governance process. Other metadata (description,
    // process-key, resources) is processed right before pinning the metadata for the simple governance process.
    useEffect(() => {
        if (!isBodySet) {
            return;
        }

        console.log('UPDATING BODY NAME', processName);
        setValue('body.name', processName);
    }, [isBodySet, processName, setValue]);

    console.log('body', body);

    return (
        <InputContainer
            id="basicBody"
            helpText={t('app.createDao.createProcessForm.governance.basicBodyField.helpText')}
            useCustomWrapper={true}
            {...bodyField}
        >
            {body != null && (
                <GovernanceBodyField fieldName="body" body={body} onEdit={openSetupDialog} onDelete={handleDelete} />
            )}
            {body == null && (
                <Button
                    size="md"
                    variant="tertiary"
                    className="w-fit"
                    iconLeft={IconType.PLUS}
                    onClick={() => openSetupDialog()}
                    type="button"
                >
                    {t('app.createDao.createProcessForm.governance.basicBodyField.action.add')}
                </Button>
            )}
        </InputContainer>
    );
};
