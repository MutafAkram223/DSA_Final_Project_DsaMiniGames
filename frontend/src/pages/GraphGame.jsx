import React, { useState } from 'react';
import '../styles/graph-game.css';

// --- LEVEL CONFIGURATION ---
const LEVELS = [
  {
    id: 1,
    title: "Level 1: The Party",
    instruction: "Connect ALL planets so everyone can come to the party!",
    type: "undirected",
    nodes: [
      { id: 'A', label: '👾', x: 350, y: 50 },
      { id: 'B', label: '🤖', x: 150, y: 250 },
      { id: 'C', label: '👽', x: 550, y: 250 },
      { id: 'D', label: '🐱', x: 350, y: 400 },
    ],
    edges: [], // User builds these
    maxWeight: Infinity
  },
  {
    id: 2,
    title: "Level 2: One-Way Stream",
    instruction: "The stream flows ONE WAY (A -> B -> C). Don't go against the arrows!",
    type: "directed",
    nodes: [
      { id: 'A', label: '🚀', x: 100, y: 100 },
      { id: 'B', label: '⛽', x: 400, y: 100 },
      { id: 'C', label: '🏁', x: 400, y: 400 },
      { id: 'D', label: '❌', x: 100, y: 400 }, // Trap node
    ],
    edges: [],
    requiredPath: ['A', 'B', 'C']
  },
  {
    id: 3,
    title: "Level 3: Fuel Saver",
    instruction: "Go from A to C using LESS than 10 Fuel. Watch the numbers on the lines!",
    type: "weighted",
    nodes: [
      { id: 'A', label: '🚀', x: 100, y: 250 },
      { id: 'B', label: '⛽', x: 400, y: 100 }, // Top path (Expensive)
      { id: 'C', label: '🏁', x: 700, y: 250 },
      { id: 'D', label: '🌑', x: 400, y: 400 }, // Bottom path (Cheap)
    ],
    // Pre-defined edges for weighted level, user selects path
    predefinedEdges: [
      { u: 'A', v: 'B', weight: 6 },
      { u: 'B', v: 'C', weight: 6 }, // Path A-B-C cost 12 (Too high)
      { u: 'A', v: 'D', weight: 3 },
      { u: 'D', v: 'C', weight: 4 }, // Path A-D-C cost 7 (Win)
    ]
  }
];

