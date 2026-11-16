import { QueryClient } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import * as layoutWizard from '@/modules/application/components/layouts/layoutWizard';
import { Network } from '@/shared/api/daoService';
import type { IPageErrorProps } from '@/shared/components/page/pageError';
import { generateDao } from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    type ILayoutWizardCreateExecuteActionsProps,
    LayoutWizardCreateExecuteActions,
} from './layoutWizardCreateExecuteActions';

describe('<LayoutWizardCreateExecuteActions /> component', () => {
    const fetchQuerySpy = jest.spyOn(QueryClient.prototype, 'fetchQuery');
    const resolveDaoIdSpy = jest.spyOn(daoUtils, 'resolveDaoId');

    const daoAddress = '0x1234567890123456789012345678901234567890';
    const daoTransactionsUrl = `/dao/${Network.ETHEREUM_SEPOLIA}/${daoAddress}/transactions/`;
    const workspaceTransactionsUrl = `/workspace/demo/${Network.ETHEREUM_SEPOLIA}-${daoAddress}/transactions`;

    beforeEach(() => {
        resolveDaoIdSpy.mockResolvedValue(
            `${Network.ETHEREUM_SEPOLIA}-${daoAddress}`,
        );
        fetchQuerySpy.mockResolvedValue(generateDao({ address: daoAddress }));
    });

    afterEach(() => {
        fetchQuerySpy.mockReset();
        resolveDaoIdSpy.mockReset();
    });

    const createTestComponent = async (
        props?: Partial<ILayoutWizardCreateExecuteActionsProps>,
    ) => {
        const completeProps: ILayoutWizardCreateExecuteActionsProps = {
            params: Promise.resolve({
                addressOrEns: daoAddress,
                network: Network.ETHEREUM_SEPOLIA,
            }),
            ...props,
        };

        // The layout is an async server component, so it is awaited and its element inspected rather than rendered.
        return (await LayoutWizardCreateExecuteActions(
            completeProps,
        )) as ReactElement<layoutWizard.ILayoutWizardProps & IPageErrorProps>;
    };

    it('exits the wizard to the transactions of the DAO by default', async () => {
        const layout = await createTestComponent();

        expect(layout.type).toBe(layoutWizard.LayoutWizard);
        expect(layout.props.exitPath).toEqual(daoTransactionsUrl);
        expect(layout.props.targetDaoAddress).toEqual(daoAddress);
    });

    it('exits the wizard to the given exit path', async () => {
        const layout = await createTestComponent({
            exitPath: workspaceTransactionsUrl,
        });

        expect(layout.props.exitPath).toEqual(workspaceTransactionsUrl);
    });

    it('keeps the default exit path when the exit path is passed undefined', async () => {
        const layout = await createTestComponent({ exitPath: undefined });

        expect(layout.props.exitPath).toEqual(daoTransactionsUrl);
    });

    it('links the error state to the given exit path when the DAO cannot be read', async () => {
        fetchQuerySpy.mockRejectedValue(new Error('fetch DAO error'));

        const layout = await createTestComponent({
            exitPath: workspaceTransactionsUrl,
        });

        expect(layout.props.actionLink).toEqual(workspaceTransactionsUrl);
    });
});
