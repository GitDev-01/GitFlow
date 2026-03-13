'use client';

import { useState } from 'react';
import { parseYamlToGraph } from '@/lib/yaml-to-graph';
import { useFlowStore } from '@/store/flow-store';
import yaml from 'js-yaml';
import { FlowYamlConfig } from '@/types/flow';

export default function YamlImportDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [yamlText, setYamlText] = useState('');
    const [error, setError] = useState('');
    const { setNodes, setEdges, setActiveFlow } = useFlowStore();

    const handleImport = () => {
        try {
            const { nodes, edges } = parseYamlToGraph(yamlText);
            const config = yaml.load(yamlText) as FlowYamlConfig;

            setNodes(nodes);
            setEdges(edges);
            setActiveFlow(config);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Invalid YAML format');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
                <h2 className="text-xl font-bold mb-4 text-slate-800">Import YAML Flow</h2>
                <textarea
                    className="w-full h-64 p-3 border border-slate-300 rounded font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 bg-slate-50"
                    placeholder="Paste your GitLab Duo Flow v1 YAML here..."
                    value={yamlText}
                    onChange={(e) => setYamlText(e.target.value)}
                />
                {error && <div className="text-red-500 text-sm mt-2 font-medium">{error}</div>}
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        className="px-4 py-2 bg-indigo-600 rounded text-white hover:bg-indigo-700 font-medium shadow-sm transition-colors disabled:opacity-50"
                        disabled={!yamlText.trim()}
                    >
                        Import
                    </button>
                </div>
            </div>
        </div>
    );
}
