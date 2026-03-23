'use client';

import { useEffect, useRef, useState } from 'react';
import { useFlowStore } from '@/store/flow-store';
import { parseGraphToYaml } from '@/lib/graph-to-yaml';
import { Download, Copy, Upload, CheckIcon } from 'lucide-react';
import YamlImportDialog from '../shared/YamlImportDialog';

export default function Toolbar() {
    const { nodes, edges, activeFlowConfig } = useFlowStore();
    const [showExportModal, setShowExportModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [yamlOutput, setYamlOutput] = useState('');

    const [isCopied, setIsCoppied] = useState(false)
    const timeout = useRef<any>(0)

    const handleExport = () => {
        try {
            const yamlConfig = parseGraphToYaml(nodes, edges, activeFlowConfig || {});
            if (yamlConfig !== ""){
                setYamlOutput(yamlConfig);
                setShowExportModal(true);
            }
        } catch (e) {
            console.error("Export failed");
        }
    };

    const copyToClipboard = () => {
        if (timeout.current) clearTimeout(timeout.current)

        navigator.clipboard.writeText(yamlOutput);
        setIsCoppied(true);
        timeout.current = setTimeout(()=>setIsCoppied(false), 3000)
    };

    return (
        <>
            <div className="absolute right-4 bottom-4 z-10 flex gap-2">
                <button
                    onClick={() => setShowImportModal(true)}
                    className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg hover:bg-slate-700 transition-colors font-medium text-sm border border-slate-600"
                >
                    <Upload size={16} />
                    Import YAML
                </button>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors font-semibold text-sm border border-indigo-500"
                >
                    <Download size={16} />
                    Export YAML
                </button>
            </div>

            <YamlImportDialog isOpen={showImportModal} onClose={() => setShowImportModal(false)} />

            {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
                        <h2 className="text-xl font-bold mb-4 text-slate-800">Exported Flow YAML</h2>
                        <div className="relative">
                            <pre className="w-full h-80 p-4 border border-slate-300 rounded font-mono text-xs overflow-auto bg-slate-50 text-slate-700">
                                {yamlOutput}
                            </pre>
                            <span className='text-sm text-slate-700'>Make sure all required fields are filled</span>
                            <button
                                onClick={copyToClipboard}
                                className="absolute top-2 right-2 p-2 bg-white rounded shadow-sm border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                                title="Copy to clipboard"
                            >
                                {!isCopied ? <Copy size={16} /> : <CheckIcon size={16} />}
                            </button>
                        </div>
                        <div className="flex justify-end gap-3 mt-5">
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="px-5 py-2 bg-slate-800 rounded text-white hover:bg-slate-700 font-medium transition-colors shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
