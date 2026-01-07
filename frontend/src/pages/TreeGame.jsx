import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Camera, Play, ArrowLeft, Info } from "lucide-react";

/* --- 1. RESCALED DATA (COMPACT FIT) --- */
const TREE_DATA = {
  // Y-axis compressed to fit between HUD and Controls
  A: { id: "A", left: "B", right: "C", x: 400, y: 110 },
  B: { id: "B", left: "D", right: "E", x: 260, y: 230 },
  C: { id: "C", left: "F", right: "G", x: 540, y: 230 },
  D: { id: "D", left: null, right: null, x: 190, y: 350 },
  E: { id: "E", left: null, right: null, x: 330, y: 350 },
  F: { id: "F", left: null, right: null, x: 470, y: 350 },
  G: { id: "G", left: null, right: null, x: 610, y: 350 },
};

const LEVELS = {
  PRE: {
    title: "PRE-ORDER",
    rule: "Root → Left → Right",
    desc: "Capture the node immediately upon ARRIVAL (Light 1).",
    color: "#ff6b81", // Coral
    activeLight: 1
  },
  IN: {
    title: "IN-ORDER",
    rule: "Left → Root → Right",
    desc: "Capture after returning from LEFT child (Light 2).",
    color: "#1e90ff", // Blue
    activeLight: 2
  },
  POST: {
    title: "POST-ORDER",
    rule: "Left → Right → Root",
    desc: "Capture after returning from RIGHT child (Light 3).",
    color: "#2ed573", // Green
    activeLight: 3
  },
};

