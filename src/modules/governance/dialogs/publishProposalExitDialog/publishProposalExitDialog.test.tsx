import * as useDialogContext from '@/shared/components/dialogProvider';
import { IExitDialogProps } from '@/shared/components/exitDialog';
import { render, screen } from '@testing-library/react';
import { PublishProposalExitDialog, type IPublishProposalExitDialogProps } from './publishProposalExitDialog';
import { DialogAlertRootHiddenElement } from '@/shared/components/dialogRoot';

jest.mock('@/shared/components/exitDialog', () => ({
    ExitDialog: (props: IExitDialogProps) => {
        const { title, description, actionButton, cancelButton } = props;
        return (
            <div data-testid="exit-dialog-mock">
                <p>{title}</p>
                <p>{description}</p>
                <button>{actionButton.label}</button>
                <button>{cancelButton.label}</button>
            </div>
        );
    },
}));

describe('<PublishProposalExitDialog /> component', () => {
    const useDialogContextSpy = jest.spyOn(useDialogContext, 'useDialogContext');

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue({ open: jest.fn(), close: jest.fn() });
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IPublishProposalExitDialogProps>) => {
        const defaultProps = {
            location: { params: { daoId: 'test-dao' }, id: 'test-dao' },
            ...props,
        };

        return <PublishProposalExitDialog {...defaultProps} />;
    };

    it('renders the ExitDialog component with the correct props', () => {
        render(createTestComponent());

        expect(screen.getByTestId('exit-dialog-mock')).toBeInTheDocument();
        expect(screen.getByText(/publishProposalExitDialog.title/)).toBeInTheDocument();
        expect(screen.getByText(/publishProposalExitDialog.description/)).toBeInTheDocument();

        expect(screen.getByText(/publishProposalExitDialog.button.accept/)).toBeInTheDocument();
        expect(screen.getByText(/publishProposalExitDialog.button.deny/)).toBeInTheDocument();
    });
});