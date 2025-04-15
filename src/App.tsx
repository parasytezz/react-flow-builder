// Level 3 - Full Workflow Builder with Action Nodes and If/Else Nodes using React Flow

import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Node as FlowNode,
  Edge,
  Position,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

let nodeId = 3;

const ActionNode = ({ data }: any) => {
  return (
    <div style={{ padding: 10, border: '1px solid #888', borderRadius: 4 }}>
      <input
        style={{ fontSize: 14 }}
        value={data.label}
        onChange={(e) => data.onChange?.(e.target.value)}
      />
      <button onClick={data.onDelete} style={{ marginLeft: 8 }}>x</button>
    </div>
  );
};

const IfElseNode = ({ data }: any) => {
  return (
    <div style={{ padding: 10, border: '2px dashed #007acc', borderRadius: 4 }}>
      <strong>If/Else:</strong>
      <input
        style={{ fontSize: 14, marginLeft: 6 }}
        value={data.label}
        onChange={(e) => data.onChange?.(e.target.value)}
      />
      <button onClick={data.onAddBranch} style={{ marginLeft: 8 }}>+Branch</button>
      <button onClick={data.onDelete} style={{ marginLeft: 4 }}>x</button>
    </div>
  );
};

const nodeTypes = {
  actionNode: ActionNode,
  ifElseNode: IfElseNode,
};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([
    {
      id: 'start',
      type: 'default',
      position: { x: 250, y: 50 },
      data: { label: 'Start Node' },
      sourcePosition: Position.Bottom,
    },
    {
      id: 'end',
      type: 'default',
      position: { x: 250, y: 500 },
      data: { label: 'End Node' },
      targetPosition: Position.Top,
    },
  ]);

  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([
    {
      id: 'start-end',
      source: 'start',
      target: 'end',
      label: '+',
    },
  ]);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const addNode = (type: 'actionNode' | 'ifElseNode') => {
    const newId = `node-${nodeId++}`;
    const y = 100 + nodes.length * 80;

    const newNode: FlowNode = {
      id: newId,
      type,
      position: { x: 250, y },
      data: {
        label: type === 'actionNode' ? `Action Node` : `If Node`,
        onDelete: () => {
          setNodes((nds) => nds.filter((n) => n.id !== newId));
          setEdges((eds) => eds.filter((e) => e.source !== newId && e.target !== newId));
        },
        onChange: (label: string) => {
          setNodes((nds) =>
            nds.map((n) => (n.id === newId ? { ...n, data: { ...n.data, label } } : n))
          );
        },
        onAddBranch: type === 'ifElseNode' ? () => {
          const branchId = `branch-${nodeId++}`;
          setNodes((nds) => [
            ...nds,
            {
              id: branchId,
              type: 'default',
              position: { x: 100, y: y + 80 },
              data: { label: `Branch ${branchId}` },
            },
          ]);
        } : undefined,
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, { id: `e-${newId}-end`, source: newId, target: 'end', type: 'smoothstep' }]);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ padding: 10 }}>
        <button onClick={() => addNode('actionNode')}>Add Action Node</button>
        <button onClick={() => addNode('ifElseNode')} style={{ marginLeft: 8 }}>Add If/Else Node</button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default App;
