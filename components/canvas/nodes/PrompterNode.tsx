import { NodeProps } from '@xyflow/react';
import { FlowAppNode } from '@/types/flow';

export default function PrompterNode({ data }: NodeProps<FlowAppNode>) {
    return (
        <div className="bg-white border-2 border-dashed border-gray-400 rounded-lg p-3 w-[220px] shadow-sm">
            <div className="font-semibold text-sm mb-2 text-gray-700">Prompter: {data.prompt_id}</div>
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200 min-h-[40px]">
                {data.prompt_template?.system ?
                    (data.prompt_template.system.length > 60 ? data.prompt_template.system.substring(0, 60) + '...' : data.prompt_template.system)
                    : 'No system prompt defined'}
            </div>
            {data.prompt_version && (
                <div className="mt-2 text-[10px] text-gray-400 uppercase tracking-wide">Registry Prompt</div>
            )}
        </div>
    );
}
