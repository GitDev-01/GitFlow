import { NodeProps } from '@xyflow/react';
import { FlowAppNode } from '@/types/flow';

export default function ToolboxNode({ data }: NodeProps<FlowAppNode>) {
    return (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 w-[180px] shadow-sm">
            <div className="font-semibold text-sm mb-2 text-gray-700">Toolbox</div>
            <div className="flex flex-wrap gap-1">
                {data.toolset && data.toolset.map(tool => (
                    <span key={tool} className="text-[10px] bg-white border border-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full">
                        {tool}
                    </span>
                ))}
                {(!data.toolset || data.toolset.length === 0) && (
                    <span className="text-xs text-gray-400 italic">No tools</span>
                )}
            </div>
        </div>
    );
}
