import { QueryClient } from '@tanstack/react-query';
import { unstable_rethrow } from 'next/navigation-server';
import type { ReactNode } from 'react';
import {
    type ILayoutWizardProps,
    LayoutWizard,
} from '@/modules/application/components/layouts/layoutWizard';
import { daoOptions, type IDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { errorUtils } from '@/shared/utils/errorUtils';

export interface ILayoutWizardCreateExecuteActionsProps {
    /**
     * URL parameters of the create execute actions page.
     */
    params: Promise<IDaoPageParams>;
    /**
     * Exit of the wizard and link of its error state. Defaults to the transactions of the DAO.
     */
    exitPath?: string;
    /**
     * Children of the layout.
     */
    children?: ReactNode;
}

const wizardName: ILayoutWizardProps['name'] =
    'app.governance.layoutWizardCreateExecuteActions.name';

export const LayoutWizardCreateExecuteActions: React.FC<
    ILayoutWizardCreateExecuteActionsProps
> = async (props) => {
    const { params, exitPath, children } = props;
    const { addressOrEns, network } = await params;

    const queryClient = new QueryClient();
    const transactionsPageUrl =
        exitPath ?? `/dao/${network}/${addressOrEns}/transactions/`;

    let dao: IDao;

    try {
        const daoId = await daoUtils.resolveDaoId({ addressOrEns, network });
        dao = await queryClient.fetchQuery(
            daoOptions({ urlParams: { id: daoId } }),
        );
    } catch (error: unknown) {
        // A malformed DAO URL ends in notFound() inside resolveDaoId; let Next render the 404
        // page instead of turning it into the generic error state.
        unstable_rethrow(error);
        const parsedError = errorUtils.serialize(error);
        const errorNamespace =
            'app.governance.layoutWizardCreateExecuteActions.error';

        return (
            <Page.Error
                actionLink={transactionsPageUrl}
                error={parsedError}
                errorNamespace={errorNamespace}
            />
        );
    }

    return (
        <LayoutWizard
            exitPath={transactionsPageUrl}
            name={wizardName}
            params={params}
            queryClient={queryClient}
            targetDaoAddress={dao.address}
        >
            {children}
        </LayoutWizard>
    );
};
