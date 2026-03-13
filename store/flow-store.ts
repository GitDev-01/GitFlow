import { create } from 'zustand';
import { FlowAppNode, FlowYamlConfig } from '../types/flow';
import { Edge } from '@xyflow/react';

interface FlowState {
    nodes: FlowAppNode[];
    edges: Edge[];
    activeFlowConfig: FlowYamlConfig | null;
    selectedNodeId: string | null;
    setNodes: (nodesUpdater: FlowAppNode[] | ((nodes: FlowAppNode[]) => FlowAppNode[])) => void;
    setEdges: (edgesUpdater: Edge[] | ((edges: Edge[]) => Edge[])) => void;
    setActiveFlow: (config: FlowYamlConfig) => void;
    setSelectedNodeId: (id: string | null) => void;
    updateNodeData: (id: string, data: Partial<FlowAppNode['data']>) => void;
}

export const useFlowStore = create<FlowState>((set) => ({
    nodes: [],
    edges: [],
    sortedEdges: [],
    activeFlowConfig: null,
    selectedNodeId: null,
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
