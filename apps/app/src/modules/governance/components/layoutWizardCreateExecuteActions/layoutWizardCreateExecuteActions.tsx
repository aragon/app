import { QueryClient } from '@tanstack/react-query';
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
}

const wizardName: ILayoutWizardProps['name'] =
    'app.governance.layoutWizardCreateExecuteActions.name';

export const LayoutWizardCreateExecuteActions: React.FC<
    ILayoutWizardCreateExecuteActionsProps
> = async (props) => {
    const { params } = props;
    const { addressOrEns, network } = await params;

    const queryClient = new QueryClient();
    const transactionsPageUrl = `/dao/${network}/${addressOrEns}/transactions/`;

    let dao: IDao;

    try {
        const daoId = await daoUtils.resolveDaoId({ addressOrEns, network });
        dao = await queryClient.fetchQuery(
            daoOptions({ urlParams: { id: daoId } }),
        );
    } catch (error: unknown) {
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
            queryClient={queryClient}
            targetDaoAddress={dao.address}
            {...props}
        />
    );
};
