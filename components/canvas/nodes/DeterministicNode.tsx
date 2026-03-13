import { Handle, Position, NodeProps } from '@xyflow/react';
import { FlowAppNode } from '@/types/flow';

export default function DeterministicNode({ data }: NodeProps<FlowAppNode>) {
    return (
        <div className="bg-white border-2 border-teal-500 rounded-lg shadow-md min-w-[150px]">
            <div className="bg-teal-500 text-white px-3 py-1 rounded-t-sm text-sm font-semibold">
                {data.name || 'DeterministicStep'}
            </div>
            <div className="p-3">
                {data.tool_name ? (
                    <div className="text-xs bg-teal-50 text-teal-700 rounded px-2 py-1 inline-block font-medium">
                        {data.tool_name}
                    </div>
                ) : (
                    <div className="text-xs text-red-500 italic">No tool selected</div>
                )}
            </div>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-teal-500" />
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-teal-500" />
        </div>
    );
}
