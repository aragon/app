import { Handle, Position } from '@xyflow/react';
import { PERMISSION_GRAPH_HANDLE } from './permissionGraphNodeTypes';

const SOURCE_HANDLES = [
    { id: PERMISSION_GRAPH_HANDLE.sourceTop, position: Position.Top },
    { id: PERMISSION_GRAPH_HANDLE.sourceRight, position: Position.Right },
    { id: PERMISSION_GRAPH_HANDLE.sourceBottom, position: Position.Bottom },
    { id: PERMISSION_GRAPH_HANDLE.sourceLeft, position: Position.Left },
];

const TARGET_HANDLES = [
    { id: PERMISSION_GRAPH_HANDLE.targetTop, position: Position.Top },
    { id: PERMISSION_GRAPH_HANDLE.targetRight, position: Position.Right },
    { id: PERMISSION_GRAPH_HANDLE.targetBottom, position: Position.Bottom },
    { id: PERMISSION_GRAPH_HANDLE.targetLeft, position: Position.Left },
];

export const PermissionGraphHandles: React.FC = () => (
    <>
        {TARGET_HANDLES.map((handle) => (
            <Handle
                className="pointer-events-none size-0 border-0 bg-transparent opacity-0"
                id={handle.id}
                key={handle.id}
                position={handle.position}
                type="target"
            />
        ))}
        {SOURCE_HANDLES.map((handle) => (
            <Handle
                className="pointer-events-none size-0 border-0 bg-transparent opacity-0"
                id={handle.id}
                key={handle.id}
                position={handle.position}
                type="source"
            />
        ))}
    </>
);
