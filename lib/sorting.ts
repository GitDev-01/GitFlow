import { FlowAppNode } from "@/types/flow";
import { Edge } from "@xyflow/react";

export const sortEdges = (edges: Edge[]) => {
    const sortedEdges: Edge[] = [];
    const visited = new Set<string>();
    const queue: string[] = [];

    // Find the start node and seed the queue
    const startEdge = edges.find((edge) => edge.source === "start");
    if (!startEdge) return edges;

    queue.push("start");

    while (queue.length > 0) {
        const current = queue.shift()!;

        if (visited.has(current)) continue;
        visited.add(current);

        // Find ALL edges from this source (handles conditional branches)
        const outgoing = edges.filter((edge) => edge.source === current);

        for (const edge of outgoing) {
            sortedEdges.push(edge);
            queue.push(edge.target);
        }
    }

    return sortedEdges;
};

export const validateEndNodes = (nodes: FlowAppNode[], edges: Edge[]): { updatedNodes: FlowAppNode[], updatedEdges: Edge[] } => {
    const updatedNodes = [...nodes];
    const updatedEdges = [...edges];

    const endNode = nodes.find((node) => node.id === "end");

    if (!endNode) {
        updatedNodes.push({
            id: "end",
            type: "end",
            position: { x: 0, y: 0 },
            data: {},
        });
    }

    const functionalNodes = nodes.filter(
        (node) => node.id !== "start" && node.id !== "end"
    );

    const sourcesWithTargets = new Set(edges.map((edge) => edge.source));

    const terminalNodes = functionalNodes.filter(
        (node) => !sourcesWithTargets.has(node.id)
    );

    terminalNodes.forEach((node) => {
        updatedEdges.push({
            id: `e-${node.id}-end`,
            source: node.id,
            target: "end",
        });
    });

    return { updatedNodes, updatedEdges };
};