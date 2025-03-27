import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardDialog } from '@/shared/components/wizards/wizardDialog';
import type { ISetupBodyForm } from './setupBodyDialogDefinitions';
import { SetupBodyDialogGovernance } from './setupBodyDialogGovernance';
import { SetupBodyDialogMemberhip } from './setupBodyDialogMembership';
import { SetupBodyDialogMetadata } from './setupBodyDialogMetadata';
import { SetupBodyDialogSelect } from './setupBodyDialogSelect';

export interface ISetupBodyDialogProps {
    /**
     * Defines if the dialog is open or not.
     */
    isOpen: boolean;
    /**
     * Callback called on close.
     */
    onClose: () => void;
    /**
     * Callback called on submit.
     */
    onSubmit: (values: ISetupBodyForm) => void;
}

const setupBodySteps = [
    { id: 'select', order: 1, meta: { name: '' } },
    { id: 'metadata', order: 2, meta: { name: '' } },
    { id: 'membership', order: 3, meta: { name: '' } },
    { id: 'governance', order: 4, meta: { name: '' } },
];

export const SetupBodyDialog: React.FC<ISetupBodyDialogProps> = (props) => {
    const { isOpen, onClose, onSubmit } = props;

    const { t } = useTranslations();

    const [selectStep, metadataStep, membershipStep, governanceStep] = setupBodySteps;

    return (
        <WizardDialog.Container
            title={t('app.createDao.setupBodyDialog.title')}
            descriptionKey="app.createDao.setupBodyDialog.a11y.description"
            formId="bodySetup"
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            initialSteps={setupBodySteps}
            submitLabel={t('app.createDao.setupBodyDialog.submit')}
        >
            <WizardDialog.Step {...selectStep}>
                <SetupBodyDialogSelect />
            </WizardDialog.Step>
            <WizardDialog.Step {...metadataStep}>
                <SetupBodyDialogMetadata />
            </WizardDialog.Step>
            <WizardDialog.Step {...membershipStep}>
                <SetupBodyDialogMemberhip />
            </WizardDialog.Step>
            <WizardDialog.Step {...governanceStep}>
                <SetupBodyDialogGovernance />
            </WizardDialog.Step>
        </WizardDialog.Container>
    );
};
