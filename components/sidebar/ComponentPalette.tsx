'use client';

export default function ComponentPalette() {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="p-4 border-r border-slate-200 bg-white shadow-sm flex flex-col gap-4 w-64 h-full z-10">
            <h2 className="text-lg font-bold text-slate-800">Components</h2>

            <div className="flex flex-col gap-3">
                <div
                    className="bg-white border-2 border-indigo-500 rounded p-3 cursor-grab hover:shadow-md transition-shadow group"
                    draggable
                    onDragStart={(e) => onDragStart(e, 'agentComponent')}
                >
                    <div className="text-indigo-600 font-semibold mb-1 group-hover:text-indigo-700">AgentComponent</div>
                    <div className="text-xs text-slate-500">Core AI component with LLM and tools</div>
                </div>

                <div
                    className="bg-white border-2 border-teal-500 rounded p-3 cursor-grab hover:shadow-md transition-shadow group"
                    draggable
                    onDragStart={(e) => onDragStart(e, 'deterministicComponent')}
                >
                    <div className="text-teal-600 font-semibold mb-1 group-hover:text-teal-700">DeterministicStep</div>
                    <div className="text-xs text-slate-500">Executes a single tool without AI</div>
                </div>

                <div
                    className="bg-white border-2 border-amber-500 rounded p-3 cursor-grab hover:shadow-md transition-shadow group"
                    draggable
                    onDragStart={(e) => onDragStart(e, 'oneOffComponent')}
                >
                    <div className="text-amber-600 font-semibold mb-1 group-hover:text-amber-700">OneOffComponent</div>
                    <div className="text-xs text-slate-500">Single round AI with built-in retries</div>
                </div>

                <div
                    className="bg-white border-2 border-amber-500 rounded p-3 cursor-grab hover:shadow-md transition-shadow group"
                    draggable
                    onDragStart={(e) => onDragStart(e, 'start')}
                >
                    <div className="text-amber-600 font-semibold mb-1 group-hover:text-amber-700">Start Node</div>
                    <div className="text-xs text-slate-500">Single round AI with built-in retries</div>
                </div>

                <div
                    className="bg-white border-2 border-amber-500 rounded p-3 cursor-grab hover:shadow-md transition-shadow group"
                    draggable
                    onDragStart={(e) => onDragStart(e, 'end')}
                >
                    <div className="text-amber-600 font-semibold mb-1 group-hover:text-amber-700">End Node</div>
                    <div className="text-xs text-slate-500">Single round AI with built-in retries</div>
                </div>
            </div>

            <div
                className="bg-white border-2 border-teal-500 rounded p-3 cursor-grab hover:shadow-md transition-shadow group"
                draggable
                onDragStart={(e) => onDragStart(e, 'prompter')}
            >
                <div className="text-teal-600 font-semibold mb-1 group-hover:text-teal-700">Prompter</div>
                <div className="text-xs text-slate-500">Executes a single tool without AI</div>
            </div>

            <div
                className="bg-white border-2 border-indigo-500 rounded p-3 cursor-grab hover:shadow-md transition-shadow group"
                draggable
                onDragStart={(e) => onDragStart(e, 'toolbox')}
            >
                <div className="text-indigo-600 font-semibold mb-1 group-hover:text-indigo-700">Toolbox</div>
                <div className="text-xs text-slate-500">Core AI component with LLM and tools</div>
            </div>

            <div className="mt-auto text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-100 italic text-center">
                Drag components onto the canvas to add them to your flow.
            </div>
        </div>
    );
}
