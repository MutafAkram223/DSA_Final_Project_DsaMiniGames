import React, { useState, useEffect } from 'react';
import { computeOptimalPath } from '../services/dijkstraApi';

// --- DATASETS ---
const DATA_PAK = {
  themeId: 'pak', unit: 'L', icon: '⛽',
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
  themeId: 'uet', unit: 'Min', icon: '⏱️',
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
  themeId: 'world', unit: '$', icon: '💸',
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

// --- THEME STYLES MAP ---
const THEMES = {
  pak: {
    bg: "bg-[#E0F2F1]",
    pattern: "radial-gradient(#80CBC4 2px, transparent 2px)",
    lineIdle: "#CFD8DC",
    lineActive: "#00695C",
    nodeBase: "bg-white border-[#00695C] text-gray-800",
    pillBg: "#fff",
    pillText: "#00695C"
  },
  uet: {
    bg: "bg-[#2c3e50]",
    pattern: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
    lineIdle: "#7f8c8d",
    lineActive: "#f1c40f",
    nodeBase: "bg-[#ecf0f1] border-[#2980b9] text-[#2c3e50]",
    pillBg: "#34495e",
    pillText: "#ecf0f1"
  },
  world: {
    bg: "bg-[#0F172A]",
    pattern: "radial-gradient(circle, #334155 1px, transparent 1px)",
    lineIdle: "#334155",
    lineActive: "#F43F5E",
    nodeBase: "bg-[#1E293B] border-[#38BDF8] text-[#38BDF8]",
    pillBg: "#0F172A",
    pillText: "#38BDF8"
  }
};

export default function DijkstraGame() {
  const [view, setView] = useState('MENU');
  const [currLvlId, setCurrLvlId] = useState(1);
  const [modal, setModal] = useState('BRIEF');
 
  const [currentNode, setCurrentNode] = useState(null);
  const [path, setPath] = useState([]);
  const [cost, setCost] = useState(0);

  // --- AUTO-INJECT TAILWIND ---
  useEffect(() => {
    if (!document.querySelector('script[src="https://cdn.tailwindcss.com"]')) {
      const script = document.createElement('script');
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);
 
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

  const config = LEVELS[currLvlId];
  const { nodes, edges, themeId, unit, icon } = config.data;
  const theme = THEMES[themeId];

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@700;900&display=swap');
          @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
          @keyframes pulse-border { 0%{border-color:#e74c3c;} 50%{border-color:white;} 100%{border-color:#e74c3c;} }
          @keyframes popIn { from{transform:scale(0);} to{transform:scale(1);} }
          .animate-float { animation: float 3s infinite ease-in-out; }
          .animate-popIn { animation: popIn 0.3s ease; }
          .animate-pulse-border { animation: pulse-border 2s infinite; }
        `}
      </style>

      {/* --- MENU SCREEN --- */}
      {view === 'MENU' && (
        <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] font-['Nunito']">
          <h1 className="font-['Fredoka'] text-[5rem] mb-8 text-[#2d3436] drop-shadow-[4px_4px_0_#fff] animate-float">
            ROUTE MASTER
          </h1>
          <div className="flex gap-5 flex-wrap justify-center">
            {[1, 2, 3].map(id => (
              <div 
                key={id} 
                className="w-[220px] bg-white rounded-[20px] p-5 text-center cursor-pointer border-[3px] border-[#2d3436] shadow-[0_8px_0_#b2bec3] transition-transform hover:-translate-y-1 active:translate-y-0 active:shadow-[0_4px_0_#b2bec3]"
                onClick={() => initLevel(id)}
              >
                <div className="text-5xl mb-4">
                  {id===1 ? '🚗' : id===2 ? '🏛️' : '🚀'}
                </div>
                <h2 className="text-xl font-bold m-0">{LEVELS[id].title}</h2>
                <p className="text-[#636e72] text-sm mt-2">{LEVELS[id].desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- GAME LAYOUT --- */}
      {view === 'GAME' && (
        <div 
          className={`h-screen flex flex-col p-4 transition-colors duration-500 ${theme.bg} font-['Nunito']`}
          style={{ backgroundImage: theme.pattern, backgroundSize: '40px 40px' }}
        >
          {/* HUD */}
          <div className="flex justify-between items-center bg-white p-2.5 px-5 rounded-[20px] border-[3px] border-[#2d3436] shadow-md mb-4 z-50">
            <div className="flex gap-2.5">
              <button className="w-11 h-11 rounded-full border-[3px] border-[#2d3436] bg-[#f1f2f6] flex justify-center items-center text-lg hover:scale-105 active:scale-90 transition-transform" onClick={() => setView('MENU')}>✕</button>
              <button className="w-11 h-11 rounded-full border-[3px] border-[#2d3436] bg-[#f1f2f6] flex justify-center items-center text-lg hover:scale-105 active:scale-90 transition-transform" onClick={handleUndo}>↩</button>
              <button className="w-11 h-11 rounded-full border-[3px] border-[#2d3436] bg-[#f1f2f6] flex justify-center items-center text-lg hover:scale-105 active:scale-90 transition-transform" onClick={() => setModal('BRIEF')}>?</button>
            </div>

            <div className="font-bold text-xl font-['Fredoka'] text-[#2d3436]">
              {nodes.find(n=>n.id===config.start).label} ➝ {nodes.find(n=>n.id===config.end).label}
            </div>

            <div className="bg-[#2d3436] text-white px-5 py-1.5 rounded-xl font-['Fredoka'] text-xl">
              {icon} {cost} <span className="text-sm ml-1">{unit}</span>
            </div>
          </div>

          {/* MAP BOARD */}
          <div className="flex-grow relative bg-white/5 rounded-[20px] border-[3px] border-black/10 shadow-[inset_0_0_30px_rgba(0,0,0,0.05)] overflow-hidden">
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-[1]">
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
                    stroke={isActive ? theme.lineActive : theme.lineIdle}
                    strokeWidth={isActive ? 7 : 5}
                    strokeLinecap="round"
                    strokeDasharray={isActive ? "0" : "10, 8"}
                    className="transition-all duration-300"
                    style={{ filter: isActive ? `drop-shadow(0 0 4px ${theme.lineActive})` : 'none' }}
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
                  <g key={`label-${i}`} className="transition-transform duration-200">
                    <rect
                      x={`${(start.x+end.x)/2}%`} y={`${(start.y+end.y)/2}%`}
                      width="30" height="18" transform="translate(-15, -9)"
                      fill={theme.pillBg}
                      stroke={isActive ? theme.lineActive : theme.lineIdle}
                      strokeWidth={isActive ? 3 : 2}
                      rx="8" ry="8"
                    />
                    <text
                      x={`${(start.x+end.x)/2}%`} y={`${(start.y+end.y)/2}%`}
                      className="font-['Fredoka'] font-bold text-[13px]"
                      fill={isActive ? theme.lineActive : theme.pillText}
                      textAnchor="middle" dominantBaseline="middle"
                    >
                      {e.w}
                    </text>
                  </g>
                );
              })}
            </svg>

            {nodes.map(n => {
              let statusClasses = '';
              if (n.id === config.start) statusClasses = 'border-[#2ecc71] shadow-[0_0_15px_#2ecc71] z-10';
              if (n.id === config.end) statusClasses = 'border-[#e74c3c] animate-pulse-border z-10';
              if (n.id === currentNode) {
                statusClasses = 'bg-[#FFCA28] border-white scale-125 z-20 shadow-lg -translate-y-[60%]';
              }

              // Base classes based on theme + standard node layout
              const nodeClasses = `absolute w-[50px] h-[50px] -translate-x-1/2 -translate-y-1/2 border-[3px] rounded-full flex justify-center items-center cursor-pointer transition-all duration-200 shadow-sm hover:-translate-y-[60%] hover:scale-110 hover:z-30 ${theme.nodeBase} ${statusClasses}`;

              return (
                <div
                  key={n.id}
                  className={nodeClasses}
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}
                  onClick={() => handleNodeClick(n.id)}
                >
                  <div className="text-2xl">
                    {n.id === config.start ? '🏁' : n.id === config.end ? '🏆' : n.id === currentNode ? icon : ''}
                  </div>
                  <div className="absolute top-[55px] bg-white text-[#2d3436] px-2 py-0.5 rounded-lg text-xs font-extrabold border-2 border-[#2d3436] whitespace-nowrap pointer-events-none z-20">
                    {n.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* MODAL */}
          {modal !== 'NONE' && (
            <div className="fixed inset-0 bg-black/85 z-[100] flex justify-center items-center p-4">
              <div className="bg-white p-8 rounded-[25px] border-4 border-[#2d3436] text-center w-[450px] animate-popIn">
                {modal === 'BRIEF' && (
                  <>
                    <h2 className="text-2xl font-bold mb-4 font-['Fredoka']">MISSION BRIEF</h2>
                    <p className="mb-2 text-lg">{config.desc}</p>
                    <p className="mb-6 text-gray-600"><strong>Goal:</strong> Reach the target with minimum cost.</p>
                    <button 
                      className="bg-[#0984e3] text-white border-none px-8 py-3 font-['Fredoka'] text-xl rounded-full cursor-pointer shadow-[0_5px_0_#005aa7] active:translate-y-1 active:shadow-none transition-all"
                      onClick={() => setModal('NONE')}
                    >
                      START
                    </button>
                  </>
                )}
                {modal === 'WIN' && (
                  <>
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-3xl font-bold mb-2 text-[#2ecc71] font-['Fredoka']">MISSION SUCCESS!</h2>
                    <p className="mb-6 text-lg">You found the optimal route.</p>
                    <button 
                      className="bg-[#0984e3] text-white border-none px-8 py-3 font-['Fredoka'] text-xl rounded-full cursor-pointer shadow-[0_5px_0_#005aa7] active:translate-y-1 active:shadow-none transition-all"
                      onClick={() => setView('MENU')}
                    >
                      MENU
                    </button>
                  </>
                )}
                {modal === 'LOSE' && (
                  <>
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-3xl font-bold mb-2 text-[#e74c3c] font-['Fredoka']">ROUTE FAILED</h2>
                    <p className="mb-6 text-lg">This path was too expensive.</p>
                    <button 
                      className="bg-[#0984e3] text-white border-none px-8 py-3 font-['Fredoka'] text-xl rounded-full cursor-pointer shadow-[0_5px_0_#005aa7] active:translate-y-1 active:shadow-none transition-all"
                      onClick={() => initLevel(currLvlId)}
                    >
                      RETRY
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}