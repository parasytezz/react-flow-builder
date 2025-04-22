# Exabloom Frontend Workflow Builder

A dynamic React Flow-based workflow editor that allows users to visually build workflows with Action nodes and If/Else branching logic.

## Features

- Drag-and-drop visual workflow builder using React Flow
- Supports:
  - Action Nodes (customizable)
  - If/Else Nodes 
  - Editable labels via a right-hand side panel
  - Inserting new nodes between existing connections via "+" buttons
  - Deletion of nodes and automatic flow cleanup
- Custom editable edges
- Auto-inserts branch/else structure with each If/Else node

## Tech Stack

- React + TypeScript
- @xyflow/react (React Flow)

## System Requirements

- Node.js 18+
- npm or yarn

## Local Setup

```bash
git clone https://github.com/parasytezz/exabloom-frontend.git
cd exabloom-frontend
npm install
npm run dev
```
Then open http://localhost:5173 (or whichever port is shown) in your browser.

## Key Design Decisions

- Node/Edge Management: Leveraged React Flow’s useNodesState and useEdgesState hooks for full node/edge state control.

- If/Else Logic: An If/Else node automatically adds a Branch node and Else node for structure clarity. Labels are stored in the parent If/Else node’s data.branches and data.elseLabel.

- Node Insertion UI: Edge-click "+" buttons make inserting nodes intuitive without cluttering the main canvas.

- Form Panel: Node editing is strictly done through the right-hand form to keep node visuals clean.

## Assumptions Made

- All workflows must begin with a Start node and end with an End node.

- Branch nodes and Else nodes cannot be interacted with directly — they are controlled by the If/Else node.

- Branches and Else paths are represented using preconfigured End nodes to maintain structural flow.

## Known Limitations

- Custom validation (e.g., checking for disconnected nodes) not implemented.

- Multiple branching beyond 2 is not yet supported.

- Flow save/export is not yet integrated.
