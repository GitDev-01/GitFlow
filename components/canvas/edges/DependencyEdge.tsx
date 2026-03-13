import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';

export default function DependencyEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
}: EdgeProps) {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <BaseEdge
            path={edgePath}
            className="stroke-[1.5px] stroke-gray-400 stroke-dasharray-4"
            style={{ strokeDasharray: '5,5' }}
        />
    );
}
