import { Handle, Position, NodeProps } from '@xyflow/react';
import { FlowAppNode } from '@/types/flow';

export default function AgentNode({ data }: NodeProps<FlowAppNode>) {
    return (
        <div className="bg-white border-2 border-indigo-500 rounded-lg shadow-md min-w-[150px]">
            <div className="bg-indigo-500 text-white px-3 py-1 rounded-t-sm text-sm font-semibold flex justify-between items-center">
                <span>{data.name}</span>
            </div>
            <div className="p-3">
                {data.prompt_id && (
                    <div className="text-xs bg-indigo-50 text-indigo-700 rounded px-2 py-1 mb-2 inline-block font-medium">
                        Prompt: {data.prompt_id}
                    </div>
                )}
                {data.toolset && data.toolset.length > 0 && (
                    <div className="text-xs text-gray-600 font-medium">
                        Tools: {data.toolset.length}
                    </div>
                )}
            </div>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-indigo-500" />
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-indigo-500" />
        </div>
    );
}
