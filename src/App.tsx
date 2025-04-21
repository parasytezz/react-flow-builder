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

const IfElseNode = ({ data, id }: { data: { label: string; elseLabel?: string; onClick?: (id: string) => void; branches?: { id: string; label: string }[] }; id: string }) => (
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

  const addIfElseNodeWithBranches = () => {
    const ifElseId = `node-${nodeId++}`;
    const branch1Id = `node-${nodeId++}`;
    const elseId = `node-${nodeId++}`;
    const end1Id = `node-${nodeId++}`;
    const end2Id = `node-${nodeId++}`;

    const y = 100 + nodes.length * 100;

    const ifElseNode: FlowNode = {
      id: ifElseId,
      type: 'ifElseNode',
      position: { x: 250, y },
      data: {
        label: 'If/Else',
        onClick: (id: string) => setSelectedNodeId(id),
        branches: [{ id: branch1Id, label: 'Branch 1' }],
        elseLabel: 'Else'
      },      
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    };

    const branch1Node: FlowNode = {
      id: branch1Id,
      type: 'actionNode',
      position: { x: 100, y: y + 120 },
      data: {
        label: 'Branch 1',
        onClick: undefined,
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    };

    const elseNode: FlowNode = {
      id: elseId,
      type: 'actionNode',
      position: { x: 400, y: y + 120 },
      data: {
        label: 'Else',
        onClick: undefined,
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    };

    const end1Node: FlowNode = {
      id: end1Id,
      type: 'default',
      position: { x: 100, y: y + 240 },
      data: { label: 'End', onClick: undefined },
      targetPosition: Position.Top,
    };

    const end2Node: FlowNode = {
      id: end2Id,
      type: 'default',
      position: { x: 400, y: y + 240 },
      data: { label: 'End', onClick: undefined },
      targetPosition: Position.Top,
    };

    setNodes((nds) => [...nds, ifElseNode, branch1Node, elseNode, end1Node, end2Node]);

    setEdges((eds) => [
      ...eds,
      {
        id: `${ifElseId}-b1`,
        source: ifElseId,
        target: branch1Id,
        type: 'default',
      },
      {
        id: `${ifElseId}-else`,
        source: ifElseId,
        target: elseId,
        type: 'default',
      },
      {
        id: `${branch1Id}-end`,
        source: branch1Id,
        target: end1Id,
        type: 'editableEdge',
        data: { onClick: (id: string) => setSelectedEdgeId(id) },
      },
      {
        id: `${elseId}-end`,
        source: elseId,
        target: end2Id,
        type: 'editableEdge',
        data: { onClick: (id: string) => setSelectedEdgeId(id) },
      },
    ]);
  };

  const insertNodeBetween = (type: 'actionNode' | 'ifElseNode') => {
    if (!selectedEdgeId) return;
  
    const edgeToReplace = edges.find((e) => e.id === selectedEdgeId);
    if (!edgeToReplace) return;
  
    const { source, target } = edgeToReplace;
    const sourceNode = nodes.find((n) => n.id === source);
    const targetNode = nodes.find((n) => n.id === target);
    const midY = ((sourceNode?.position.y ?? 0) + (targetNode?.position.y ?? 0)) / 2 || 200;
  
    if (type === 'actionNode') {
      const newId = `node-${nodeId++}`;
      const newNode: FlowNode = {
        id: newId,
        type,
        position: { x: 250, y: midY },
        data: {
          label: tempNodeName || 'Action',
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
    } else if (type === 'ifElseNode') {
      const ifElseId = `node-${nodeId++}`;
      const branch1Id = `node-${nodeId++}`;
      const elseId = `node-${nodeId++}`;
      const end1Id = `node-${nodeId++}`;
      const end2Id = `node-${nodeId++}`;
  
      const y = midY;
      const ifElseNode: FlowNode = {
        id: ifElseId,
        type: 'ifElseNode',
        position: { x: 250, y },
        data: {
          label: 'If/Else',
          onClick: (id: string) => setSelectedNodeId(id),
          branches: [], // Track branch node ids
        },        
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      };
  
      const branch1Node: FlowNode = {
        id: branch1Id,
        type: 'actionNode',
        position: { x: 100, y: y + 120 },
        data: {
          label: 'Branch 1',
          onClick: undefined,
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      };
  
      const elseNode: FlowNode = {
        id: elseId,
        type: 'actionNode',
        position: { x: 400, y: y + 120 },
        data: {
          label: 'Else',
          onClick: undefined,
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      };
  
      const end1Node: FlowNode = {
        id: end1Id,
        type: 'default',
        position: { x: 100, y: y + 240 },
        data: { label: 'End', onClick: undefined },
        targetPosition: Position.Top,
      };
  
      const end2Node: FlowNode = {
        id: end2Id,
        type: 'default',
        position: { x: 400, y: y + 240 },
        data: { label: 'End', onClick: undefined},
        targetPosition: Position.Top,
      };
  
      const descendantsToRemove = Array.from(getAllConnectedNodes(target));

      setNodes((nds) =>
        nds.filter((n) => !descendantsToRemove.includes(n.id))
          .concat([ifElseNode, branch1Node, elseNode, end1Node, end2Node])
      );
  
      setEdges((eds) =>
        eds
          .filter(
            (e) =>
              !descendantsToRemove.includes(e.source) &&
              !descendantsToRemove.includes(e.target)
          )
          .concat([
            {
              id: `${source}-${ifElseId}`,
              source,
              target: ifElseId,
              type: 'editableEdge',
              data: { onClick: (id: string) => setSelectedEdgeId(id) },
            },
            {
              id: `${ifElseId}-b1`,
              source: ifElseId,
              target: branch1Id,
              type: 'default',
            },
            {
              id: `${ifElseId}-else`,
              source: ifElseId,
              target: elseId,
              type: 'default',
            },
            {
              id: `${branch1Id}-end`,
              source: branch1Id,
              target: end1Id,
              type: 'editableEdge',
              data: { onClick: (id: string) => setSelectedEdgeId(id) },
            },
            {
              id: `${elseId}-end`,
              source: elseId,
              target: end2Id,
              type: 'editableEdge',
              data: { onClick: (id: string) => setSelectedEdgeId(id) },
            },
          ])
      );      
    }
  
    setSelectedEdgeId(null);
    setTempNodeName('');
    setSelectedNodeType(null);
  };
  
  const getAllConnectedNodes = (startId: string, visited = new Set<string>()): Set<string> => {
    if (visited.has(startId)) return visited;
    visited.add(startId);
    edges.forEach((e) => {
      if (e.source === startId) {
        getAllConnectedNodes(e.target, visited);
      }
    });
    return visited;
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
              <button onClick={() => insertNodeBetween('ifElseNode')}>If/Else Node</button>
            </>
          ) : (
            <>
              <h3>{selectedNodeId ? 'Edit Node' : 'Insert Node'}</h3>
              <label>Node Label</label>

              {selectedNodeId && nodes.find(n => n.id === selectedNodeId)?.type === 'ifElseNode' ? (
                <>
                  <input
                    value={tempNodeName}
                    onChange={(e) => setTempNodeName(e.target.value)}
                    placeholder="If/Else label"
                  />
                  <label>Else Label</label>
                  <input
                    value={(nodes.find(n => n.id === selectedNodeId)?.data.elseLabel as string) || ''}
                    onChange={(e) => {
                      const elseLabel = e.target.value;

                      setNodes((nds) =>
                        nds.map((n) => {
                          if (n.id === selectedNodeId) {
                            return { ...n, data: { ...n.data, elseLabel } };
                          }

                          // Also update the ELSE child node label (match on default label "Else")
                          if (
                            nodes.find(n => n.id === selectedNodeId)?.data.elseLabel !== undefined &&
                            n.data.label === nodes.find(n => n.id === selectedNodeId)?.data.elseLabel
                          ) {
                            return { ...n, data: { ...n.data, label: elseLabel } };
                          }

                          return n;
                        })
                      );
                    }}
                  />
                  <label>Branches</label>
                  {Array.isArray(nodes.find(n => n.id === selectedNodeId)?.data.branches) &&
                    (nodes.find(n => n.id === selectedNodeId)?.data as { branches: { id: string; label: string }[] }).branches.map((branch: { id: string; label: string }, index: number) => (
                    <input
                      key={branch.id}
                      value={branch.label}
                      onChange={(e) => {
                        const updatedLabel = e.target.value;
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNodeId
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    branches: (n.data as { branches: { id: string; label: string }[] }).branches.map((b: any, i: number) =>
                                      i === index ? { ...b, label: updatedLabel } : b
                                    ),
                                  },
                                }
                              : n
                          )
                        );
                      }}
                    />
                  ))}
                </>
              ) : (
                <input
                  value={tempNodeName}
                  onChange={(e) => setTempNodeName(e.target.value)}
                  placeholder="Node name"
                />
              )}
              <div style={{ marginTop: 'auto' }}>
                <button
                  onClick={() => {
                    if (selectedNodeId) {
                      setNodes((nds) =>
                        nds.map((node) => {
                          if (node.id !== selectedNodeId) return node;
                          if (node.type === 'ifElseNode') {
                            return {
                              ...node,
                              data: {
                                ...node.data,
                                label: tempNodeName || node.data.label,
                                // elseLabel and branches already handled in onChange
                              },
                            };
                          }
                          return {
                            ...node,
                            data: {
                              ...node.data,
                              label: tempNodeName || node.data.label,
                            },
                          };
                        })
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
                <button
                  onClick={() => {
                    setSelectedEdgeId(null);
                    setSelectedNodeId(null);
                    setSelectedNodeType(null);
                  }}
                >
                  Cancel
                </button>
                {selectedNodeId && (
                  <button
                    style={{ background: '#dc3545', color: '#fff' }}
                    onClick={() => {
                      const nodeToDelete = selectedNodeId;
                      const toDelete = Array.from(getAllConnectedNodes(nodeToDelete));
                      const incomingEdge = edges.find((e) => e.target === nodeToDelete);
                      const sourceNode = nodes.find((n) => n.id === incomingEdge?.source);

                      const newEndId = `node-${nodeId++}`;
                      const newEndNode: FlowNode = {
                        id: newEndId,
                        type: 'default',
                        position: {
                          x: sourceNode?.position.x ?? 250,
                          y: (sourceNode?.position.y ?? 300) + 150,
                        },
                        data: { label: 'End', onClick: undefined },
                        targetPosition: Position.Top,
                      };

                      setNodes((nds) =>
                        nds.filter((n) => !toDelete.includes(n.id)).concat(newEndNode)
                      );

                      setEdges((eds) =>
                        eds
                          .filter(
                            (e) =>
                              !toDelete.includes(e.source) &&
                              !toDelete.includes(e.target)
                          )
                          .concat(
                            incomingEdge
                              ? {
                                  id: `${incomingEdge.source}-${newEndId}`,
                                  source: incomingEdge.source,
                                  target: newEndId,
                                  type: 'editableEdge',
                                  data: {
                                    onClick: (id: string) => setSelectedEdgeId(id),
                                  },
                                }
                              : []
                          )
                      );

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