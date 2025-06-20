import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardDialog } from '@/shared/components/wizards/wizardDialog';
import { invariant } from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { SetupBodyType, type ISetupBodyForm } from './setupBodyDialogDefinitions';
import { SetupBodyDialogSteps, type ISetupBodyDialogStepsProps } from './setupBodyDialogSteps';

export interface ISetupBodyDialogParams extends ISetupBodyDialogStepsProps {
    /**
     * Callback called on submit.
     */
    onSubmit: (values: ISetupBodyForm) => void;
}

export interface ISetupBodyDialogProps extends IDialogComponentProps<ISetupBodyDialogParams> {}

export const SetupBodyDialog: React.FC<ISetupBodyDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'SetupBodyDialog: required parameters must be set.');
    const { onSubmit, initialValues, isSubPlugin, daoId } = location.params;

    const { t } = useTranslations();
    const { address } = useAccount();

    const processedInitialValues = useMemo(() => {
        if (initialValues?.type === SetupBodyType.EXTERNAL || initialValues?.membership.members.length) {
            return initialValues;
        }

        return { ...initialValues, membership: { ...initialValues?.membership, members: [{ address }] } };
    }, [initialValues, address]);

    return (
        <WizardDialog.Container
            title={t('app.createDao.setupBodyDialog.title')}
            formId="bodySetup"
            onSubmit={onSubmit}
            defaultValues={processedInitialValues}
            submitLabel={t('app.createDao.setupBodyDialog.submit')}
        >
            <SetupBodyDialogSteps initialValues={initialValues} daoId={daoId} isSubPlugin={isSubPlugin} />
        </WizardDialog.Container>
    );
};
