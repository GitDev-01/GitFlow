import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, useReactFlow } from '@xyflow/react';

export default function RouterEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    label,
    markerEnd,
    data,
}: EdgeProps) {
    const { setEdges } = useReactFlow();

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const toggleLabel = () => {
        setEdges((prevEdges) => {
            const thisEdge = prevEdges.find((edge) => edge.id === id);
            if (!thisEdge) return prevEdges;

            const newLabel = thisEdge.data?.route_value === 'success' ? 'failed' : 'success';
            const siblingLabel = newLabel === 'success' ? 'failed' : 'success';

            return prevEdges.map((edge) => {
                // This edge
                if (edge.id === id) {
                    return { ...edge, label: newLabel, data: { ...edge.data, route_value: newLabel } };
                }
                // Sibling — same source, conditional
                if (edge.source === thisEdge.source && edge.data?.route_value) {
                    return { ...edge, label: siblingLabel, data: { ...edge.data, route_value: siblingLabel } };
                }
                return edge;
            });
        });
    };

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} className="stroke-2 stroke-gray-600 transition-all hover:stroke-4" />
            {label && (
                <EdgeLabelRenderer>
                    <button
                        onClick={toggleLabel}
                        className="absolute px-2 py-1 rounded shadow text-xs font-semibold border border-gray-300 bg-white hover:brightness-95 transition-all"
                        style={{
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: 'all',
                            color: label === 'success' ? '#16a34a' : label === 'failed' ? '#dc2626' : '#4b5563'
                        }}
                    >
                        {label}
                    </button>
                </EdgeLabelRenderer>
            )}
        </>
    );
}