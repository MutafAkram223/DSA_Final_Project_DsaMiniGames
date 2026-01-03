import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/tree-game.css";
import { validateTraversalArray } from "../services/treeApi";

const TREE_DATA = {
  A: { id: "A", left: "B", right: "C", x: 1500, y: 450 },
  B: { id: "B", left: "D", right: "E", x: 750, y: 800 },
  C: { id: "C", left: "F", right: "G", x: 2250, y: 800 },
  D: { id: "D", left: null, right: null, x: 350, y: 1150 },
  E: { id: "E", left: null, right: null, x: 1150, y: 1150 },
  F: { id: "F", left: null, right: null, x: 1850, y: 1150 },
  G: { id: "G", left: null, right: null, x: 2650, y: 1150 },
};

const TREE_ARRAY = ["A", "B", "C", "D", "E", "F", "G"];

const LEVELS = {
  PRE: {
    title: "Pre-Order",
    rule: "ROOT → LEFT → RIGHT",
    hint: "Capture the node IMMEDIATELY upon arrival.",
    targetVisit: 1,
  },
  IN: {
    title: "In-Order",
    rule: "LEFT → ROOT → RIGHT",
    hint: "Go Left first. Capture when you return to the parent.",
    targetVisit: 2,
  },
  POST: {
    title: "Post-Order",
    rule: "LEFT → RIGHT → ROOT",
    hint: "Visit both children first. Capture parent last.",
    targetVisit: 3,
  },
};

