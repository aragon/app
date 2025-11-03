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
    /**
     * User's total voting power for the epoch.
     */
    totalVotingPower: number;
    /**
     * User's votes per gauge.
     */
    gaugeVotes: Array<{
        /**
         * Address of the gauge.
         */
        gaugeAddress: string;
        /**
         * User voting power applied in this vote.
         */
        userVotes: number;
    }>;
}

export interface IGaugeVoterGaugeDetailsDialogProps
    extends IDialogComponentProps<IGaugeVoterGaugeDetailsDialogParams> {}

export const GaugeVoterGaugeDetailsDialog: React.FC<IGaugeVoterGaugeDetailsDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'GaugeVoterGaugeDetailsDialog: required parameters must be set.');

    const { gauges, selectedIndex, network, gaugeVotes } = location.params;

    const { close } = useDialogContext();

    const [currentIndex, setCurrentIndex] = useState(selectedIndex);

    const gauge = gauges[currentIndex];
    const userVotes = gaugeVotes.find((v) => v.gaugeAddress === gauge.address)?.userVotes ?? 0;

    const isFirstGauge = currentIndex === 0;
    const isLastGauge = currentIndex === gauges.length - 1;

    const handleNext = () => {
        if (!isLastGauge) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (!isFirstGauge) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <>
            <Dialog.Header title={gauge.name ?? 'Gauge'} onClose={close} description={gauge.description ?? undefined} />
            <Dialog.Content className="pb-3">
                <GaugeVoterGaugeDetailsDialogContent gauge={gauge} network={network} userVotes={userVotes} />
            </Dialog.Content>
            <GaugeVoterGaugeDetailsDialogFooter
                onPrevious={handlePrevious}
                onNext={handleNext}
                disablePrevious={isFirstGauge}
                disableNext={isLastGauge}
                currentGaugeNumber={currentIndex + 1}
                totalGauges={gauges.length}
            />
        </>
    );
};
