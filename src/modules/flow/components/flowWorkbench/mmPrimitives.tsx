'use client';

/**
 * Small workbench primitives that gov-ui-kit doesn't provide directly:
 * a token-amount renderer, a stat block, a micro status pill (the kit `Tag`
 * is intentionally larger), an iOS-style on/off switch, a live badge and a
 * click-away backdrop. Everything else (buttons, cards, full-size tags, empty
 * states, spinners, icons) comes straight from the kit.
 *
 * Styled with Tailwind on kit color tokens — no vendored CSS.
 */

import classNames from 'classnames';
import type { CSSProperties, ReactNode } from 'react';
import type { FlowFidelity } from '../../canvas/flowGraphTypes';
import { type MmTone, toneChip } from './tone';

/**
 * Format a numeric token amount with thousands separators (no forced decimals
 * unless fractional). Returns `null` for nullish input so callers can branch on
 * "opaque/unknown" amounts.
 */
export const fmtAmount = (n: number | null | undefined): string | null => {
    if (n == null) {
        return null;
    }
    const hasFrac = Math.abs(n % 1) > 1e-9;
    return n.toLocaleString('en-US', {
        minimumFractionDigits: hasFrac ? 1 : 0,
        maximumFractionDigits: 2,
    });
};

export interface IPillProps {
    tone?: MmTone;
    children: ReactNode;
    /** Render a leading status dot tinted to the tone. */
    dot?: boolean;
    className?: string;
}

/** Micro status pill — smaller than the kit `Tag`, for canvas/inspector tags. */
export const Pill: React.FC<IPillProps> = (props) => {
    const { tone = 'neutral', children, dot, className } = props;
    return (
        <span
            className={classNames(
                'inline-flex items-center gap-1 rounded-full px-2 py-px font-semibold text-[11px] leading-tight',
                toneChip[tone],
                className,
            )}
        >
            {dot && (
                <span className="size-1.5 shrink-0 rounded-full bg-current opacity-80" />
            )}
            {children}
        </span>
    );
};

export interface ISwitchProps {
    on: boolean;
    onChange?: (next: boolean) => void;
    label: string;
    disabled?: boolean;
}

/** iOS-style on/off switch (kit ships only a segmented Toggle). */
export const Switch: React.FC<ISwitchProps> = (props) => {
    const { on, onChange, label, disabled } = props;
    return (
        <button
            aria-checked={on}
            aria-label={label}
            className={classNames(
                'relative h-[22px] w-10 shrink-0 rounded-full transition-colors',
                on ? 'bg-primary-500' : 'bg-neutral-200',
                disabled && 'cursor-not-allowed opacity-55',
            )}
            disabled={disabled}
            onClick={() => onChange?.(!on)}
            role="switch"
            type="button"
        >
            <span
                className={classNames(
                    'absolute top-0.5 left-0.5 size-[18px] rounded-full bg-neutral-0 shadow-neutral transition-transform',
                    on && 'translate-x-[18px]',
                )}
            />
        </button>
    );
};

export const LiveBadge: React.FC<{ label?: string }> = ({ label = 'Live' }) => (
    <span className="inline-flex items-center gap-[7px] rounded-full bg-success-100 px-[11px] py-[5px] font-semibold text-sm text-success-800">
        <span className="mm-blink size-2 rounded-full bg-success-600" />
        {label}
    </span>
);

export interface IAmountProps {
    amount: number | null;
    token?: string;
    fidelity?: FlowFidelity;
    showToken?: boolean;
    big?: boolean;
    className?: string;
}

export const Amount: React.FC<IAmountProps> = (props) => {
    const {
        amount,
        token,
        fidelity = 'real',
        showToken = true,
        big,
        className,
    } = props;
    const valSize = big ? 'text-xl' : '';
    const opaque = fidelity === 'opaque' || amount == null;

    if (opaque) {
        const val = /LP/.test(token ?? '') ? 'LP' : (token ?? '?');
        return (
            <span
                className={classNames(
                    'inline-flex items-baseline gap-1 whitespace-nowrap text-neutral-400',
                    className,
                )}
                title="opaque output — amount not knowable pre-execution"
            >
                <span
                    className={classNames(
                        'font-semibold text-neutral-500 italic',
                        valSize,
                    )}
                >
                    {val}
                </span>
                <span className="rounded-full border border-neutral-300 border-dashed px-[5px] font-semibold text-[0.74em] text-neutral-400">
                    pending
                </span>
            </span>
        );
    }

    const prefix = fidelity === 'estimated' ? '~' : '';
    return (
        <span
            className={classNames(
                'inline-flex items-baseline gap-1 whitespace-nowrap',
                className,
            )}
            title={
                fidelity === 'estimated'
                    ? 'estimated — simulated, not yet executed'
                    : 'real on-chain reading'
            }
        >
            <span
                className={classNames(
                    'num font-semibold',
                    fidelity === 'estimated'
                        ? 'text-info-700'
                        : 'text-neutral-900',
                    valSize,
                )}
            >
                {prefix}
                {fmtAmount(amount)}
            </span>
            {showToken && token && (
                <span className="font-semibold text-[0.82em] text-neutral-500">
                    {token}
                </span>
            )}
        </span>
    );
};

export interface IStatProps {
    label: string;
    children: ReactNode;
    accent?: boolean;
    style?: CSSProperties;
}

export const Stat: React.FC<IStatProps> = ({ label, children, accent }) => (
    <div>
        <div className="font-semibold text-neutral-500 text-xs">{label}</div>
        <div
            className={classNames(
                'mt-0.5 font-semibold text-lg',
                accent ? 'text-primary-600' : 'text-neutral-900',
            )}
        >
            {children}
        </div>
    </div>
);
