'use client';

import { useCallback, useMemo } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    applyNodeChanges,
    applyEdgeChanges,
    NodeChange,
    EdgeChange,
    Connection,
    addEdge,
    OnSelectionChangeParams,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useFlowStore } from '@/store/flow-store';
import AgentNode from './nodes/AgentNode';
import DeterministicNode from './nodes/DeterministicNode';
import OneOffNode from './nodes/OneOffNode';
import PrompterNode from './nodes/PrompterNode';
import ToolboxNode from './nodes/ToolboxNode';
import StartEndNode from './nodes/StartEndNode';
import RouterEdge from './edges/RouterEdge';
import DependencyEdge from './edges/DependencyEdge';

export default function FlowCanvas() {
    const { nodes, edges, setNodes, setEdges, setSelectedNodeId } = useFlowStore();

    const nodeTypes = useMemo(() => ({
        agentComponent: AgentNode,
        deterministicComponent: DeterministicNode,
        oneOffComponent: OneOffNode,
        prompter: PrompterNode,
        toolbox: ToolboxNode,
        start: StartEndNode,
        end: StartEndNode,
    }), []);

    const edgeTypes = useMemo(() => ({
        router: RouterEdge,
        dependency: DependencyEdge,
    }), []);

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges]
    );

    const onConnect: OnConnect = useCallback(
        (connection) => setEdges((eds) => addEdge({ ...connection, type: 'router' }, eds)),
        [setEdges]
    );

    const onSelectionChange = useCallback(
        ({ nodes }: OnSelectionChangeParams) => {
            if (nodes.length > 0) {
                setSelectedNodeId(nodes[0].id);
            } else {
                setSelectedNodeId(null);
            }
        },
        [setSelectedNodeId]
    );

    return (
        <div className="w-full h-full bg-slate-50">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onSelectionChange={onSelectionChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
            >
                <Background gap={16} size={1} color="#e5e7eb" />
                <Controls />
                <MiniMap zoomable pannable nodeClassName={(node) => `bg-gray-200`} />
            </ReactFlow>
        </div>
    );
}
