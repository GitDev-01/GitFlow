'use client';

import { useCallback, useEffect, useMemo } from 'react';
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

import { useMCP } from '../hooks/mcp';
import { parseYamlToGraph } from '@/lib/yaml-to-graph';
import { FlowYamlConfig } from '@/types/flow';
import yaml from 'js-yaml';
import { validateEndNodes } from '@/lib/sorting';

export default function FlowCanvas() {
    const { nodes, edges, setNodes, setEdges, setSelectedNodeId, setActiveFlow } = useFlowStore();

    const {lastAction, isConnected} = useMCP()

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
        (connection) => {
            setEdges((eds) => addEdge({ ...connection, type: 'router' }, eds))
        },
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

    useEffect(()=>{
    if (lastAction?.type === "YAML_UPDATE") {
        const { nodes, edges } = parseYamlToGraph(lastAction.data);
        const config = yaml.load(lastAction.data) as FlowYamlConfig;

        const {updatedNodes, updatedEdges} = validateEndNodes(nodes, edges)

        setNodes(updatedNodes);
        setEdges(updatedEdges);
        setActiveFlow(config);
    }
    }, [lastAction])

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
