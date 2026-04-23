'use client';

import classNames from 'classnames';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface IFlowSubNavProps {
    network: string;
    addressOrEns: string;
    className?: string;
}

interface IFlowTab {
    key: string;
    label: string;
    match: (pathname: string, base: string) => boolean;
    href: (base: string) => string;
}

const FLOW_TABS: IFlowTab[] = [
    {
        key: 'overview',
        label: 'Overview',
        match: (pathname, base) =>
            pathname === base ||
            pathname === `${base}/` ||
            pathname.startsWith(`${base}/policies`),
        href: (base) => base,
    },
    {
        key: 'activity',
        label: 'Activity',
        match: (pathname, base) => pathname.startsWith(`${base}/activity`),
        href: (base) => `${base}/activity`,
    },
    {
        key: 'recipients',
        label: 'Recipients',
        match: (pathname, base) => pathname.startsWith(`${base}/recipients`),
        href: (base) => `${base}/recipients`,
    },
];

export const FlowSubNav: React.FC<IFlowSubNavProps> = (props) => {
    const { network, addressOrEns, className } = props;
    const pathname = usePathname() ?? '';
    const base = `/dao/${network}/${addressOrEns}/flow`;

    return (
        <div
            className={classNames(
                'border-neutral-100 border-b bg-neutral-0',
                className,
            )}
        >
            <nav
                aria-label="Flow sections"
                className="mx-auto flex w-full max-w-[1280px] items-center gap-1 px-4 md:px-6"
            >
                {FLOW_TABS.map((tab) => {
                    const active = tab.match(pathname, base);
                    return (
                        <Link
                            aria-current={active ? 'page' : undefined}
                            className={classNames(
                                'relative px-3 py-3 font-normal text-base leading-none transition-colors',
                                active
                                    ? 'text-primary-400'
                                    : 'text-neutral-500 hover:text-neutral-800',
                            )}
                            href={tab.href(base)}
                            key={tab.key}
                        >
                            {tab.label}
                            {active && (
                                <span
                                    aria-hidden={true}
                                    className="absolute right-0 bottom-0 left-0 h-0.5 bg-primary-400"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};
