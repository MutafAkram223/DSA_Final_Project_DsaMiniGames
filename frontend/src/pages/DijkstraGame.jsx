import React, { useState } from 'react';
import '../styles/dijsktra-game.css';
import { computeOptimalPath } from '../services/dijkstraApi';

// DATASETS 
const DATA_PAK = {
  theme: 'theme-pak', unit: 'L', icon: '⛽',
  nodes: [
    { id: 'isb', label: 'Islamabad', x: 65, y: 15 },
    { id: 'pes', label: 'Peshawar', x: 45, y: 10 },
    { id: 'lhr', label: 'Lahore', x: 75, y: 35 },
    { id: 'mul', label: 'Multan', x: 55, y: 50 },
    { id: 'que', label: 'Quetta', x: 20, y: 55 },
    { id: 'suk', label: 'Sukkur', x: 35, y: 65 },
    { id: 'khi', label: 'Karachi', x: 30, y: 85 },
  ],
  edges: [
    { u: 'pes', v: 'isb', w: 15 },
    { u: 'isb', v: 'lhr', w: 25 },
    { u: 'isb', v: 'mul', w: 45 },
    { u: 'lhr', v: 'mul', w: 30 },
    { u: 'lhr', v: 'suk', w: 80 },
    { u: 'mul', v: 'suk', w: 40 },
    { u: 'mul', v: 'que', w: 55 },
    { u: 'que', v: 'suk', w: 25 },
    { u: 'suk', v: 'khi', w: 45 },
    { u: 'que', v: 'khi', w: 70 },
  ]
};

const DATA_UET = {
  theme: 'theme-uet', unit: 'Min', icon: '⏱️',
  nodes: [
    { id: 'gate', label: 'Main Gate', x: 50, y: 90 },
    { id: 'audi', label: 'Auditorium', x: 30, y: 70 },
    { id: 'lib',  label: 'Library',   x: 70, y: 65 },
    { id: 'admin',label: 'Admin',     x: 50, y: 50 },
    { id: 'cs',   label: 'CS Dept',   x: 20, y: 35 },
    { id: 'cafe', label: 'SSC Cafe',  x: 80, y: 35 },
    { id: 'mech', label: 'Mech Dept', x: 50, y: 20 },
  ],
  edges: [
    { u: 'gate', v: 'audi', w: 5 },
    { u: 'gate', v: 'lib', w: 8 },
    { u: 'gate', v: 'admin', w: 10 },
    { u: 'audi', v: 'cs', w: 6 },
    { u: 'audi', v: 'admin', w: 4 },
    { u: 'admin', v: 'lib', w: 3 },
    { u: 'admin', v: 'mech', w: 7 },
    { u: 'lib', v: 'cafe', w: 5 },
    { u: 'cafe', v: 'mech', w: 6 },
    { u: 'cs', v: 'mech', w: 5 },
  ]
};

const DATA_WORLD = {
  theme: 'theme-world', unit: '$', icon: '💸',
  nodes: [
    { id: 'syd', label: 'Sydney', x: 90, y: 85 },
    { id: 'sin', label: 'Singapore', x: 75, y: 65 },
    { id: 'tok', label: 'Tokyo', x: 85, y: 35 },
    { id: 'pek', label: 'Beijing', x: 70, y: 30 },
    { id: 'dxb', label: 'Dubai', x: 55, y: 45 },
    { id: 'mos', label: 'Moscow', x: 50, y: 20 },
    { id: 'par', label: 'Paris', x: 40, y: 25 },
    { id: 'lon', label: 'London', x: 35, y: 20 },  
    { id: 'nyc', label: 'New York', x: 20, y: 35 },
    { id: 'lax', label: 'Los Angeles', x: 10, y: 40 },
    { id: 'rio', label: 'Rio', x: 25, y: 75 },
    { id: 'cpt', label: 'Cape Town', x: 50, y: 80 },
  ],
  edges: [
    { u: 'syd', v: 'tok', w: 800 },
    { u: 'syd', v: 'lax', w: 1200 }, 
    { u: 'tok', v: 'lax', w: 600 },
    { u: 'lax', v: 'nyc', w: 400 },
    { u: 'nyc', v: 'lon', w: 500 },
    
    { u: 'syd', v: 'sin', w: 400 },
    { u: 'sin', v: 'dxb', w: 350 },
    { u: 'sin', v: 'pek', w: 500 },
    { u: 'tok', v: 'pek', w: 300 },
    
    { u: 'pek', v: 'mos', w: 450 },
    { u: 'mos', v: 'par', w: 300 },
    { u: 'par', v: 'lon', w: 150 },
    
    { u: 'dxb', v: 'lon', w: 600 }, 
    { u: 'dxb', v: 'par', w: 550 },
    { u: 'dxb', v: 'cpt', w: 700 },
    
    { u: 'cpt', v: 'rio', w: 400 },
    { u: 'rio', v: 'nyc', w: 800 },
  ]
};