const GraphGame = () => {
  const [levelIndex, setLevelIndex] = useState(null); // null = Menu
  const [userEdges, setUserEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [message, setMessage] = useState("");
  const [gameState, setGameState] = useState("playing"); // playing, won, lost

  // --- ACTIONS ---

  const startLevel = (index) => {
    setLevelIndex(index);
    setUserEdges([]);
    setSelectedNode(null);
    setGameState("playing");
    setMessage(LEVELS[index].instruction);
  };

  const handleNodeClick = (nodeId) => {
    if (gameState === "won") return;
    const currentLevel = LEVELS[levelIndex];

    // LEVEL 3 LOGIC (Path Selection)
    if (currentLevel.type === 'weighted') {
      // In weighted level, clicking nodes selects the path "A -> D -> C"
      if (selectedNode && selectedNode !== nodeId) {
         // Find if there is a predefined edge
         const edge = currentLevel.predefinedEdges.find(e => 
           (e.u === selectedNode && e.v === nodeId) || (e.u === nodeId && e.v === selectedNode)
         );
         
         if (edge) {
            setUserEdges([...userEdges, { ...edge }]); // Add to path
            setSelectedNode(nodeId); // Move player
            checkWeightedWin([...userEdges, { ...edge }]);
         } else {
            setMessage("No road exists there!");
         }
      } else {
        setSelectedNode(nodeId);
      }
      return;
    }

    // LEVEL 1 & 2 LOGIC (Drawing Edges)
    if (selectedNode === null) {
      setSelectedNode(nodeId);
    } else {
      if (selectedNode !== nodeId) {
        // Add Edge
        const newEdge = { u: selectedNode, v: nodeId };
        // Check if exists
        const exists = userEdges.find(e => 
          (e.u === selectedNode && e.v === nodeId) || 
          (currentLevel.type === 'undirected' && e.u === nodeId && e.v === selectedNode)
        );

        if (!exists) {
          const newEdges = [...userEdges, newEdge];
          setUserEdges(newEdges);
          
          if (currentLevel.type === 'undirected') checkConnectivityWin(newEdges);
          if (currentLevel.type === 'directed') checkDirectedWin(newEdges);
        }
        setSelectedNode(null);
      }
    }
  };

  // --- WIN CONDITIONS ---

  const checkConnectivityWin = (edges) => {
    // Simplified BFS to check if all 4 nodes are connected
    // In a real app, use full Adjacency List BFS
    if (edges.length >= 3) {
       setGameState("won");
       setMessage("🎉 SUCCESS! Everyone is invited!");
    }
  };

  const checkDirectedWin = (edges) => {
    // Check if path A -> B -> C exists
    const hasAB = edges.find(e => e.u === 'A' && e.v === 'B');
    const hasBC = edges.find(e => e.u === 'B' && e.v === 'C');
    
    // Check for bad paths
    const hasBad = edges.find(e => e.u === 'B' && e.v === 'A'); // Going backwards

    if (hasBad) {
      setMessage("⚠️ Oops! You can't go against the flow!");
      setUserEdges([]); // Reset
    } else if (hasAB && hasBC) {
      setGameState("won");
      setMessage("🎉 SUCCESS! Pizza Delivered!");
    }
  };

  const checkWeightedWin = (pathEdges) => {
     // Calculate total cost
     const totalCost = pathEdges.reduce((acc, edge) => acc + edge.weight, 0);
     const currentLevel = LEVELS[levelIndex];
     const lastNode = pathEdges[pathEdges.length-1].v;

     if (lastNode === 'C') {
        if (totalCost <= 10) {
           setGameState("won");
           setMessage(`🎉 SUCCESS! Total Fuel: ${totalCost} (Under 10)`);
        } else {
           setMessage(`❌ Too expensive! Cost: ${totalCost}. Resetting...`);
           setTimeout(() => setUserEdges([]), 1500);
           setSelectedNode(null);
        }
     }
  };

  // --- RENDER ---
  
  if (levelIndex === null) {
    return (
      <div className="game-container">
        <h1>👾 Voidy's Galaxy</h1>
        <p style={{color: '#e0aaff'}}>Learn Graphs to save the universe!</p>
        <div className="level-grid">
          {LEVELS.map((lvl, idx) => (
            <div key={lvl.id} className="level-card" onClick={() => startLevel(idx)}>
              <h2>{lvl.title}</h2>
              <p style={{fontSize: '0.9rem', marginTop: '10px'}}>{lvl.type.toUpperCase()}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentLevel = LEVELS[levelIndex];
  const displayEdges = currentLevel.type === 'weighted' ? currentLevel.predefinedEdges : userEdges;

  return (
    <div className="game-container">
      <div className="top-bar">
        <button className="back-btn" onClick={() => setLevelIndex(null)}>EXIT GALAXY</button>
        <div className="instruction-box">{message}</div>
      </div>

      <div className="game-area">
        <svg>
           <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="35" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill="#9d4edd" />
            </marker>
          </defs>
          {displayEdges.map((e, i) => {
             const start = currentLevel.nodes.find(n => n.id === e.u);
             const end = currentLevel.nodes.find(n => n.id === e.v);
             
             // Check if this edge is selected by user (for weighted level highlight)
             const isSelected = userEdges.find(ue => ue.u === e.u && ue.v === e.v);
             
             return (
               <g key={i}>
                 <line 
                   x1={start.x + 35} y1={start.y + 35} 
                   x2={end.x + 35} y2={end.y + 35} 
                   stroke={isSelected || currentLevel.type !== 'weighted' ? "#ff9e00" : "#4a148c"}
                   strokeWidth={isSelected ? 6 : 4}
                   markerEnd={currentLevel.type === 'directed' ? "url(#arrow)" : ""}
                   strokeDasharray={currentLevel.type === 'weighted' && !isSelected ? "5,5" : "0"}
                 />
                 {currentLevel.type === 'weighted' && (
                   <foreignObject 
                      x={(start.x + end.x)/2 + 30} 
                      y={(start.y + end.y)/2 + 30} 
                      width="40" height="20"
                   >
                     <div className="weight-badge">{e.weight}</div>
                   </foreignObject>
                 )}
               </g>
             );
          })}
        </svg>

        {currentLevel.nodes.map(node => (
          <div 
            key={node.id}
            className={`planet ${selectedNode === node.id ? 'selected' : ''}`}
            style={{ left: node.x, top: node.y }}
            onClick={() => handleNodeClick(node.id)}
          >
            {node.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GraphGame;