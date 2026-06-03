/**
 * Tone → Tailwind class maps for the workbench, on gov-ui-kit color tokens.
 *
 * The Claude Design bundle expressed tones via three CSS vars per scheme
 * (`--tone` / `--tone-bg` / `--tone-strong`); here we resolve them to static
 * Tailwind utility strings so the kit's token scales drive the colour and
 * nothing is vendored. Keyed by {@link MmTone}, which also lines up 1:1 with
 * gov-ui-kit's `TagVariant`.
 */

import type { TagVariant } from '@aragon/gov-ui-kit';
import type { FlowRuntimeState } from '../../canvas/flowGraphTypes';

export type MmTone = TagVariant; // neutral | info | warning | critical | success | primary

/** Node-state vocabulary → label + tone. Mirrors the design's `STATES`. */
export const MM_STATES: Record<
    FlowRuntimeState,
    { label: string; tone: MmTone }
> = {
    idle: { label: 'Idle', tone: 'neutral' },
    accumulating: { label: 'Accumulating', tone: 'info' },
    firing: { label: 'Firing', tone: 'primary' },
    blocked: { label: 'Blocked', tone: 'critical' },
    done: { label: 'Done', tone: 'success' },
    failed: { label: 'Failed', tone: 'critical' },
    skipped: { label: 'Skipped', tone: 'neutral' },
};

/** Left accent bar (node module) — directional border colour. */
export const toneAccentBorder: Record<MmTone, string> = {
    neutral: 'border-l-neutral-400',
    info: 'border-l-info-500',
    primary: 'border-l-primary-500',
    critical: 'border-l-critical-500',
    success: 'border-l-success-600',
    warning: 'border-l-warning-500',
};

/** Soft chip / badge surface — background + strong text. */
export const toneChip: Record<MmTone, string> = {
    neutral: 'bg-neutral-100 text-neutral-700',
    info: 'bg-info-100 text-info-800',
    primary: 'bg-primary-50 text-primary-700',
    critical: 'bg-critical-100 text-critical-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
};

/** Raw accent colour utility for pulse rings / dots. */
export const tonePulseVar: Record<MmTone, string> = {
    neutral: 'var(--color-neutral-400)',
    info: 'var(--color-info-500)',
    primary: 'var(--color-primary-500)',
    critical: 'var(--color-critical-500)',
    success: 'var(--color-success-600)',
    warning: 'var(--color-warning-500)',
};
