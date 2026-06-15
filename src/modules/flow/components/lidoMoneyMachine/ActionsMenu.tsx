// Vendored from dao-launchpad@f/lido-demo:lido/preview/ui/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Adapted: imports rewritten to use the in-tree @/shared/lidoPreview vendoring
// of @aragon/lido-preview, with .ts/.tsx extensions stripped for moduleResolution=bundler.

// "More actions ▾" — secondary commands dropdown in the header.
//
// Each item fires an action with a sensible default value (kept consistent
// with the corresponding `just demo-*` recipe).  We don't expose per-call
// input boxes here on purpose: the CLI is where you go for tweaks; the UI
// surfaces the canonical buttons.  Items are passed as `groups` — sibling
// items share a group; groups render with a divider between them.

import { useEffect, useRef, useState } from 'react';

export type ActionItem = {
    key: string;
    label: string;
    description?: string;
    run: () => Promise<void>;
};

export function ActionsMenu({
    groups,
    busyKey,
    disabled,
}: {
    groups: ActionItem[][];
    busyKey: string | null;
    disabled?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }
        function onClick(e: MouseEvent) {
            if (!(e.target instanceof Element)) {
                return;
            }
            if (!rootRef.current?.contains(e.target)) {
                setOpen(false);
            }
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const nonEmpty = groups.filter((g) => g.length > 0);

    return (
        <div className="actions-menu" ref={rootRef}>
            <button
                aria-expanded={open}
                aria-haspopup="menu"
                className="secondary"
                disabled={disabled || busyKey !== null}
                onClick={() => setOpen((o) => !o)}
                type="button"
            >
                More actions ▾
            </button>
            {open && (
                <div className="actions-menu-list" role="menu">
                    {nonEmpty.map((group, gi) => (
                        <ul
                            className="actions-menu-group"
                            key={gi}
                            role="group"
                        >
                            {group.map((it) => {
                                const busy = busyKey === it.key;
                                return (
                                    <li key={it.key} role="none">
                                        <button
                                            disabled={busyKey !== null}
                                            onClick={async () => {
                                                setOpen(false);
                                                await it.run();
                                            }}
                                            role="menuitem"
                                            type="button"
                                        >
                                            <span className="actions-menu-label">
                                                {it.label}
                                            </span>
                                            {it.description && (
                                                <span className="actions-menu-desc">
                                                    {it.description}
                                                </span>
                                            )}
                                            {busy && (
                                                <span className="actions-menu-busy">
                                                    …
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    ))}
                </div>
            )}
        </div>
    );
}
