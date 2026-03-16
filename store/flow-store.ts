import { create } from 'zustand';
import { FlowAppNode, FlowYamlConfig } from '../types/flow';
import { Edge } from '@xyflow/react';
import { sortEdges } from '@/lib/sorting';
import { createWithEqualityFn } from 'zustand/traditional';

interface FlowState {
    nodes: FlowAppNode[];
    edges: Edge[];
    activeFlowConfig: FlowYamlConfig | null;
    selectedNodeId: string | null;
    getNodes: () => FlowAppNode[];
    getEdges: () => Edge[];
    setNodes: (nodesUpdater: FlowAppNode[] | ((nodes: FlowAppNode[]) => FlowAppNode[])) => void;
    setEdges: (edgesUpdater: Edge[] | ((edges: Edge[]) => Edge[])) => void;
    setActiveFlow: (config: FlowYamlConfig) => void;
    setSelectedNodeId: (id: string | null) => void;
    updateNodeData: (id: string, data: Partial<FlowAppNode['data']>) => void;
}

type FlowSlice = Pick<FlowState, 
    'nodes' | 
    'edges' | 
    'selectedNodeId' | 
    'updateNodeData'
>;


export const useFlowStore = createWithEqualityFn<FlowState>((set, get) => ({
    nodes: [],
    edges: [],
    sortedEdges: [],
    activeFlowConfig: null,
    selectedNodeId: null,
    getNodes: () => get().nodes,
    getEdges: () => get().edges,
    setNodes: (nodesUpdater) => set((state) => ({
        nodes: typeof nodesUpdater === 'function' ? nodesUpdater(state.nodes) : nodesUpdater
    })),
    setEdges: (edgesUpdater) => set((state) => ({
        edges: typeof edgesUpdater === 'function' ? edgesUpdater(state.edges) : edgesUpdater
    })),
    setActiveFlow: (config) => set({ activeFlowConfig: config }),
    setSelectedNodeId: (id) => set({ selectedNodeId: id }),
    updateNodeData: (id, data) => set((state) => ({
        nodes: state.nodes.map(node =>
            node.id === id ? { ...node, data: { ...node.data, ...data } } : node
        )
    }))
}));


export const selectSelectedNode = (state: FlowState) => {
    const node = state.nodes.find((n) => n.id === state.selectedNodeId);
    if (!node) return null;
    // We need to include position for TypeScript compatibility, but our equality function ignores it
    return node;
};

// deep equality checker to optimise PropertiesPanel Rerenders
// Compares the relevant parts of the state (ignoring position and other UI-only fields)
export const areEqual = (prev: FlowState, next: FlowState) => {
    if (prev.selectedNodeId !== next.selectedNodeId) return false;
    
    // Compare nodes: ignore position, selected, hidden, etc. - only compare id, type, and data
    if (prev.nodes.length !== next.nodes.length) return false;
    for (let i = 0; i < prev.nodes.length; i++) {
        const prevNode = prev.nodes[i];
        const nextNode = next.nodes[i];
        if (prevNode.id !== nextNode.id) return false;
        if (prevNode.type !== nextNode.type) return false;
        // Compare data fields (deep comparison)
        if (JSON.stringify(prevNode.data) !== JSON.stringify(nextNode.data)) return false;
    }
    
    // Compare edges: we care about the logical connections (source, target) and ignore
    // position-related fields (sourcePosition, targetPosition) and order (since we sort in getNodeInputList)
    const prevSortedEdges = sortEdges(prev.edges);
    const nextSortedEdges = sortEdges(next.edges);
    if (prevSortedEdges.length !== nextSortedEdges.length) return false;
    for (let i = 0; i < prevSortedEdges.length; i++) {
        const prevEdge = prevSortedEdges[i];
        const nextEdge = nextSortedEdges[i];
        if (prevEdge.id !== nextEdge.id) return false;
        if (prevEdge.source !== nextEdge.source) return false;
        if (prevEdge.target !== nextEdge.target) return false;
        // Note: we ignore edge.type and edge.data as they are not used in getNodeInputList
    }

    return true;
};

export const areSliceEqual = (
    prev: Omit<FlowSlice, 'updateNodeData'>, 
    next: Omit<FlowSlice, 'updateNodeData'>
): boolean => {
    if (prev.selectedNodeId !== next.selectedNodeId) return false;
    if (prev.nodes.length !== next.nodes.length) return false;

    // Lookup by id — order in the array can shift during drag
    const prevNodeMap = new Map(prev.nodes.map((n) => [n.id, n]));
    for (const nextNode of next.nodes) {
        const prevNode = prevNodeMap.get(nextNode.id);
        if (!prevNode) return false;
        if (prevNode.type !== nextNode.type) return false;
        // Explicitly only compare data — position, selected, dragging are ignored
        if (JSON.stringify(prevNode.data) !== JSON.stringify(nextNode.data)) return false;
    }

    const prevSorted = sortEdges(prev.edges);
    const nextSorted = sortEdges(next.edges);
    if (prevSorted.length !== nextSorted.length) return false;
    for (let i = 0; i < prevSorted.length; i++) {
        if (prevSorted[i].id !== nextSorted[i].id) return false;
        if (prevSorted[i].source !== nextSorted[i].source) return false;
        if (prevSorted[i].target !== nextSorted[i].target) return false;
    }

    return true;
};

// Export FlowState so it can be used in other files
export type { FlowState, FlowSlice };