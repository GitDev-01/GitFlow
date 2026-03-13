import { Handle, Position, NodeProps } from '@xyflow/react';
import { FlowAppNode } from '@/types/flow';

export default function StartEndNode({ type }: NodeProps<FlowAppNode>) {
    const isStart = type === 'start';
    const colorClass = isStart ? 'bg-green-500 border-green-600' : 'bg-red-500 border-red-600';

    return (
        <div className={`${colorClass} text-white px-5 py-2 rounded-full shadow-md font-bold text-sm border-2`}>
            {isStart ? 'START' : 'END'}

            {isStart && <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-white" />}
            {!isStart && <Handle type="target" position={Position.Top} className="w-3 h-3 bg-white" />}
        </div>
    );
}