export default function TreeGame() {
  const [gameState, setGameState] = useState("MENU");
  const [levelId, setLevelId] = useState("PRE");
  const [logs, setLogs] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const [currNode, setCurrNode] = useState("A");
  const [visitCount, setVisitCount] = useState(1);
  const [pathStack, setPathStack] = useState([]);
  const [history, setHistory] = useState([]);

  const calculateNextState = () => {
    const node = TREE_DATA[currNode];
    let nextNode = currNode;
    let nextVisit = visitCount;
    let nextStack = [...pathStack];

    if (visitCount === 1) {
      if (node.left) {
        nextStack.push(currNode);
        nextNode = node.left;
        nextVisit = 1;
      } else {
        nextVisit = 2;
      }
    } else if (visitCount === 2) {
      if (node.right) {
        nextStack.push(currNode);
        nextNode = node.right;
        nextVisit = 1;
      } else {
        nextVisit = 3;
      }
    } else if (visitCount === 3) {
      if (nextStack.length > 0) {
        const parentId = nextStack.pop();
        nextNode = parentId;
        const parent = TREE_DATA[parentId];
        if (parent.left === currNode) {
          nextVisit = 2;
        } else {
          nextVisit = 3;
        }
      } else {
        return "FINISHED";
      }
    }

    return { nextNode, nextVisit, nextStack };
  };

  const handleNext = async () => {
    setHistory([...history, { currNode, visitCount, pathStack: [...pathStack], logs: [...logs] }]);

    const res = calculateNextState();

    if (res === "FINISHED") {
 
      const payload = {
        treeArray: TREE_ARRAY,       
        traversalType: levelId,     
        userSequence: logs         
      };

      try {
        const result = await validateTraversalArray(payload);

        if (result.isCorrect) {
          setFeedback({ msg: "✅ Traversal Correct!", type: "good" });
          setTimeout(() => setGameState("WON"), 700);
        } else {
          setFeedback({ msg: "❌ Wrong Traversal!", type: "bad" });

          console.log("Expected:", result.expectedSequence.join(" → "));
          setTimeout(() => setGameState("LOST"), 900);
        }
      } catch (err) {
        console.error("Validation API failed:", err);
     
        if (logs.length === TREE_ARRAY.length) {
          setFeedback({ msg: "✅ (Fallback) Looks complete", type: "good" });
          setTimeout(() => setGameState("WON"), 700);
        } else {
          setFeedback({ msg: "❌ Validation failed", type: "bad" });
          setTimeout(() => setGameState("LOST"), 900);
        }
      }

      return;
    }

    setCurrNode(res.nextNode);
    setVisitCount(res.nextVisit);
    setPathStack(res.nextStack);
  };

  const handleCapture = () => {
    if (logs.includes(currNode)) {
      setFeedback({ msg: "Already Logged!", type: "warn" });
      setTimeout(() => setFeedback(null), 900);
      return;
    }

    setLogs([...logs, currNode]);
    setFeedback({ msg: "⭐ Captured", type: "good" });
    setTimeout(() => setFeedback(null), 700);
  };


  const handleBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setCurrNode(prev.currNode);
    setVisitCount(prev.visitCount);
    setPathStack(prev.pathStack);
    setLogs(prev.logs);
    setHistory(history.slice(0, -1));
  };

  const startNewGame = () => {
    setLogs([]);
    setCurrNode("A");
    setVisitCount(1);
    setPathStack([]);
    setHistory([]);
    setFeedback(null);
    setGameState("PLAYING");
  };

  const getStarState = (nodeId, starType) => {
    if (nodeId !== currNode) return "";
    if (starType === 1 && visitCount >= 1) return "active";
    if (starType === 2 && visitCount >= 2) return "active";
    if (starType === 3 && visitCount >= 3) return "active";
    return "";
  };

  if (gameState === "MENU") {
    return (
      <div className="game-container menu-bg">
        <h1 className="game-logo">SKY HOPPER</h1>
        <p className="game-subtitle">Master the Trees of Logic</p>

        <div className="level-container">
          {Object.entries(LEVELS).map(([key, lvl]) => (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={key}
              className="level-card"
              onClick={() => {
                setLevelId(key);
                setGameState("BRIEFING");
              }}
            >
              <div className="card-badge">{key === "PRE" ? "Level 1" : key === "IN" ? "Level 2" : "Level 3"}</div>
              <h2>{lvl.title}</h2>
              <div className="card-rule">{lvl.rule}</div>
              <p className="card-desc">Click to Start</p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (gameState === "BRIEFING") {
    return (
      <div className="game-container menu-bg">
        <motion.div className="briefing-modal" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <h2>Mission: {LEVELS[levelId].title}</h2>
          <div className="tutorial-rule">
            <span>PATTERN:</span> {LEVELS[levelId].rule}
          </div>
          <p className="tutorial-hint">💡 {LEVELS[levelId].hint}</p>
          <button className="start-btn" onClick={() => startNewGame()}>
            LIFT OFF 🚀
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="game-container sky-bg">
      {/* HUD simplified — left shows mission only */}
      <div className="hud-bar" style={{ justifyContent: "flex-start", paddingLeft: 30 }}>
        <div>
          <span className="hud-label">MISSION</span>
          <div style={{ fontWeight: "700", fontSize: "1.2rem" }}>{LEVELS[levelId].title}</div>
        </div>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div className={`feedback-bubble ${feedback.type}`} initial={{ y: -50, opacity: 0, scale: 0.5 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            {feedback.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="world-view">
        <svg viewBox="0 0 3000 1600" className="game-svg">
          {Object.values(TREE_DATA).map((node) => (
            <React.Fragment key={node.id}>
              {node.left && <line x1={node.x} y1={node.y} x2={TREE_DATA[node.left].x} y2={TREE_DATA[node.left].y} className="connector" />}
              {node.right && <line x1={node.x} y1={node.y} x2={TREE_DATA[node.right].x} y2={TREE_DATA[node.right].y} className="connector" />}
            </React.Fragment>
          ))}

          {Object.values(TREE_DATA).map((node) => (
            <g key={node.id} transform={`translate(${node.x},${node.y})`}>
              <circle r="70" className={`node-base ${logs.includes(node.id) ? "captured" : ""}`} />
              <text y="22" className="node-text">{node.id}</text>

              <circle cx="-60" cy="0" r="14" className={`star ${getStarState(node.id, 1)}`} />
              <circle cx="0" cy="85" r="14" className={`star ${getStarState(node.id, 2)}`} />
              <circle cx="60" cy="0" r="14" className={`star ${getStarState(node.id, 3)}`} />
            </g>
          ))}

          <motion.g animate={{ x: TREE_DATA[currNode].x, y: TREE_DATA[currNode].y - 130 }} transition={{ type: "spring", stiffness: 100, damping: 15 }}>
            <ellipse cx="0" cy="190" rx="40" ry="10" fill="rgba(0,0,0,0.2)" filter="blur(5px)" />
            <motion.g animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
              <path d="M-70,0 C-70,-40 70,-40 70,0 C70,40 -70,40 -70,0" fill="#ff6b81" stroke="#fff" strokeWidth="5" />
              <path d="M-70,0 L-95,-20 L-70,-10 Z" fill="#2f3542" />
              <circle cx="30" cy="-10" r="12" fill="#7bed9f" stroke="#fff" strokeWidth="2" />
              <path d="M-20,40 L20,40 L0,60 Z" fill="#ff4757" stroke="#fff" strokeWidth="3" />
            </motion.g>
          </motion.g>
        </svg>
      </div>

      <div className="control-panel glass">
        <div className="log-readout">
          <span className="log-label">TRAVERSAL LOG:</span>
          <div className="log-data">{logs.length > 0 ? logs.join(" → ") : "Ready to log..."}</div>
        </div>

        <div className="btn-group">
          <button className="game-btn undo" onClick={handleBack} disabled={history.length === 0}>↩ UNDO</button>
          <button className="game-btn capture" onClick={handleCapture}>📸 CAPTURE</button>
          <button className="game-btn next" onClick={handleNext}>NEXT ➡</button>
        </div>
      </div>

      <AnimatePresence>
        {(gameState === "WON" || gameState === "LOST") && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="result-card" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <h1 style={{ color: gameState === "WON" ? "#2ed573" : "#ff4757" }}>{gameState === "WON" ? "MISSION COMPLETE!" : "MISSION FAILED"}</h1>
              <p>{gameState === "WON" ? "Perfect traversal." : "Traversal did not match the rule."}</p>
              <div className="final-score">Final Sequence: {logs.join(" - ")}</div>
              <button className="restart-btn" onClick={() => setGameState("MENU")}>RETURN TO BASE</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
