import { LayoutWizard } from '@/modules/application/components/layouts/layoutWizard';

export interface ILayoutWizardCreateDaoProps {}

export const LayoutWizardCreateDao: React.FC<ILayoutWizardCreateDaoProps> = (
    props,
) => (
    <LayoutWizard
        exitPath="/"
        name="app.governance.layoutWizardCreateDao.name"
        {...props}
    />
);