const LEVELS = {
  1: { id: 1, title: "Pakistan Rally", data: DATA_PAK, start: 'isb', end: 'khi', desc: "Navigate Pakistan! Find the cheapest fuel route." },
  2: { id: 2, title: "UET Blueprint", data: DATA_UET, start: 'gate', end: 'mech', desc: "Late for class? Find the fastest path on campus." },
  3: { id: 3, title: "Global Network", data: DATA_WORLD, start: 'syd', end: 'lon', desc: "Complex! Connect Sydney to London. Beware of expensive flights!" }
};

const DijkstraGame = () => {
  const [view, setView] = useState('MENU');
  const [currLvlId, setCurrLvlId] = useState(1);
  const [modal, setModal] = useState('BRIEF');
 
  const [currentNode, setCurrentNode] = useState(null);
  const [path, setPath] = useState([]);
  const [cost, setCost] = useState(0);
 
  const initLevel = (id) => {
    setCurrLvlId(id);
    setCost(0);
    const startNode = LEVELS[id].start;
    setPath([startNode]);
    setCurrentNode(startNode);
    setModal('BRIEF');
    setView('GAME');
  };

  const handleNodeClick = (targetId) => {
    if (modal !== 'NONE') return;

    const lvlData = LEVELS[currLvlId].data;
    const edge = lvlData.edges.find(e =>
      (e.u === currentNode && e.v === targetId) ||
      (e.v === currentNode && e.u === targetId)
    );

    if (!edge) return; 

    if (path.includes(targetId)) return;

    const newPath = [...path, targetId];
    const newCost = cost + edge.w;

    setPath(newPath);
    setCurrentNode(targetId);
    setCost(newCost);
 
    if (targetId === LEVELS[currLvlId].end) {
      validateResult(newPath, newCost);
    }
  };

  const handleUndo = () => {
    if (path.length <= 1) return;

    const newPath = [...path];
    const removedId = newPath.pop();
    const prevId = newPath[newPath.length - 1];

    const lvlData = LEVELS[currLvlId].data;
    const edge = lvlData.edges.find(e =>
      (e.u === removedId && e.v === prevId) ||
      (e.v === removedId && e.u === prevId)
    );

    setPath(newPath);
    setCurrentNode(prevId);
    setCost(prev => prev - (edge ? edge.w : 0));
  };

  const validateResult = async (finalPath, finalCost) => {
    const lvl = LEVELS[currLvlId];

    try {
      const result = await computeOptimalPath(lvl.data, lvl.start, lvl.end);

      setTimeout(() => {
        if (finalCost <= result.optimalCost) {
          setModal('WIN');
        } else {
          setModal('LOSE');
        }
      }, 400);
    } catch (err) {
      console.error("Backend compute failed:", err);
      setTimeout(() => setModal('LOSE'), 400);
    }
  };

  if (view === 'MENU') {
    return (
      <div className="menu-screen">
        <h1 className="game-logo">ROUTE MASTER</h1>
        <div className="cards-container">
          {[1, 2, 3].map(id => (
            <div key={id} className="level-card" onClick={() => initLevel(id)}>
              <div style={{fontSize:'3rem', marginBottom:'15px'}}>
                {id===1 ? '🚗' : id===2 ? '🏛️' : '🚀'}
              </div>
              <h2 style={{margin:0}}>{LEVELS[id].title}</h2>
              <p style={{color:'#636e72', fontSize:'0.9rem'}}>{LEVELS[id].desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const config = LEVELS[currLvlId];
  const { nodes, edges, theme, unit, icon } = config.data;

  return (
    <div className={`game-layout ${theme}`}>
      <div className="hud-bar">
        <div style={{display:'flex', gap:'10px'}}>
          <button className="btn-circle" onClick={() => setView('MENU')}>✕</button>
          <button className="btn-circle btn-undo" onClick={handleUndo}>↩</button>
          <button className="btn-circle" onClick={() => setModal('BRIEF')}>?</button>
        </div>

        <div style={{fontWeight:'bold', fontSize:'1.2rem', fontFamily:'Fredoka, sans-serif'}}>
          {nodes.find(n=>n.id===config.start).label} ➝ {nodes.find(n=>n.id===config.end).label}
        </div>

        <div className="score-board">
          {icon} {cost} <span style={{fontSize:'0.8em'}}>{unit}</span>
        </div>
      </div>

      <div className="map-board">
        <svg className="svg-layer">
          {edges.map((e, i) => {
            const start = nodes.find(n => n.id === e.u);
            const end = nodes.find(n => n.id === e.v);

            let isActive = false;
            for(let j=0; j<path.length-1; j++) {
              if ((path[j]===e.u && path[j+1]===e.v) || (path[j]===e.v && path[j+1]===e.u)) {
                isActive = true; break;
              }
            }
            return (
              <line
                key={`line-${i}`}
                x1={`${start.x}%`} y1={`${start.y}%`}
                x2={`${end.x}%`} y2={`${end.y}%`}
                className={`edge-line ${isActive ? 'active' : ''}`}
              />
            );
          })}

          {edges.map((e, i) => {
            const start = nodes.find(n => n.id === e.u);
            const end = nodes.find(n => n.id === e.v);

            let isActive = false;
            for(let j=0; j<path.length-1; j++) {
              if ((path[j]===e.u && path[j+1]===e.v) || (path[j]===e.v && path[j+1]===e.u)) {
                isActive = true; break;
              }
            }

            return (
              <g key={`label-${i}`} className={`cost-group ${isActive ? 'active' : ''}`}>
                <rect
                  x={`${(start.x+end.x)/2}%`} y={`${(start.y+end.y)/2}%`}
                  width="30" height="18" transform="translate(-15, -9)"
                  className="cost-pill"
                />
                <text
                  x={`${(start.x+end.x)/2}%`} y={`${(start.y+end.y)/2}%`}
                  className="cost-text"
                >
                  {e.w}
                </text>
              </g>
            );
          })}
        </svg>

        {nodes.map(n => {
          let status = '';
          if (n.id === config.start) status = 'start';
          if (n.id === config.end) status = 'end';
          if (n.id === currentNode) status = 'current';

          return (
            <div
              key={n.id}
              className={`node ${status}`}
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
              onClick={() => handleNodeClick(n.id)}
            >
              <div style={{fontSize:'1.5rem'}}>
                {n.id === config.start ? '🏁' : n.id === config.end ? '🏆' : status === 'current' ? icon : ''}
              </div>
              <div className="node-label">{n.label}</div>
            </div>
          );
        })}
      </div>

      {modal !== 'NONE' && (
        <div className="overlay">
          <div className="modal">
            {modal === 'BRIEF' && (
              <>
                <h2>MISSION BRIEF</h2>
                <p>{config.desc}</p>
                <p><strong>Goal:</strong> Reach the target with minimum cost.</p>
                <button className="btn-primary" onClick={() => setModal('NONE')}>START</button>
              </>
            )}
            {modal === 'WIN' && (
              <>
                <div style={{fontSize:'4rem'}}>🎉</div>
                <h2 style={{color:'#2ecc71'}}>MISSION SUCCESS!</h2>
                <p>You found the optimal route.</p>
                <button className="btn-primary" onClick={() => setView('MENU')}>MENU</button>
              </>
            )}
            {modal === 'LOSE' && (
              <>
                <div style={{fontSize:'4rem'}}>❌</div>
                <h2 style={{color:'#e74c3c'}}>ROUTE FAILED</h2>
                <p>This path was too expensive.</p>
                <button className="btn-primary" onClick={() => initLevel(currLvlId)}>RETRY</button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default DijkstraGame;
