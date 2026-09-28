import type React from 'react';
import { useCallback, useRef, useState } from 'react';

interface IPosition {
    x: number;
    y: number;
}

const INITIAL_POSITION: IPosition = { x: 16, y: 16 };
const PANEL_MARGIN = 16;

/**
 * Drags an absolute-positioned overlay panel within its parent container.
 *
 * Returns the refs, position, and pointer handlers both panels need — pulled out
 * so the permission-detail and node-detail panels share one implementation.
 * The parent container is `panelRef.current?.parentElement`.
 */
export const useDraggablePanel = () => {
    const panelRef = useRef<HTMLDivElement>(null);
    const dragOffsetRef = useRef<IPosition | undefined>(undefined);
    const [position, setPosition] = useState<IPosition>(INITIAL_POSITION);
    const [isDragging, setIsDragging] = useState(false);

    const clampPosition = useCallback((next: IPosition): IPosition => {
        const panel = panelRef.current;
        const container = panel?.parentElement;

        if (panel == null || container == null) {
            return next;
        }

        const maxX = Math.max(
            PANEL_MARGIN,
            container.clientWidth - panel.offsetWidth - PANEL_MARGIN,
        );
        const maxY = Math.max(
            PANEL_MARGIN,
            container.clientHeight - panel.offsetHeight - PANEL_MARGIN,
        );

        return {
            x: Math.min(Math.max(next.x, PANEL_MARGIN), maxX),
            y: Math.min(Math.max(next.y, PANEL_MARGIN), maxY),
        };
    }, []);

    const handleDragStart = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            const panel = panelRef.current;

            if (panel == null) {
                return;
            }

            const panelRect = panel.getBoundingClientRect();
            dragOffsetRef.current = {
                x: event.clientX - panelRect.left,
                y: event.clientY - panelRect.top,
            };
            setIsDragging(true);
            event.currentTarget.setPointerCapture(event.pointerId);
        },
        [],
    );

    const handleDragMove = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            if (!isDragging || dragOffsetRef.current == null) {
                return;
            }

            const container = panelRef.current?.parentElement;

            if (container == null) {
                return;
            }

            const containerRect = container.getBoundingClientRect();
            const nextPosition = {
                x: event.clientX - containerRect.left - dragOffsetRef.current.x,
                y: event.clientY - containerRect.top - dragOffsetRef.current.y,
            };

            setPosition(clampPosition(nextPosition));
        },
        [clampPosition, isDragging],
    );

    const handleDragEnd = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            dragOffsetRef.current = undefined;
            setIsDragging(false);

            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
            }
        },
        [],
    );

    const headerProps: React.HTMLAttributes<HTMLDivElement> = {
        onPointerCancel: handleDragEnd,
        onPointerDown: handleDragStart,
        onPointerMove: handleDragMove,
        onPointerUp: handleDragEnd,
    };

    return {
        panelRef,
        position,
        headerProps,
        style: { left: position.x, top: position.y } as React.CSSProperties,
    };
};
