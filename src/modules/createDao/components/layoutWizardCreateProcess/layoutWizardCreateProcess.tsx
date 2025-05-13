import { LayoutWizard } from '@/modules/application/components/layouts/layoutWizard';
import type { IDaoPageParams } from '@/shared/types';
import { type Route } from 'next';

export interface ILayoutWizardCreateProcessProps {
    /**
     * URL parameters of the create process page.
     */
    params: Promise<IDaoPageParams>;
}

export const LayoutWizardCreateProcess: React.FC<ILayoutWizardCreateProcessProps> = async (props) => {
    const { params } = props;
    const { addressOrEns, network } = await params;

    return (
        <LayoutWizard
            exitPath={`/dao/${network}/${addressOrEns}/settings` as Route}
            name="app.createDao.layoutWizardCreateProcess.name"
            {...props}
        />
    );
};
