import { LayoutWizard } from '@/modules/application/components/layouts/layoutWizard';

export interface ILayoutWizardCreateDaoProps {}

export const LayoutWizardCreateDao: React.FC<ILayoutWizardCreateDaoProps> = (props) => {
    return <LayoutWizard name="app.governance.layoutWizardCreateDao.name" exitPath="/" {...props} />;
};
