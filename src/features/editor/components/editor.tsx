"use client"
import { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Edge, Node, NodeChange, EdgeChange, Connection, Background, Controls, MiniMap, Panel } from '@xyflow/react';
import { ErrorView, LoadingView } from "@/components/entity-components"
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows"

import '@xyflow/react/dist/style.css';
import { nodeComponents } from '@/config/node-components';
import { AddNodeButton } from './add-node-button';
import { useSetAtom } from 'jotai';
import { editorAtom } from '../store/atoms';


export const EditorLoading = () => {
    return (
        <LoadingView message="Loading editor"/>
    )
}

export const EditorError = () => {
    return (
        <ErrorView message="Failed to load editor"/>
    )
}

const initialNodes = [
  { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
];

const initialEdges = [{ id: 'n1-n2', source: 'n1', target: 'n2' }];


export const Editor = ({workflowId}:{workflowId:string}) =>{
    const {data:workflow}=useSuspenseWorkflow(workflowId);

    const setEditor= useSetAtom(editorAtom);

  const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
  const [edges, setEdges] = useState<Edge[]>(workflow.edges);

  const onNodesChange = useCallback(
    (changes:NodeChange[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes:EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params:Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );


    return(
       <div className='size-full'>
        <ReactFlow
         nodes={nodes}
         edges={edges}
         onNodesChange={onNodesChange}
         onEdgesChange={onEdgesChange}
         onConnect={onConnect}
         fitView
         onInit={setEditor}
         nodeTypes={nodeComponents}
         snapGrid={[10, 10]}
         snapToGrid
         panOnScroll
         panOnDrag={false}
         selectionOnDrag
        >
            <Background />
            <Controls />
            <MiniMap />
            <Panel>
              <AddNodeButton/>
            </Panel>

        </ReactFlow>

       </div>
    )
}