'use client';

import classNames from 'classnames';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { FlowSubNav } from '../flowSubNav/flowSubNav';
import { FlowToastStack } from '../flowToastStack/flowToastStack';
import { FlowTopbar } from '../flowTopbar/flowTopbar';

export interface IFlowLayoutShellProps {
    daoId: string;
    network: string;
    addressOrEns: string;
    children?: ReactNode;
}

/**
 * Chrome shell for every Flow sub-page. The Workbench needs a full-bleed,
 * viewport-bounded canvas (its own internal scroll regions + auto-fit stage),
 * so on that route we drop the narrow centered `<main>` and bound the height;
 * every other Flow page keeps the standard 1280px column.
 */
export const FlowLayoutShell: React.FC<IFlowLayoutShellProps> = (props) => {
    const { daoId, network, addressOrEns, children } = props;
    const pathname = usePathname() ?? '';
    const base = `/dao/${network}/${addressOrEns}/flow`;
    const isWorkbench = pathname.startsWith(`${base}/workbench`);

    return (
        <div
            className={classNames(
                'flex flex-col bg-neutral-50',
                // Workbench is a full-bleed app view: fill the space the root
                // layout leaves between the topbar and the (sibling) footer
                // (`flex-1 min-h-0`) instead of `h-[100dvh]`, which ignored the
                // footer and made the whole page scroll.
                isWorkbench ? 'min-h-0 flex-1 overflow-hidden' : 'min-h-screen',
            )}
        >
            <FlowTopbar
                addressOrEns={addressOrEns}
                daoId={daoId}
                network={network}
            />
            <FlowSubNav addressOrEns={addressOrEns} network={network} />
            {isWorkbench ? (
                <main className="min-h-0 flex-1">{children}</main>
            ) : (
                <main className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-6 md:py-8">
                    {children}
                </main>
            )}
            <FlowToastStack />
        </div>
    );
};
