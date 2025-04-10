import type { ISetupBodyDialogParams, ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useFieldArray, useWatch } from 'react-hook-form';
import { CreateDaoDialogId } from '../../../../../constants/createDaoDialogId';
import type { ICreateProcessFormData } from '../../../createProcessFormDefinitions';
import type { IUseBodiesFieldParams, IUseBodiesFieldReturn } from './useBodiesField.api';

// Only apply min-length rule for simple governance as stage bodies are already validated per-stage on the stage field
const validateBodies = (isAdvancedGovernance?: boolean) => (bodies: ICreateProcessFormData['bodies']) => {
    const bodiesFieldError = 'app.createDao.createProcessForm.governance.bodiesField.error.minLength';
    const isValid = bodies.length > 0;

    return isAdvancedGovernance || isValid ? undefined : bodiesFieldError;
};

export const useBodiesField = (params: IUseBodiesFieldParams): IUseBodiesFieldReturn => {
    const { isAdvancedGovernance, daoId } = params;

    const { open, close } = useDialogContext();

    const { fields, remove, update, append } = useFieldArray<ICreateProcessFormData, 'bodies'>({
        name: 'bodies',
        rules: { validate: validateBodies(isAdvancedGovernance) },
    });
    const watchBodies = useWatch<ICreateProcessFormData, 'bodies'>({ name: 'bodies' });
    const bodies = fields.map((field, index) => ({ ...field, ...watchBodies[index] }));

    const handleBodySubmit = (stageId?: string, index?: number) => (values: ISetupBodyForm) => {
        if (index == null) {
            const bodyId = crypto.randomUUID();
            append({ ...values, internalId: bodyId, stageId });
        } else {
            update(index, values);
        }
        close();
    };

    const addBody = (stageId?: string) => {
        const params: ISetupBodyDialogParams = {
            onSubmit: handleBodySubmit(stageId),
            isSubPlugin: isAdvancedGovernance,
            daoId,
        };
        open(CreateDaoDialogId.SETUP_BODY, { params });
    };

    const editBody = (bodyId: string) => {
        const bodyIndex = bodies.findIndex((body) => body.internalId === bodyId);
        const params: ISetupBodyDialogParams = {
            onSubmit: handleBodySubmit(undefined, bodyIndex),
            initialValues: bodies[bodyIndex],
            isSubPlugin: isAdvancedGovernance,
            daoId,
        };
        open(CreateDaoDialogId.SETUP_BODY, { params });
    };

    const removeBody = (bodyId: string) => {
        const bodyIndex = bodies.findIndex((body) => body.internalId === bodyId);
        remove(bodyIndex);
    };

    return { addBody, editBody, removeBody, bodies };
};
