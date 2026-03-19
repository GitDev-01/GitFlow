'use client';

import { useFlowStore, type FlowState } from '@/store/flow-store';
import { MultiSelect } from '../use-select/MultiSelect';
import { agentTools, agentUILogEvent, oneOffUILogEvent } from '@/lib/select-data';
import { SingleSelect } from '../use-select/SingleSelect';
import { useCallback, useMemo } from 'react';
import { FlowAppNode } from '@/types/flow';
import { sortEdges } from '@/lib/sorting';
import { MultiSelectWithAlias } from '../use-select/MultiSelectWithAlias';
import { Textarea } from '../ui/textarea';
import { Edge } from '@xyflow/react';
import { UseTooltip } from '../use-tooltip/InfoTooltip';
import { Info } from 'lucide-react';

export default function PropertiesPanel() {    
    const { selectedNodeId, nodes, edges, updateNodeData } = useFlowStore(
        (state: FlowState) => ({
            selectedNodeId: state.selectedNodeId,
            nodes: state.nodes,
            edges: state.edges,
            updateNodeData: state.updateNodeData
        }),
        (prev, next) => {
            if (prev.selectedNodeId !== next.selectedNodeId) return false;
            
            if (prev.nodes.length !== next.nodes.length) return false;
            for (let i = 0; i < prev.nodes.length; i++) {
                if (prev.nodes[i].id !== next.nodes[i].id) return false;
                if (prev.nodes[i].type !== next.nodes[i].type) return false;
                if (JSON.stringify(prev.nodes[i].data) !== JSON.stringify(next.nodes[i].data)) return false;
            }
            
            if (prev.edges.length !== next.edges.length) return false;
            for (let i = 0; i < prev.edges.length; i++) {
                if (prev.edges[i].id !== next.edges[i].id) return false;
                if (prev.edges[i].source !== next.edges[i].source) return false;
                if (prev.edges[i].target !== next.edges[i].target) return false;
            }
            
            return true;
        }
    );

    const selectedNode = useMemo(() => {
        return nodes.find(n => n.id === selectedNodeId) || null;
    }, [nodes, selectedNodeId]);

    const getNodeInputList = useCallback((selectedNode: FlowAppNode) => {        
        const inputs = [{id: "1", name: "context:goal"}, {id: "2", name: "context:user_request"}]
        
        const sortedEdges = sortEdges(edges)

        const edgeIndex = sortedEdges.findIndex((edge: Edge)=>edge.target === selectedNode.id)
        if (edgeIndex === -1 ) return inputs

        const nodeIdList = edges.slice(0, edgeIndex+1).map((edge: Edge)=>edge.source)

        const availableNodes: FlowAppNode[] = nodes.filter((node: FlowAppNode)=>nodeIdList.includes(node.id))

        let index = 3;
        availableNodes.forEach((node: FlowAppNode)=>{

            if (node.type === "agentComponent"){
                inputs.push({id: (""+index), name: "context:"+ (node.data.name ?? node.id)+ ".final_answer"})
                index++;
                inputs.push({id: (""+index), name: "conversation_history:"+ (node.data.name ?? node.id)})
                index++;
                inputs.push({id: (""+index), name: "status"})
                index++;
            } else if (node.type === "deterministicComponent") {
                inputs.push({id: (""+index), name: "context:"+ (node.data.name ?? node.id)+ ".tool_responses"})
                index++;
                inputs.push({id: (""+index), name: "context:"+ (node.data.name ?? node.id)+ ".error"})
                index++;
                inputs.push({id: (""+index), name: "context:"+ (node.data.name ?? node.id)+ ".execution_result"})
                index++;
            } else if (node.type === "oneOffComponent") {
                inputs.push({id: (""+index), name: "context:"+ (node.data.name ?? node.id)+ ".tool_responses"})
                index++;
                inputs.push({id: (""+index), name: "context:"+ (node.data.name ?? node.id)+ ".tool_calls"})
                index++;
                inputs.push({id: (""+index), name: "context:"+ (node.data.name ?? node.id)+ ".execution_result"})
                index++;    
                inputs.push({id: (""+index), name: "ui_chat_log"})
                index++;
                inputs.push({id: (""+index), name: "conversation_history:"+ (node.data.name ?? node.id)})
                index++;
            }
        })
        return inputs
    }, [nodes, edges])

    if (!selectedNode) {
        return (
            <div className="p-6 border-l border-slate-200 bg-white shadow-sm flex flex-col justify-center items-center w-80 h-full z-10">
                <div className="text-slate-400 text-sm text-center">
                    Select a node on the canvas to view and edit its properties.
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-0 border-l border-slate-200 bg-white shadow-sm flex flex-col w-80 h-full z-10 overflow-y-auto">
            <div className="p-4 border-b border-slate-100 bg-slate-50 sticky top-0">
                <h2 className="text-lg font-bold text-slate-800">Properties</h2>
                <div className="text-xs text-slate-500 capitalize">{selectedNode.type}</div>
            </div>

            <div className="p-4 flex flex-col gap-5">
                {/* Name Input */}
                {['agentComponent', 'deterministicComponent', 'oneOffComponent', 'prompter'].includes(selectedNode.type as string) && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Component Name / ID <span className=' lowercase text-sm text-slate-400'>(required)</span></label>
                        <input
                            spellCheck="false"
                            className="w-full text-sm p-2 bg-white border border-slate-300 rounded shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
                            value={selectedNode.data.name || ''}
                            onChange={(e) => updateNodeData(selectedNode.id, { name: e.target.value })}
                            placeholder="e.g. code_analyzer"
                        />
                    </div>
                )}

                {/* Prompt ID */}
                {['agentComponent', 'oneOffComponent', 'prompter'].includes(selectedNode.type as string) && (
                    <div>
                        <label className="flex flex-row items-center gap-1 block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                            Prompt ID 
                             <span className=' lowercase text-sm text-slate-400'> (required)</span> 
                            {selectedNode.type !== "prompter" && <UseTooltip trigger={<Info size={15} />} text="Requires a Prompter with the same ID"/>} 
                        </label>
                        <input
                            spellCheck="false"
                            className="w-full text-sm p-2 bg-white border border-slate-300 rounded shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
                            value={selectedNode.data.prompt_id || ''}
                            onChange={(e) => updateNodeData(selectedNode.id, { prompt_id: e.target.value })}
                            placeholder="my_prompt_id"
                        />
                    </div>
                )}

                {/* Prompt Version */}
                {['agentComponent', 'oneOffComponent',].includes(selectedNode.type as string) && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Prompt Version</label>
                        <input
                            spellCheck="false"
                            className="w-full text-sm p-2 bg-white border border-slate-300 rounded shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
                            value={selectedNode.data.prompt_version || ""}
                            onChange={(e) => updateNodeData(selectedNode.id, { prompt_version: e.target.value })}
                            placeholder="^1.0.0"
                        />
                    </div>
                )}

                {/* Tool Name */}
                {selectedNode.type === 'deterministicComponent' && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Tool Name <span className=' lowercase text-sm text-slate-400'>(required)</span></label>
                        <input
                            spellCheck="false"
                            className="w-full text-sm p-2 bg-white border border-slate-300 rounded shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
                            value={selectedNode.data.tool_name || ""}
                            onChange={(e) => updateNodeData(selectedNode.id, { tool_name: e.target.value })}
                            placeholder="e.g. read_file"
                        />                    
                    </div>
                )}

                {/* Single Toolset */}
                {selectedNode.type === 'deterministicComponent' && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Toolset</label>
                        <SingleSelect items={agentTools.map((tool)=>{return tool.name})} saveValue={updateNodeData} label="toolset" value={(selectedNode.data.toolset)?selectedNode.data.toolset[0]: ""} selectedNode={selectedNode} selectedNodeId={selectedNode.id}/>                   
                    </div>
                )}

                {/* Toolset */}
                {['agentComponent', 'oneOffComponent',].includes(selectedNode.type as string) && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Toolset {(selectedNode.type === "oneOffComponent") && <span className=' lowercase text-sm text-slate-400'>(required)</span>}</label>
                        <MultiSelect items={agentTools} saveValues={updateNodeData} nodeId={selectedNode.id} label={"toolset"} values={selectedNode.data.toolset || []}/>
                    </div>
                )}

                {/* UI Log Events */}
                {['agentComponent', 'deterministicComponent', 'oneOffComponent'].includes(selectedNode.type as string) && (

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">UI Log Events</label>
                        <MultiSelect items={(selectedNode.type === "agentComponent")? agentUILogEvent: oneOffUILogEvent} saveValues={updateNodeData} nodeId={selectedNode.id} label={"ui_log_events"} values={selectedNode.data.ui_log_events || []}/>
                    </div>
                )}

                {/* Inputs */}
                {['agentComponent', 'deterministicComponent', 'oneOffComponent'].includes(selectedNode.type as string) && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Inputs</label>
                        <MultiSelectWithAlias items={getNodeInputList(selectedNode)} saveValues={updateNodeData} nodeId={selectedNode.id} label={"inputs"} values={selectedNode.data.inputs?.map((item: any, index: number)=> ( {id: ""+index, name: item.from, alias: item.as}))|| []}/>
                    </div>
                )}

                {/* UI Role As */}
                {['agentComponent', 'deterministicComponent', 'oneOffComponent',].includes(selectedNode.type as string) && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">UI Role as</label>
                        <SingleSelect items={["agent", "tool"]} label={"ui_role_as"} saveValue={updateNodeData} selectedNodeId={selectedNode.id} value={selectedNode.data.ui_role_as || ''}/>
                    </div>
                )}

                {/* Max Correct Attempts */}
                {selectedNode.type === 'oneOffComponent' && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Max Correct Attempts</label>
                        <input
                            type='number'
                            className="w-full text-sm p-2 bg-white border border-slate-300 rounded shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
                            value={selectedNode.data.max_correction_attempts || ""}
                            onChange={(e) => updateNodeData(selectedNode.id, { max_correction_attempts: parseInt(e.target.value, 10) })}
                            placeholder="2"
                        />                    
                    </div>
                )}

                {/* System Prompt */}
                {selectedNode.type === 'prompter' && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">System <span className=' lowercase text-sm text-slate-400'>(required)</span></label>
                        <Textarea
                            spellCheck="false"
                            className="w-full text-sm p-2 bg-white border border-slate-300 rounded shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-all"
                            value={selectedNode.data.prompt_template?.system || ''}
                            onChange={(e) => updateNodeData(selectedNode.id, { prompt_template: {...selectedNode.data.prompt_template, system: e.target.value } })}
                            placeholder="e.g. read_file"
                        />
                    </div>
                )}

                {/* User Prompt */}
                {selectedNode.type === 'prompter' && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">User <span className=' lowercase text-sm text-slate-400'>(required)</span></label>
                        <Textarea
                            spellCheck="false"
                            className="w-full text-sm p-2 bg-white border border-slate-300 rounded shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-all"
                            value={selectedNode.data.prompt_template?.user || ''}
                            onChange={(e) => updateNodeData(selectedNode.id, { prompt_template: {...selectedNode.data.prompt_template, user: e.target.value } })}
                            placeholder="e.g. read_file"
                        />
                    </div>
                )}

                {/* Placeholder */}
                {selectedNode.type === 'prompter' && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Placeholder</label>
                        <SingleSelect items={["history"]} saveValue={updateNodeData} label='placeholder' selectedNode={selectedNode} value={selectedNode.data.prompt_template?.placeholder || ''} selectedNodeId={selectedNode.id} />
                    </div>
                )}

                {/* Timeout */}
                {selectedNode.type === 'prompter' && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Timeout</label>
                        <input
                            type='number'
                            className="w-full text-sm p-2 bg-white border border-slate-300 rounded shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
                            value={selectedNode.data.prompt_params?.timeout || ""}
                            onChange={(e) => updateNodeData(selectedNode.id, { prompt_params: {timeout: parseInt(e.target.value, 10) }})}
                            placeholder="180"
                        />                    
                    </div>
                )}

            </div>
        </div>
    );
}
