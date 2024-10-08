import { LayoutWizard } from '@/modules/application/components/layouts/layoutWizard';
import type { IDaoPageParams } from '@/shared/types';
import { type Route } from 'next';

export interface ILayoutWizardCreateProcessProps {
    /**
     * URL parameters of the create process page.
     */
    params: IDaoPageParams;
}

export const LayoutWizardCreateProcess: React.FC<ILayoutWizardCreateProcessProps> = (props) => {
    return (
        <LayoutWizard
            exitPath={`/dao/${props.params?.id}/settings` as Route}
            name="app.governance.layoutWizardCreateProcess.name"
            {...props}
        />
    );
};
