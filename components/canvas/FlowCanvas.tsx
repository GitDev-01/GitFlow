'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    applyNodeChanges,
    applyEdgeChanges,
    Panel,
    EdgeChange,
    Connection,
    addEdge,
    OnSelectionChangeParams,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
    Edge
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
import { FlowAppNode, FlowYamlConfig } from '@/types/flow';
import yaml from 'js-yaml';
import { validateEndNodes } from '@/lib/sorting';

import {toast} from 'sonner'

import { Silkscreen } from 'next/font/google';
import { InfoIcon } from 'lucide-react';
import { QuickGuidesDialog } from '../toolbar/QuickGuide';
import InfoSpinner from '../misc/spinner';

const slikscreen = Silkscreen({
  weight: "400",
  fallback: ["arial"],
  variable: "--nunito",
  subsets: ["latin"]
})

export default function FlowCanvas() {
    const { nodes, edges, setNodes, setEdges, setSelectedNodeId, setActiveFlow } = useFlowStore();

    const {lastAction, isConnected} = useMCP()
    const [open, setOpenDialog] = useState<boolean>(false)

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
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds) as FlowAppNode[]),
        [setNodes]
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges]
    );

    const onConnect = useCallback((connection: Connection) => {
        setEdges((prevEdges) => {
            const existingSourceEdges = prevEdges.filter(
                (edge) => edge.source === connection.source
            );

            if (existingSourceEdges.length >= 2) {
                toast.warning("A node can only have two outgoing routes.", {description: "Routes types are Single or Conditional", position: "top-center"});
            }

            // Block if source already has 2 or more edges
            if (existingSourceEdges.length >= 2) return prevEdges;

            const existingEdge = existingSourceEdges[0];

            // No conflict — add a plain edge
            if (!existingEdge) {
                const newEdge: Edge = {
                    type: "router",
                    id: `e-${connection.source}-${connection.target}`,
                    source: connection.source!,
                    target: connection.target!,
                };
                return [...prevEdges, newEdge];
            }

            if (connection.source === "start") {
                toast.warning("Start nodes have one outgoing route.", {description: "GitLab Flows only allow 1 entry component", position: "top-center"});
                return prevEdges;
            }

            const sourceName = nodes.find((n)=>connection.source===n.id)?.data.name

            // Conflict — upgrade both edges to conditional
            const updatedExistingEdge: Edge = {
                ...existingEdge,
                type: "router",
                label: "success",
                data: {
                    ...existingEdge.data,
                    condition_input: `context:${sourceName}.execution_result`,
                    route_value: "success"
                },
            };

            const newConditionalEdge: Edge = {
                type: "router",
                id: `e-${connection.source}-${connection.target}`,
                source: connection.source!,
                target: connection.target!,
                label: "failed",
                data: {
                    condition_input: `context:${sourceName}.execution_result`,
                    route_value: "failed"
                },
            };

            return [
                ...prevEdges.filter((edge) => edge.id !== existingEdge.id),
                updatedExistingEdge,
                newConditionalEdge,
            ];
        });
    }, [setEdges]);

    const onBeforeDelete = useCallback(
        async ({ nodes, edges }: { nodes: FlowAppNode[]; edges: Edge[] }) => {
            setEdges((prevEdges) => {
                const deletedNodeIds = new Set(nodes.map((n) => n.id));

                // Collect all edges being removed — explicitly deleted ones
                // plus any connected to a deleted node
                const edgesToRemove = new Set(
                    prevEdges
                        .filter(
                            (edge) =>
                                edges.some((e) => e.id === edge.id) ||
                                deletedNodeIds.has(edge.source) ||
                                deletedNodeIds.has(edge.target)
                        )
                        .map((e) => e.id)
                );

                // Downgrade any surviving sibling conditional edges
                let updatedEdges = prevEdges.map((edge) => {
                    if (edgesToRemove.has(edge.id)) return edge;

                    const isConditional = !!edge.data?.route_value;
                    if (!isConditional) return edge;

                    // Check if this edge's conditional sibling is being removed
                    const sibling = prevEdges.find(
                        (e) =>
                            e.source === edge.source &&
                            e.id !== edge.id &&
                            edgesToRemove.has(e.id)
                    );

                    if (!sibling) return edge;

                    return {
                        ...edge,
                        label: undefined,
                        data: {
                            ...edge.data,
                            input: undefined,
                            route_value: undefined,
                        },
                    };
                });

                return updatedEdges.filter((edge) => !edgesToRemove.has(edge.id));
            });

            setNodes((prevNodes) => {
                const deletedNodeIds = new Set(nodes.map((n) => n.id));
                return prevNodes.filter((node) => !deletedNodeIds.has(node.id));
            });

            return false;
        },
        [setEdges, setNodes]
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
                onBeforeDelete={onBeforeDelete}
                onSelectionChange={onSelectionChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
            >
                <Background gap={16} size={1} color="#e5e7eb" />
                <Controls />
                <MiniMap zoomable pannable nodeClassName={(node) => `bg-gray-200`} />
                <Panel position='top-left' className="relative cursor-pointer"><InfoSpinner handleOpenDialog={()=>setOpenDialog(true)}/></Panel>
            </ReactFlow>
            <QuickGuidesDialog open={open} onOpenChange={setOpenDialog}/>

            {/* Add empty state overlay here */}
            {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="text-center text-gray-400">
                        <p className={`text-9xl font-medium ${slikscreen.className}` }>Git Flow</p>
                        <p className="text-xl">Drag components to start your flow!!</p>
                    </div>
                </div>
            )}
        </div>
    );
}
