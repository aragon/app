'use client';

import type { Network } from '@/shared/api/daoService';
import { type IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
import { Dialog, invariant } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { IGauge } from '../../api/gaugeVoterService/domain';
import { GaugeVoterGaugeDetailsDialogContent } from './gaugeVoterGaugeDetailsDialogContent';
import { GaugeVoterGaugeDetailsDialogFooter } from './gaugeVoterGaugeDetailsDialogFooter';

export interface IGaugeVoterGaugeDetailsDialogParams {
    /**
     * The gauge to show details for.
     */
    gauges: IGauge[];
    /**
     * The index of the gauge to show details for.
     */
    selectedIndex: number;
    /**
     * Network of the DAO.
     */
    network: Network;
}

export interface IGaugeVoterGaugeDetailsDialogProps
    extends IDialogComponentProps<IGaugeVoterGaugeDetailsDialogParams> {}

export const GaugeVoterGaugeDetailsDialog: React.FC<IGaugeVoterGaugeDetailsDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'GaugeVoterGaugeDetailsDialog: required parameters must be set.');

    const { gauges, selectedIndex, network } = location.params;

    const { close } = useDialogContext();

    const [currentIndex, setCurrentIndex] = useState(selectedIndex);

    const gauge = gauges[currentIndex];

    const handleNext = () => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < gauges.length) {
            setCurrentIndex(nextIndex);
        } else {
            setCurrentIndex(0);
        }
    };

    const handlePrevious = () => {
        const prevIndex = currentIndex - 1;
        if (prevIndex >= 0) {
            setCurrentIndex(prevIndex);
        } else {
            setCurrentIndex(gauges.length - 1);
        }
    };

    return (
        <>
            <Dialog.Header title={gauge.name} onClose={close} />
            <Dialog.Content className="pb-3">
                <GaugeVoterGaugeDetailsDialogContent gauge={gauge} network={network} />
            </Dialog.Content>
            <GaugeVoterGaugeDetailsDialogFooter onPrevious={handlePrevious} onNext={handleNext} />
        </>
    );
};
