import type { Route } from 'next';
import type { ReactNode } from 'react';
import { LayoutWizard } from '@/modules/application/components/layouts/layoutWizard';
import type { IDaoPageParams } from '@/shared/types';

export interface ILayoutWizardCreateProcessProps {
    /**
     * URL parameters of the create process page.
     */
    params: Promise<IDaoPageParams>;
    /**
     * Exit of the wizard. Defaults to the settings of the DAO.
     */
    exitPath?: string;
    /**
     * Children of the layout.
     */
    children?: ReactNode;
}

export const LayoutWizardCreateProcess: React.FC<
    ILayoutWizardCreateProcessProps
> = async (props) => {
    const { params, exitPath, children } = props;
    const { addressOrEns, network } = await params;

    return (
        <LayoutWizard
            exitPath={
                (exitPath ??
                    `/dao/${network}/${addressOrEns}/settings`) as Route
            }
            name="app.createDao.layoutWizardCreateProcess.name"
            params={params}
        >
            {children}
        </LayoutWizard>
    );
};
