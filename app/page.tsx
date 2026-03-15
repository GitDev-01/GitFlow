'use client';

import { useCallback, useRef } from 'react';
import { useReactFlow, ReactFlowProvider } from '@xyflow/react';
import FlowCanvas from '@/components/canvas/FlowCanvas';
import ComponentPalette from '@/components/sidebar/ComponentPalette';
import PropertiesPanel from '@/components/panels/PropertiesPanel';
import Toolbar from '@/components/toolbar/Toolbar';
import { useFlowStore } from '@/store/flow-store';

function AppContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const { nodes, setNodes } = useFlowStore();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNodeId = (type === "start")? "start": (type === "end")? "end": `node_${Date.now()}`;

      const newNodeName = type.charAt(0).toUpperCase() + type.slice(1)

      const newNode = {
        id: newNodeId,
        type,
        position,
        data: { name: newNodeName },
      };

      setNodes((nds) => nds.concat(newNode as any));
    },
    [screenToFlowPosition, setNodes]
  );

  return (
    <div className="flex w-full h-screen overflow-hidden bg-slate-50">
      <ComponentPalette />

      <div className="flex-1 relative" ref={reactFlowWrapper} onDrop={onDrop} onDragOver={onDragOver}>
        <FlowCanvas />
        <Toolbar />
      </div>

      <PropertiesPanel />
    </div>
  );
}

export default function Home() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}
