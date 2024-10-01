import { type ILayoutWizardProps, LayoutWizard } from '@/modules/application/components/layouts/layoutWizard';
import { type Route } from 'next';

export interface ILayoutWizardCreateProcessProps extends Omit<ILayoutWizardProps, 'name' | 'exitPath'> {}

export const LayoutWizardCreateProcess: React.FC<ILayoutWizardCreateProcessProps> = (props) => {
    return <LayoutWizard exitPath={`/dao/${props.params?.id}/settings` as Route} name="Create process" {...props} />;
};
