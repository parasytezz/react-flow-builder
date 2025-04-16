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

const ActionNode = ({ data, id }: any) => (
  <div
    onClick={() => data.onClick?.(id)}
    style={{
      padding: '10px 20px',
      borderRadius: '4px',
      border: '1px solid #888',
      backgroundColor: '#fff',
      fontWeight: 'bold',
      textAlign: 'center',
      minWidth: '110px',
      position: 'relative',
    }}
  >
    {data.label}
    <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
    <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
  </div>
);

const IfElseNode = ({ data, id }: any) => (
  <div
    onClick={() => data.onClick?.(id)}
    style={{
      padding: '10px 20px',
      borderRadius: '4px',
      border: '1px solid #888',
      backgroundColor: '#fff',
      fontWeight: 'bold',
      textAlign: 'center',
      minWidth: '110px',
      position: 'relative',
    }}
  >
    {data.label}
    <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
    <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
  </div>
);

const nodeTypes = {
  actionNode: ActionNode,
  ifElseNode: IfElseNode,
};

function App() {
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [tempNodeName, setTempNodeName] = useState('');
  const [selectedNodeType, setSelectedNodeType] = useState<'actionNode' | 'ifElseNode' | null>(null);

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

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ ...params, type: 'editableEdge' }, eds));
  }, [setEdges]);

  const insertNodeBetween = (type: 'actionNode' | 'ifElseNode') => {
    if (!selectedEdgeId) return;

    const edgeToReplace = edges.find((e) => e.id === selectedEdgeId);
    if (!edgeToReplace) return;

    const { source, target } = edgeToReplace;
    const newId = `node-${nodeId++}`;
    const sourceNode = nodes.find((n) => n.id === source);
    const targetNode = nodes.find((n) => n.id === target);
    const midX = 250;
    const midY = ((sourceNode?.position.y ?? 0) + (targetNode?.position.y ?? 0)) / 2 || 200;

    const newNode: FlowNode = {
      id: newId,
      type,
      position: { x: midX, y: midY },
      data: {
        label: tempNodeName || `${type === 'actionNode' ? 'Action' : 'If/Else'} ${newId}`,
        onClick: (id: string) => setSelectedNodeId(id),
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
    setSelectedNodeType(null);
  };

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

      {(selectedEdgeId || selectedNodeId) && (
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
          {selectedEdgeId && selectedNodeType === null ? (
            <>
              <h3>Choose Node Type</h3>
              <button onClick={() => setSelectedNodeType('actionNode')}>Action Node</button>
              <button onClick={() => setSelectedNodeType('ifElseNode')}>If/Else Node</button>
            </>
          ) : (
            <>
              <h3>{selectedNodeId ? 'Edit Node' : 'Insert Node'}</h3>
              <label>Node Label</label>
              <input
                value={tempNodeName}
                onChange={(e) => setTempNodeName(e.target.value)}
                placeholder="Node name"
              />
              <div style={{ marginTop: 'auto' }}>
                <button
                  onClick={() => {
                    if (selectedNodeId) {
                      setNodes((nds) =>
                        nds.map((node) =>
                          node.id === selectedNodeId ? { ...node, data: { ...node.data, label: tempNodeName } } : node
                        )
                      );
                      setSelectedNodeId(null);
                      setTempNodeName('');
                      return;
                    }
                    if (selectedEdgeId && selectedNodeType) {
                      insertNodeBetween(selectedNodeType);
                    }
                  }}
                >
                  Save
                </button>
                <button onClick={() => { setSelectedEdgeId(null); setSelectedNodeId(null); setSelectedNodeType(null); }}>Cancel</button>
                {selectedNodeId && (
                  <button
                    style={{ background: '#dc3545', color: '#fff' }}
                    onClick={() => {
                      const nodeToDelete = selectedNodeId;
                      const incoming = edges.find((e) => e.target === nodeToDelete);
                      const outgoing = edges.find((e) => e.source === nodeToDelete);

                      setEdges((eds) => {
                        const filtered = eds.filter((e) => e.source !== nodeToDelete && e.target !== nodeToDelete);
                        if (incoming && outgoing) {
                          return filtered.concat({
                            id: `${incoming.source}-${outgoing.target}`,
                            source: incoming.source,
                            target: outgoing.target,
                            type: 'editableEdge',
                            data: { onClick: (id: string) => setSelectedEdgeId(id) },
                          });
                        }
                        return filtered;
                      });
                      setNodes((nds) => nds.filter((n) => n.id !== nodeToDelete));
                      setSelectedNodeId(null);
                      setTempNodeName('');
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