export default function TreeGame() {
  const [screen, setScreen] = useState("MENU"); 
  const [levelId, setLevelId] = useState("PRE");
  const [gameState, setGameState] = useState("PLAYING");
  
  // Logic State
  const [currNode, setCurrNode] = useState("A");
  const [visitCount, setVisitCount] = useState(1);
  const [pathStack, setPathStack] = useState([]);
  const [logs, setLogs] = useState([]);
  const [history, setHistory] = useState([]); // This is our Undo Stack
  const [feedback, setFeedback] = useState(null);

  // --- ACTIONS ---
  const selectLevel = (lvl) => { setLevelId(lvl); setScreen("BRIEFING"); };
  const startGame = () => { setScreen("GAME"); resetLogic(); };
  
  const resetLogic = () => {
    setCurrNode("A");
    setVisitCount(1);
    setPathStack([]);
    setLogs([]);
    setHistory([]);
    setGameState("PLAYING");
    setFeedback(null);
  };

  const handleNext = () => {
    if (gameState !== "PLAYING") return;
    
    // PUSH TO STACK: Save current state before moving
    setHistory([...history, { currNode, visitCount, pathStack: [...pathStack], logs: [...logs] }]);

    // Calculate Step
    const node = TREE_DATA[currNode];
    let nextNode = currNode;
    let nextVisit = visitCount;
    let nextStack = [...pathStack];

    if (visitCount === 1) {
      // Arrive -> Go Left
      if (node.left) {
        nextStack.push(currNode);
        nextNode = node.left;
        nextVisit = 1;
      } else {
        nextVisit = 2; // Instant return if no left
      }
    } else if (visitCount === 2) {
      // From Left -> Go Right
      if (node.right) {
        nextStack.push(currNode);
        nextNode = node.right;
        nextVisit = 1;
      } else {
        nextVisit = 3; // Instant return if no right
      }
    } else if (visitCount === 3) {
      // From Right -> Go Up
      if (nextStack.length > 0) {
        const parentId = nextStack.pop();
        nextNode = parentId;
        const parent = TREE_DATA[parentId];
        nextVisit = parent.left === currNode ? 2 : 3;
      } else {
        finishGame();
        return;
      }
    }

    setCurrNode(nextNode);
    setVisitCount(nextVisit);
    setPathStack(nextStack);
  };

  const handleCapture = () => {
    if (logs.includes(currNode)) {
      triggerFeedback("Already Captured!", "warn");
      return;
    }
    setLogs([...logs, currNode]);
    triggerFeedback("Captured!", "good");
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    
    // POP FROM STACK: Get the last saved state
    const prev = history[history.length - 1];
    
    // Restore variables
    setCurrNode(prev.currNode);
    setVisitCount(prev.visitCount);
    setPathStack(prev.pathStack);
    setLogs(prev.logs);
    
    // Remove the popped state from history
    setHistory(history.slice(0, -1));
  };

  const finishGame = () => {
    const answers = {
      PRE: ["A", "B", "D", "E", "C", "F", "G"],
      IN: ["D", "B", "E", "A", "F", "C", "G"],
      POST: ["D", "E", "B", "F", "G", "C", "A"]
    };
    
    const isWin = JSON.stringify(logs) === JSON.stringify(answers[levelId]);
    setGameState(isWin ? "WON" : "LOST");
    setScreen("RESULT");
  };

  const triggerFeedback = (msg, type) => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 1000);
  };

  // --- RENDER HELPERS ---
  const getLightClass = (nodeId, lightIndex) => {
    if (currNode !== nodeId) return "led-light"; // Dim
    if (visitCount === lightIndex) return "led-light active"; // Bright
    return "led-light visited"; // Dim but visited
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Quicksand:wght@500;700&display=swap');

        :root {
          --font-head: 'Fredoka One', cursive;
          --font-body: 'Quicksand', sans-serif;
          --primary: #ff6b81;    
          --secondary: #1e90ff;  
          --accent: #2ed573;     
          --warn: #ffa502;       
          --dark: #2f3542;       
          --bg-menu: radial-gradient(circle, #70a1ff 0%, #5352ed 100%);
          --bg-sky: linear-gradient(180deg, #89f7fe 0%, #66a6ff 100%);
        }

        body { margin: 0; font-family: var(--font-body); overflow: hidden; user-select: none; }
        
        .game-container { height: 100vh; width: 100vw; display: flex; flex-direction: column; position: relative; }
        .menu-bg { background: var(--bg-menu); display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .sky-bg { background: var(--bg-sky); }
        .glass { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border: 2px solid rgba(255, 255, 255, 0.6); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); }
        
        /* Typography */
        .game-logo { font-family: var(--font-head); font-size: 5rem; color: #fff; text-shadow: 4px 4px 0px rgba(0,0,0,0.2); margin: 0; letter-spacing: 2px; }
        .game-subtitle { color: rgba(255,255,255,0.9); font-size: 1.5rem; margin-bottom: 50px; font-weight: 700; }
        
        /* Cards */
        .level-container { display: flex; gap: 30px; }
        .level-card { background: #fff; border-radius: 25px; padding: 30px; width: 240px; text-align: center; cursor: pointer; box-shadow: 0 10px 25px rgba(0,0,0,0.15); position: relative; border: 4px solid transparent; transition: 0.2s; }
        .level-card:hover { border-color: var(--primary); transform: translateY(-5px); }
        .card-badge { position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: var(--primary); color: #fff; padding: 5px 20px; border-radius: 20px; font-weight: 700; font-size: 0.9rem; }
        .level-card h2 { color: var(--dark); font-family: var(--font-head); margin: 15px 0; font-size: 1.8rem; }
        .card-rule { background: #f1f2f6; padding: 10px; border-radius: 10px; color: var(--secondary); font-weight: 700; font-size: 0.9rem; }

        /* HUD */
        .hud-bar { position: absolute; top: 20px; left: 50%; transform: translateX(-50%); width: 90%; max-width: 800px; border-radius: 20px; padding: 12px 40px; display: flex; justify-content: space-between; align-items: center; z-index: 50; }
        .hud-item { text-align: center; }
        .hud-label { font-size: 0.7rem; color: #747d8c; font-weight: 700; letter-spacing: 1px; display: block; margin-bottom: 2px; }
        .hud-val { font-family: var(--font-head); font-size: 1.4rem; color: var(--secondary); }

        /* SVG World */
        .world-view { flex: 1; width: 100%; height: 100%; position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; }
        .game-svg { width: 100%; height: 100%; max-height: 600px; display: block; overflow: visible; }
        
        .connector { stroke: #fff; stroke-width: 6; stroke-linecap: round; opacity: 0.8; }
        .node-base { fill: #fff; stroke: var(--dark); stroke-width: 4; transition: fill 0.3s; }
        .node-base.captured { fill: var(--accent); stroke: #fff; }
        .node-text { fill: var(--dark); font-family: var(--font-head); font-size: 32px; text-anchor: middle; pointer-events: none; }
        
        /* IMPROVED LIGHTS */
        .led-light { fill: #dfe4ea; stroke: #a4b0be; stroke-width: 1; transition: 0.3s; }
        .led-light.active { fill: #ffa502; stroke: #fff; filter: drop-shadow(0 0 8px #ffa502); }
        .led-light.visited { fill: #ced6e0; stroke: #a4b0be; }
        
        /* ANIMATIONS */
        @keyframes pulse-ring { 0% { r: 38; opacity: 0.6; } 100% { r: 55; opacity: 0; } }
        .active-ring { fill: none; stroke: #ffa502; stroke-width: 3; animation: pulse-ring 1.5s infinite; }

        /* Controls */
        .control-panel { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); width: 90%; max-width: 800px; border-radius: 25px; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; z-index: 50; }
        .log-display { display: flex; gap: 5px; }
        .log-node { background: var(--dark); color: #fff; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-family: monospace; font-size: 0.9rem; }
        
        .game-btn { border: none; padding: 12px 24px; border-radius: 12px; font-family: var(--font-head); font-size: 1.1rem; cursor: pointer; transition: 0.1s; box-shadow: 0 4px 0 rgba(0,0,0,0.1); color: #fff; display: flex; items-center; gap: 8px; }
        .game-btn:active { transform: translateY(2px); box-shadow: none; }
        .game-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .game-btn.undo { background: #a4b0be; }
        .game-btn.capture { background: var(--warn); padding: 12px 36px; font-size: 1.2rem; }
        .game-btn.next { background: var(--secondary); }

        /* Briefing/Result Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .modal-card { background: #fff; padding: 40px; border-radius: 30px; text-align: center; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .modal-title { font-family: var(--font-head); font-size: 2.5rem; margin: 0 0 10px 0; color: var(--secondary); }
        .primary-btn { margin-top: 20px; padding: 15px 50px; background: var(--primary); color: #fff; border: none; border-radius: 50px; font-family: var(--font-head); font-size: 1.4rem; cursor: pointer; box-shadow: 0 5px 0 #d63031; transition: transform 0.1s; }
        .primary-btn:active { transform: translateY(4px); box-shadow: 0 2px 0 #d63031; }
        
        /* Feedback */
        .feedback-bubble { position: absolute; top: 100px; left: 50%; transform: translateX(-50%); padding: 10px 30px; border-radius: 50px; font-weight: 700; color: #fff; font-family: var(--font-head); font-size: 1.1rem; z-index: 60; }
        .feedback-bubble.good { background: var(--accent); }
        .feedback-bubble.warn { background: var(--warn); }
      `}</style>

      {/* --- MENU SCREEN --- */}
      {screen === "MENU" && (
        <div className="game-container menu-bg">
          <h1 className="game-logo">TREE HOPPER</h1>
          <div className="game-subtitle">Visual Traversal Adventure</div>
          <div className="level-container">
            {Object.keys(LEVELS).map(lvl => (
              <motion.div key={lvl} className="level-card" onClick={() => selectLevel(lvl)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <div className="card-badge">{lvl}</div>
                <h2>{LEVELS[lvl].title}</h2>
                <div className="card-rule">{LEVELS[lvl].rule}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* --- BRIEFING MODAL --- */}
      {screen === "BRIEFING" && (
        <div className="modal-overlay">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-card">
            <h2 className="modal-title">{LEVELS[levelId].title}</h2>
            <p style={{fontSize: '1.2rem', fontWeight: 'bold', color: '#2f3542'}}>{LEVELS[levelId].rule}</p>
            <div style={{background: '#fff7d6', padding: '15px', borderRadius: '12px', color: '#e67e22', fontWeight: '700', border: '2px dashed #f1c40f', margin: '20px 0'}}>
              💡 {LEVELS[levelId].desc}
            </div>
            <button className="primary-btn" onClick={startGame}>START LEVEL</button>
          </motion.div>
        </div>
      )}

      {/* --- GAME SCREEN --- */}
      {screen === "GAME" && (
        <div className="game-container sky-bg">
          
          {/* HUD Bar */}
          <div className="hud-bar glass">
            <div className="hud-item">
              <span className="hud-label">TARGET MODE</span>
              <span className="hud-val" style={{color: LEVELS[levelId].color}}>{levelId}</span>
            </div>
            
            <div className="hud-item">
               <span className="hud-label">CURRENT LIGHT</span>
               {/* Light Indicators */}
               <div style={{display: 'flex', gap: '8px', marginTop: '5px'}}>
                 {[1, 2, 3].map(i => (
                   <div key={i} style={{
                     width: '12px', height: '12px', borderRadius: '50%',
                     background: visitCount === i ? '#ffa502' : '#dfe4ea',
                     boxShadow: visitCount === i ? '0 0 10px #ffa502' : 'none',
                     border: '1px solid #ced6e0'
                   }}/>
                 ))}
               </div>
            </div>

            <div className="hud-item">
              <span className="hud-label">CURRENT NODE</span>
              <span className="hud-val">{currNode}</span>
            </div>
          </div>

          {/* Feedback Toast */}
          <AnimatePresence>
            {feedback && (
              <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className={`feedback-bubble ${feedback.type}`}>
                {feedback.msg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* World View */}
          <div className="world-view">
             <svg viewBox="0 0 800 500" className="game-svg">
               {/* Connectors */}
               {Object.values(TREE_DATA).map(node => (
                 <React.Fragment key={node.id}>
                    {node.left && <line className="connector" x1={node.x} y1={node.y} x2={TREE_DATA[node.left].x} y2={TREE_DATA[node.left].y} />}
                    {node.right && <line className="connector" x1={node.x} y1={node.y} x2={TREE_DATA[node.right].x} y2={TREE_DATA[node.right].y} />}
                 </React.Fragment>
               ))}

               {/* Nodes */}
               {Object.values(TREE_DATA).map(node => {
                  const isCaptured = logs.includes(node.id);
                  const isCurrent = currNode === node.id;
                  
                  return (
                    <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                       
                       {/* Pulsing Active Ring */}
                       {isCurrent && <circle cx="0" cy="0" r="38" className="active-ring" />}

                       {/* Main Node Body */}
                       <circle r="32" className={`node-base ${isCaptured ? 'captured' : ''}`} />
                       <text y="10" className="node-text" style={{ fill: isCaptured ? '#fff' : '#2f3542' }}>{node.id}</text>

                       {/* --- LED LIGHTS --- */}
                       {/* 1. Top Left (Arrive) */}
                       <circle cx="-25" cy="-25" r="6" className={getLightClass(node.id, 1)} />
                       
                       {/* 2. Bottom Center (Left Return) */}
                       <circle cx="0" cy="42" r="6" className={getLightClass(node.id, 2)} />
                       
                       {/* 3. Top Right (Right Return) */}
                       <circle cx="25" cy="-25" r="6" className={getLightClass(node.id, 3)} />

                       {/* Green Dot / Checkmark removed to clean up UI */}
                    </g>
                  );
               })}
             </svg>
          </div>

          {/* Control Panel */}
          <div className="control-panel glass">
            <div className="hud-item" style={{textAlign:'left'}}>
              <div className="hud-label">CAPTURED LOG</div>
              <div className="log-display">
                {logs.length === 0 ? <span style={{opacity:0.5, fontWeight:'bold'}}>- - -</span> : logs.map((l, i) => (
                  <motion.div key={i} initial={{scale:0}} animate={{scale:1}} className="log-node">{l}</motion.div>
                ))}
              </div>
            </div>

            <div style={{display:'flex', gap:'10px'}}>
              <button className="game-btn undo" onClick={handleUndo} disabled={history.length === 0}>
                <RotateCcw size={18} />
              </button>
              
              <button className="game-btn capture" onClick={handleCapture}>
                <Camera size={22} /> SNAP
              </button>
              
              <button className="game-btn next" onClick={handleNext}>
                NEXT <Play size={18} fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- RESULT SCREEN --- */}
      {screen === "RESULT" && (
        <div className="modal-overlay">
           <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="modal-card">
              <h1 style={{ color: gameState === "WON" ? '#2ed573' : '#ff6b81', margin: 0, fontFamily: 'var(--font-head)', fontSize: '3rem' }}>
                {gameState === "WON" ? "VICTORY!" : "FAILED"}
              </h1>
              <p style={{color: '#747d8c', fontSize: '1.2rem', margin: '10px 0 30px'}}>
                {gameState === "WON" ? "Perfect Sequence." : "Incorrect Sequence."}
              </p>
              
              <div style={{background: '#f1f2f6', padding: '15px', borderRadius: '10px', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.2rem'}}>
                 {logs.join(" - ")}
              </div>

              <button className="primary-btn" onClick={() => { setScreen("MENU"); resetLogic(); }}>
                 <ArrowLeft style={{display:'inline', marginRight:'10px'}} size={20} />
                 MENU
              </button>
           </motion.div>
        </div>
      )}
    </>
  );
}