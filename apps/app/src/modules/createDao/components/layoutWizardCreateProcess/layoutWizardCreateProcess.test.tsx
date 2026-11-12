import { render, screen } from '@testing-library/react';
import type { ILayoutWizardProps } from '@/modules/application/components/layouts/layoutWizard';
import { Network } from '@/shared/api/daoService';
import {
    type ILayoutWizardCreateProcessProps,
    LayoutWizardCreateProcess,
} from './layoutWizardCreateProcess';

jest.mock('@/modules/application/components/layouts/layoutWizard', () => ({
    LayoutWizard: (props: ILayoutWizardProps) => (
        <div data-exit-path={props.exitPath} data-testid="layout-wizard-mock">
            {props.name as string}
            {props.children}
        </div>
    ),
}));

describe('<LayoutWizardCreateProcess /> component', () => {
    const createTestComponent = async (
        props?: Partial<ILayoutWizardCreateProcessProps>,
    ) => {
        const completeProps: ILayoutWizardCreateProcessProps = {
            params: Promise.resolve({
                addressOrEns: 'test-dao-address',
                network: Network.ETHEREUM_SEPOLIA,
            }),
            ...props,
        };

        const Component = await LayoutWizardCreateProcess(completeProps);

        return Component;
    };

    it('exits the wizard to the settings of the DAO by default', async () => {
        render(await createTestComponent());

        expect(screen.getByTestId('layout-wizard-mock')).toHaveAttribute(
            'data-exit-path',
            `/dao/${Network.ETHEREUM_SEPOLIA}/test-dao-address/settings`,
        );
    });

    it('exits the wizard to the given exit path', async () => {
        render(await createTestComponent({ exitPath: '/workspace/exit' }));

        expect(screen.getByTestId('layout-wizard-mock')).toHaveAttribute(
            'data-exit-path',
            '/workspace/exit',
        );
    });

    it('keeps the default exit path when the exit path is passed undefined', async () => {
        render(await createTestComponent({ exitPath: undefined }));

        expect(screen.getByTestId('layout-wizard-mock')).toHaveAttribute(
            'data-exit-path',
            `/dao/${Network.ETHEREUM_SEPOLIA}/test-dao-address/settings`,
        );
    });

    it('renders the page inside the wizard layout', async () => {
        render(
            await createTestComponent({
                children: <div data-testid="page-mock" />,
            }),
        );

        expect(screen.getByTestId('page-mock')).toBeInTheDocument();
    });

    it('renders the wizard layout with the create-process wizard name', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('layout-wizard-mock')).toBeInTheDocument();
        expect(
            screen.getByText(/layoutWizardCreateProcess.name/),
        ).toBeInTheDocument();
    });
});
