// Vendored from dao-launchpad@f/lido-demo:lido/preview/ui/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Adapted: imports rewritten to use the in-tree @/shared/lidoPreview vendoring
// of @aragon/lido-preview, with .ts/.tsx extensions stripped for moduleResolution=bundler.

// Bottom panel — now Status-only.  Status auto-refreshes via `useStatus`;
// this component just provides the resizable chrome + the StatusView render
// surface.  No outer tabs (the Simulation pane was demoted to a confirm
// modal), no close button (status is part of the page, not optional UI).

import { useEffect, useRef, useState } from 'react';
import { StatusView } from './StatusView';
import type { StatusState } from './useStatus';

const MIN_HEIGHT = 180;
const DEFAULT_HEIGHT = 360;

export function StatusPanel({
    state,
    onRefresh,
}: {
    state: StatusState;
    onRefresh: () => void;
}) {
    const [height, setHeight] = useState(DEFAULT_HEIGHT);
    const [dragging, setDragging] = useState(false);
    const dragRef = useRef({ startY: 0, startHeight: 0 });

    useEffect(() => {
        if (!dragging) {
            return;
        }
        function onMove(e: MouseEvent) {
            const delta = dragRef.current.startY - e.clientY;
            const max = Math.max(MIN_HEIGHT, window.innerHeight - 120);
            const next = Math.max(
                MIN_HEIGHT,
                Math.min(max, dragRef.current.startHeight + delta),
            );
            setHeight(next);
        }
        function onUp() {
            setDragging(false);
        }
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        const prevCursor = document.body.style.cursor;
        const prevSelect = document.body.style.userSelect;
        document.body.style.cursor = 'ns-resize';
        document.body.style.userSelect = 'none';
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            document.body.style.cursor = prevCursor;
            document.body.style.userSelect = prevSelect;
        };
    }, [dragging]);

    function onResizeStart(e: React.MouseEvent) {
        e.preventDefault();
        dragRef.current = { startY: e.clientY, startHeight: height };
        setDragging(true);
    }

    return (
        <div className="flow" style={{ height: `${height}px` }}>
            <div
                aria-label="Resize status panel"
                aria-orientation="horizontal"
                className={`flow-resize${dragging ? 'flow-resize-active' : ''}`}
                onMouseDown={onResizeStart}
                role="separator"
            />
            <StatusView onRefresh={onRefresh} state={state} />
        </div>
    );
}
