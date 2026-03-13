'use client';

import { useFlowStore } from '@/store/flow-store';
import { MultiSelect } from '../use-select/MultiSelect';
import { agentTools, agentUILogEvent, oneOffUILogEvent } from '@/lib/select-data';
import { SingleSelect } from '../use-select/SingleSelect';
import { useCallback } from 'react';
import { FlowAppNode } from '@/types/flow';
import { sortEdges } from '@/lib/sorting';
import { MultiSelectWithAlias } from '../use-select/MultiSelectWithAlias';


export default function PropertiesPanel() {
    const { nodes, edges, selectedNodeId, updateNodeData } = useFlowStore();

    const getNodeInputList = useCallback((selectedNode: FlowAppNode) => {
        const inputs = [{id: "1", name: "context:goal"}, {id: "2", name: "context:user_request"}]
        const sortedEdges = sortEdges(edges)

        const availableNodes: FlowAppNode[] = []

        for (let i = 0; i < sortedEdges.length; i ++ ) {
            const edge = sortedEdges[i]

            if (selectedNode.id !== edge.source){
                availableNodes.push(nodes.find((node)=> node.id === edge.source)!)
            } else {
                break;
            }
        }

        let index = 3;
        availableNodes.forEach((node)=>{

            if (node.type === "agentComponent"){
                inputs.push({id: (""+index), name: (node.data.name ?? node.id)+ " - Final Answer"})
                index++;
                inputs.push({id: (""+index), name: (node.data.name ?? node.id)+ " - Conversation History"})
                index++;
                inputs.push({id: (""+index), name: "status"})
                index++;
            } else if (node.type === "deterministicComponent") {
                inputs.push({id: (""+index), name: (node.data.name ?? node.id)+ " - Tool Responses"})
                index++;
                inputs.push({id: (""+index), name: (node.data.name ?? node.id)+ " - Error"})
                index++;
                inputs.push({id: (""+index), name: (node.data.name ?? node.id)+ " - Execution Result"})
                index++;
            } else if (node.type === "oneOffComponent") {
                inputs.push({id: (""+index), name: (node.data.name ?? node.id)+ " - Tool Responses"})
                index++;
                inputs.push({id: (""+index), name: (node.data.name ?? node.id)+ " - Tool Calls"})
                index++;
                inputs.push({id: (""+index), name: (node.data.name ?? node.id)+ " - Execution Result"})
                index++;    
                inputs.push({id: (""+index), name: "UI Chat Log"})
                index++;
                inputs.push({id: (""+index), name: "Conversation History"})
                index++;
            }
        })
        return inputs
    }, [])

    if (!selectedNodeId) {
        return (
            <div className="p-6 border-l border-slate-200 bg-white shadow-sm flex flex-col justify-center items-center w-80 h-full z-10">
                <div className="text-slate-400 text-sm text-center">
                    Select a node on the canvas to view and edit its properties.
                </div>
            </div>
        );
    }

    const selectedNode = nodes.find(n => n.id === selectedNodeId);
    if (!selectedNode) return null;

    return (
        <div className="p-0 border-l border-slate-200 bg-white shadow-sm flex flex-col w-80 h-full z-10 overflow-y-auto">
            <div className="p-4 border-b border-slate-100 bg-slate-50 sticky top-0">
                <h2 className="text-lg font-bold text-slate-800">Properties</h2>
                <div className="text-xs text-slate-500 capitalize">{selectedNode.type}</div>
            </div>

            <div className="p-4 flex flex-col gap-5">
                {/* Name Input */}
                {['agentComponent', 'deterministicComponent', 'oneOffComponent'].includes(selectedNode.type as string) && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Component Name / ID</label>
                        <input
                            className="w-full text-sm p-2 bg-white border border-slate-300 rounded shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
                            value={selectedNode.data.name || ''}
                            onChange={(e) => updateNodeData(selectedNodeId, { name: e.target.value })}
                            placeholder="e.g. code_analyzer"
                        />
                    </div>
                )}

                {/* Prompt ID */}
                {['agentComponent', 'oneOffComponent', 'prompter'].includes(selectedNode.type as string) && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Prompt ID</label>
                        <input
                            className="w-full text-sm p-2 bg-white border border-slate-300 rounded shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
                            value={selectedNode.data.prompt_id || ''}
                            onChange={(e) => updateNodeData(selectedNodeId, { prompt_id: e.target.value })}
                            placeholder="my_prompt_id"
                        />
                    </div>
                )}

                {/* Prompt Version */}
                {['agentComponent', 'oneOffComponent',].includes(selectedNode.type as string) && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Prompt Version</label>
                        <input
                            className="w-full text-sm p-2 bg-white border border-slate-300 rounded shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
                            value={selectedNode.data.prompt_version || ""}
                            onChange={(e) => updateNodeData(selectedNodeId, { prompt_version: e.target.value })}
                            placeholder="^1.0.0"
                        />
                    </div>
                )}

                {/* Toolset */}
                {['agentComponent', 'oneOffComponent',].includes(selectedNode.type as string) && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Toolset</label>
                        <MultiSelect items={agentTools} saveItems={updateNodeData} nodeId={selectedNodeId} label={"toolset"}/>
                    </div>
                )}

                {/* UI Log Events */}
                {['agentComponent', 'oneOffComponent'].includes(selectedNode.type as string) && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">UI Log Events</label>
                        <MultiSelect items={(selectedNode.type === "agentComponent")? agentUILogEvent: oneOffUILogEvent} saveItems={updateNodeData} nodeId={selectedNodeId} label={"ui_log_events"}/>
                    </div>
                )}

                {/* Input */}
                {['agentComponent', 'oneOffComponent'].includes(selectedNode.type as string) && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Input</label>
                        <MultiSelectWithAlias items={getNodeInputList(selectedNode)} saveItems={updateNodeData} nodeId={selectedNodeId} label={"inputs"}/>
                    </div>
                )}

                {/* UI Role As */}
                {['agentComponent', 'oneOffComponent',].includes(selectedNode.type as string) && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">UI Role as</label>
                        <SingleSelect items={["agent", "tool"]} label={"ui_role_as"} saveValue={updateNodeData} selectedNodeId={selectedNodeId}/>
                    </div>
                )}

                {/* Tool Name */}
                {selectedNode.type === 'deterministicComponent' && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Tool Name</label>
                        <input
                            className="w-full text-sm p-2 bg-white border border-slate-300 rounded shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-all"
                            value={selectedNode.data.tool_name || ''}
                            onChange={(e) => updateNodeData(selectedNodeId, { tool_name: e.target.value })}
                            placeholder="e.g. read_file"
                        />
                    </div>
                )}

            </div>
        </div>
    );
}
