import { render, screen } from '@testing-library/react';
import { generateMpcSystem } from '@/modules/mpc/testUtils';
import { type IMpcShareStatusProps, MpcShareStatus } from './mpcShareStatus';

describe('<MpcShareStatus /> component', () => {
    const createTestComponent = (props?: Partial<IMpcShareStatusProps>) => {
        const completeProps: IMpcShareStatusProps = {
            system: generateMpcSystem(),
            ...props,
        };

        return <MpcShareStatus {...completeProps} />;
    };

    it('renders the device share as present when stored in this browser', () => {
        render(createTestComponent({ hasDeviceShare: true }));
        expect(
            screen.getByText(/mpcShareStatus.device.present/),
        ).toBeInTheDocument();
    });

    it('renders the device share as missing when not stored', () => {
        render(createTestComponent({ hasDeviceShare: false }));
        expect(
            screen.getByText(/mpcShareStatus.device.missing/),
        ).toBeInTheDocument();
    });

    it('renders a checking state while the storage is being checked', () => {
        render(createTestComponent({ hasDeviceShare: undefined }));
        expect(
            screen.getByText(/mpcShareStatus.device.checking/),
        ).toBeInTheDocument();
    });

    it('renders the server epoch and the recovery acknowledgement', () => {
        const system = generateMpcSystem({
            epoch: 3,
            recoveryAcknowledged: false,
        });
        render(createTestComponent({ system, hasDeviceShare: true }));
        expect(
            screen.getByText(/mpcShareStatus.server.epoch \(epoch=3\)/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/mpcShareStatus.recovery.pending/),
        ).toBeInTheDocument();
    });
});
