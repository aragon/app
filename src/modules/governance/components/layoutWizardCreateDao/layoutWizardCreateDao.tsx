import { type ILayoutWizardProps, LayoutWizard } from '@/modules/application/components/layouts/layoutWizard';

export interface ILayoutWizardCreateDaoProps extends Omit<ILayoutWizardProps, 'name' | 'exitPath'> {}

export const LayoutWizardCreateDao: React.FC<ILayoutWizardCreateDaoProps> = (props) => {
    return <LayoutWizard name="app.governance.layoutWizardCreateDao.name" exitPath="/" {...props} />;
};
