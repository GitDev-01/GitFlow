import { Handle, Position, NodeProps } from '@xyflow/react';
import { FlowAppNode } from '@/types/flow';

export default function OneOffNode({ data }: NodeProps<FlowAppNode>) {
    return (
        <div className="bg-white border-2 border-amber-500 rounded-lg shadow-md min-w-[150px]">
            <div className="bg-amber-500 text-white px-3 py-1 rounded-t-sm text-sm font-semibold">
                {data.name}
            </div>
            <div className="p-3">
                {data.prompt_id && (
                    <div className="text-xs bg-amber-50 text-amber-700 rounded px-2 py-1 mb-2 inline-block font-medium">
                        Prompt: {data.prompt_id}
                    </div>
                )}
                <div className="flex justify-between items-center text-xs mt-1">
                    {data.toolset && data.toolset.length > 0 && (
                        <span className="text-gray-600 font-medium">Tools: {data.toolset.length}</span>
                    )}
                    {data.max_correction_attempts && (
                        <span className="bg-gray-100 text-gray-500 px-1 rounded">Retry: {data.max_correction_attempts}</span>
                    )}
                </div>
            </div>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-amber-500" />
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-amber-500" />
        </div>
    );
}
