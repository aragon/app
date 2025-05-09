import { type ILayoutWizardProps } from '@/modules/application/components/layouts/layoutWizard';
import { Network } from '@/shared/api/daoService';
import { render, screen } from '@testing-library/react';
import { type ILayoutWizardCreateProcessProps, LayoutWizardCreateProcess } from './layoutWizardCreateProcess';

jest.mock('@/modules/application/components/layouts/layoutWizard', () => ({
    LayoutWizard: (props: ILayoutWizardProps) => <div data-testid="layout-wizard-mock">{props.name as string}</div>,
}));

describe('<LayoutWizardCreateProcess /> component', () => {
    const createTestComponent = async (props?: Partial<ILayoutWizardCreateProcessProps>) => {
        const completeProps: ILayoutWizardCreateProcessProps = {
            params: Promise.resolve({ addressOrEns: 'test-dao-address', network: Network.ETHEREUM_SEPOLIA }),
            ...props,
        };

        const Component = await LayoutWizardCreateProcess(completeProps);

        return Component;
    };

    it('renders and passes the create-process wizard name prop to children', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('layout-wizard-mock')).toBeInTheDocument();
        expect(screen.getByText(/layoutWizardCreateProcess.name/)).toBeInTheDocument();
    });
});
