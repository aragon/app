import { type IconType as GukIconType, Icon } from '@aragon/gov-ui-kit';
import type { CSSProperties } from 'react';

/**
 * Workbench icon adapter.
 *
 * Standard glyphs render through gov-ui-kit's `<Icon>` (the real kit icons — we
 * do NOT vendor kit SVGs). Only the five glyphs the kit genuinely lacks
 * (gate, swap, droplet, bolt, sparkle — authored for this workbench) ship as
 * inline SVG. Sizing is controlled by a wrapper span (`.mm-ic`) so any px size
 * from the design maps exactly; `.mm-ic svg { width/height: 100% }` lives in
 * the workbench stylesheet.
 *
 * `name` is the registry's icon token (kebab-case), matching the design's
 * naming so the ported components read unchanged.
 */

/** kebab icon token → gov-ui-kit IconType key. */
const GUK: Record<string, string> = {
    'app-dashboard': 'APP_DASHBOARD',
    'app-transactions': 'APP_TRANSACTIONS',
    'app-gauge': 'APP_GAUGE',
    'blockchain-wallet': 'BLOCKCHAIN_WALLET',
    'blockchain-block': 'BLOCKCHAIN_BLOCK',
    'blockchain-smartcontract': 'BLOCKCHAIN_SMARTCONTRACT',
    'burn-assets': 'BURN_ASSETS',
    reload: 'RELOAD',
    withdraw: 'WITHDRAW',
    deposit: 'DEPOSIT',
    clock: 'CLOCK',
    'chevron-down': 'CHEVRON_DOWN',
    'chevron-right': 'CHEVRON_RIGHT',
    'chevron-up': 'CHEVRON_UP',
    close: 'CLOSE',
    copy: 'COPY',
    'link-external': 'LINK_EXTERNAL',
    settings: 'SETTINGS',
    menu: 'MENU',
    success: 'SUCCESS',
    critical: 'CRITICAL',
    warning: 'WARNING',
    info: 'INFO',
    checkmark: 'CHECKMARK',
    'dots-vertical': 'DOTS_VERTICAL',
    expand: 'EXPAND',
    shrink: 'SHRINK',
    filter: 'FILTER',
    search: 'SEARCH',
    plus: 'PLUS',
    minus: 'MINUS',
};

/** Custom glyphs the kit lacks — authored for the money-machine canvas. */
const CUSTOM: Record<string, string> = {
    gate: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" fill-rule="evenodd" d="M4 7V5a4 4 0 0 1 8 0v2h.5A1.5 1.5 0 0 1 14 8.5v6A1.5 1.5 0 0 1 12.5 16h-9A1.5 1.5 0 0 1 2 14.5v-6A1.5 1.5 0 0 1 3.5 7H4Zm2 0h4V5a2 2 0 1 0-4 0v2Zm2 3a1 1 0 0 0-1 1v1.5a1 1 0 1 0 2 0V11a1 1 0 0 0-1-1Z" clip-rule="evenodd"></path></svg>',
    swap: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M1.5 4.5H11V2.2a.6.6 0 0 1 1-.45l3.4 2.9a.7.7 0 0 1 0 1.06l-3.4 2.9a.6.6 0 0 1-1-.45V6H1.5a.75.75 0 0 1 0-1.5ZM14.5 11.5H5V13.8a.6.6 0 0 1-1 .45l-3.4-2.9a.7.7 0 0 1 0-1.06L4 7.39a.6.6 0 0 1 1 .45V10h9.5a.75.75 0 0 1 0 1.5Z"></path></svg>',
    droplet:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M8 .8c.2 0 .4.1.5.3 1 1.4 4.7 6.6 4.7 9.4a5.2 5.2 0 0 1-10.4 0C2.8 7.7 6.5 2.5 7.5 1.1A.6.6 0 0 1 8 .8Z"></path></svg>',
    bolt: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M9.6.6a.5.5 0 0 1 .9.4L9.2 6h3.4a.6.6 0 0 1 .47.97l-6.3 8a.5.5 0 0 1-.88-.43L6.8 9.2H3.4a.6.6 0 0 1-.47-.97L9.6.6Z"></path></svg>',
    sparkle:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M8 0c.3 2.7 1.3 3.7 4 4-2.7.3-3.7 1.3-4 4-.3-2.7-1.3-3.7-4-4 2.7-.3 3.7-1.3 4-4ZM13 9c.16 1.5.7 2 2 2.2-1.3.2-1.84.7-2 2.2-.16-1.5-.7-2-2-2.2 1.3-.2 1.84-.7 2-2.2Z"></path></svg>',
};

export interface IMmIconProps {
    name: string;
    /** Edge length in px. */
    size?: number;
    className?: string;
    style?: CSSProperties;
    title?: string;
}

export const MmIcon: React.FC<IMmIconProps> = (props) => {
    const { name, size = 16, className, style, title } = props;
    const wrapperStyle: CSSProperties = {
        width: size,
        height: size,
        display: 'inline-flex',
        flex: '0 0 auto',
        lineHeight: 0,
        ...style,
    };

    const custom = CUSTOM[name];
    if (custom) {
        return (
            <span
                aria-hidden={title ? undefined : 'true'}
                aria-label={title}
                className={`mm-ic${className ? ` ${className}` : ''}`}
                dangerouslySetInnerHTML={{ __html: custom }}
                role="img"
                style={wrapperStyle}
            />
        );
    }

    const gukKey = GUK[name];
    return (
        <span
            aria-hidden={title ? undefined : 'true'}
            aria-label={title}
            className={`mm-ic${className ? ` ${className}` : ''}`}
            role="img"
            style={wrapperStyle}
        >
            <Icon
                className="size-full"
                icon={
                    (gukKey ??
                        'BLOCKCHAIN_SMARTCONTRACT') as unknown as GukIconType
                }
            />
        </span>
    );
};
