import dagre from '@dagrejs/dagre';
import { FlowAppNode } from '@/types/flow';
import { Edge } from '@xyflow/react';

const nodeWidth = 250;
const nodeHeight = 150;

export function autoLayout(nodes: FlowAppNode[], edges: Edge[]): { nodes: FlowAppNode[], edges: Edge[] } {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // Top-to-Bottom, as our node handles are Top/Bottom
    dagreGraph.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 100 });

    nodes.forEach((node) => {
        // Make pseudo nodes smaller for layout
        const w = (node.type === 'prompter' || node.type === 'toolbox') ? 180 : nodeWidth;
        const h = (node.type === 'prompter' || node.type === 'toolbox') ? 80 : nodeHeight;
        dagreGraph.setNode(node.id, { width: w, height: h });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);

        // We don't want to use DAGRE's exact placement for toolbox/prompter
        // But it's okay for an initial naive approach
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - (node.type === 'prompter' ? 90 : nodeWidth / 2),
                y: nodeWithPosition.y - (node.type === 'prompter' ? 40 : nodeHeight / 2),
            },
            targetPosition: 'top',
            sourcePosition: 'bottom',
        };
    });

    return { nodes: layoutedNodes as FlowAppNode[], edges };
}
