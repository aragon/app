import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateMpcSignRequest } from '@/modules/mpc/testUtils';
import { type IMpcRequestItemProps, MpcRequestItem } from './mpcRequestItem';

describe('<MpcRequestItem /> component', () => {
    const createTestComponent = (props?: Partial<IMpcRequestItemProps>) => {
        const completeProps: IMpcRequestItemProps = {
            request: generateMpcSignRequest(),
            ...props,
        };

        return <MpcRequestItem {...completeProps} />;
    };

    it('renders the summary, type and status of the request', () => {
        const request = generateMpcSignRequest({
            summary: { label: 'Sign message "gm"' },
            status: 'signed',
            type: 'message',
        });
        render(createTestComponent({ request }));
        expect(screen.getByText('Sign message "gm"')).toBeInTheDocument();
        expect(
            screen.getByText(/mpcRequestItem.type.message/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/mpcRequestItem.status.signed/),
        ).toBeInTheDocument();
    });

    it('renders the sign action for the requester when approved and the device share is present', async () => {
        const onSignClick = jest.fn();
        const request = generateMpcSignRequest({
            status: 'approved',
            createdBy: 'alice',
        });
        render(
            createTestComponent({
                request,
                role: 'approver',
                username: 'alice',
                hasDeviceShare: true,
                onSignClick,
            }),
        );
        const button = screen.getByRole('button', {
            name: /mpcRequestItem.actions.sign/,
        });
        await userEvent.click(button);
        expect(onSignClick).toHaveBeenCalledWith(request);
    });

    it('hides the sign action when the device share is missing', () => {
        const request = generateMpcSignRequest({ status: 'approved' });
        render(
            createTestComponent({
                request,
                role: 'owner',
                username: 'alice',
                hasDeviceShare: false,
            }),
        );
        expect(
            screen.queryByRole('button', {
                name: /mpcRequestItem.actions.sign/,
            }),
        ).not.toBeInTheDocument();
    });

    it('renders the review action for approvers on pending requests created by others', async () => {
        const onReviewClick = jest.fn();
        const request = generateMpcSignRequest({
            status: 'pending_approval',
            createdBy: 'alice',
            approvalsRequired: 1,
        });
        render(
            createTestComponent({
                request,
                role: 'approver',
                username: 'bob',
                onReviewClick,
            }),
        );
        await userEvent.click(
            screen.getByRole('button', {
                name: /mpcRequestItem.actions.review/,
            }),
        );
        expect(onReviewClick).toHaveBeenCalledWith(request);
    });

    it('does not render actions for viewers', () => {
        const request = generateMpcSignRequest({ status: 'pending_approval' });
        render(
            createTestComponent({
                request,
                role: 'viewer',
                username: 'carol',
                hasDeviceShare: true,
            }),
        );
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders the transaction hash link when broadcast', () => {
        const request = generateMpcSignRequest({
            status: 'broadcast',
            txHash: '0xabc',
        });
        render(createTestComponent({ request }));
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute(
            'href',
            'https://sepolia.etherscan.io/tx/0xabc',
        );
    });
});
