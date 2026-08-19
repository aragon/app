// The next/navigation shim of the app does not re-export notFound.
import { notFound } from 'next/navigation-original';
import type { ReactNode } from 'react';
import { ErrorBoundary } from '@/modules/application/components/errorBoundary';
import { featureFlags } from '@/shared/featureFlags';
import { MpcNavigation } from '../mpcNavigation';

export interface ILayoutMpcProps {
    /**
     * Children of the layout.
     */
    children?: ReactNode;
}

/**
 * Layout of the /mpc pages: gated behind the mpcSystems feature flag.
 */
export const LayoutMpc: React.FC<ILayoutMpcProps> = async (props) => {
    const { children } = props;

    const isEnabled = await featureFlags.isEnabled('mpcSystems');

    if (!isEnabled) {
        notFound();
    }

    return (
        <>
            <MpcNavigation />
            <ErrorBoundary>{children}</ErrorBoundary>
        </>
    );
};
