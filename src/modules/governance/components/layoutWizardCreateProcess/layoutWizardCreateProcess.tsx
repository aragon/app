import { type ILayoutWizardProps, LayoutWizard } from '@/modules/application/components/layouts/layoutWizard';

export interface ILayoutWizardCreateProcessProps extends Omit<ILayoutWizardProps, 'name'> {}

export const LayoutWizardCreateProcess: React.FC<ILayoutWizardCreateProcessProps> = (props) => {
    return <LayoutWizard name="Create process" {...props} />;
};
