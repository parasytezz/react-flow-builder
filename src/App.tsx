import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Node as FlowNode,
  Edge,
  Position,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomEdge from './CustomEdge';

const edgeTypes = {
  editableEdge: CustomEdge,
};

let nodeId = 3;

const ActionNode = ({ data }: any) => {
  return (
    <div
      style={{
        padding: '10px 20px',
        borderRadius: '4px',
        border: '1px solid #888',
        backgroundColor: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        minWidth: '120px',
        position: 'relative',
      }}
    >
      {data.label}
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};

const IfElseNode = ({ data }: any) => {
  return (
    <div
      style={{
        padding: '10px 20px',
        borderRadius: '4px',
        border: '1px solid #888',
        backgroundColor: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        minWidth: '120px',
        position: 'relative',
      }}
    >
      {data.label}
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};

const nodeTypes = {
  actionNode: ActionNode,
  ifElseNode: IfElseNode,
};

function App() {
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [tempNodeName, setTempNodeName] = useState('');

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
      type: 'editableEdge',
      data: {
        onClick: (id: string) => setSelectedEdgeId(id),
      },
    },
  ]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>

      {selectedEdgeId && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            height: '100%',
            width: '25vw',
            background: '#f9f9f9',
            borderLeft: '1px solid #ccc',
            padding: '24px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Insert Action Node</h3>
          <label style={{ fontWeight: 'bold' }}>Action Name:</label>
          <input
            value={tempNodeName}
            onChange={(e) => setTempNodeName(e.target.value)}
            placeholder="input"
            style={{
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #aaa',
              borderRadius: '4px',
            }}
          />
          <div style={{ marginTop: 'auto' }}>
            <button
              onClick={() => {
                if (!selectedEdgeId) return;
                const edgeToReplace = edges.find((e) => e.id === selectedEdgeId);
                if (!edgeToReplace) return;

                const { source, target } = edgeToReplace;
                const newId = `node-${nodeId++}`;
                const sourceNode = nodes.find((n) => n.id === source);
                const targetNode = nodes.find((n) => n.id === target);
                const midX = 250;
                const midY =
                  ((sourceNode?.position.y ?? 0) + (targetNode?.position.y ?? 0)) / 2 || 200;

                const newNode: FlowNode = {
                  id: newId,
                  type: 'actionNode',
                  position: { x: midX, y: midY },
                  data: {
                    label: tempNodeName || `Action ${newId}`,
                  },
                  sourcePosition: Position.Bottom,
                  targetPosition: Position.Top,
                };

                setNodes((nds) => [...nds, newNode]);
                setEdges((eds) =>
                  eds
                    .filter((e) => e.id !== selectedEdgeId)
                    .concat([
                      {
                        id: `${source}-${newId}`,
                        source,
                        target: newId,
                        type: 'editableEdge',
                        data: { onClick: (id: string) => setSelectedEdgeId(id) },
                      },
                      {
                        id: `${newId}-${target}`,
                        source: newId,
                        target,
                        type: 'editableEdge',
                        data: { onClick: (id: string) => setSelectedEdgeId(id) },
                      },
                    ])
                );
                setSelectedEdgeId(null);
                setTempNodeName('');
              }}
              style={{
                background: '#007bff',
                color: '#fff',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px',
              }}
            >
              Save
            </button>
            <button
              onClick={() => setSelectedEdgeId(null)}
              style={{
                padding: '10px 16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
