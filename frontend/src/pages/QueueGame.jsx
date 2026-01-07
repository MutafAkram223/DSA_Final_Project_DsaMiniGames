import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK SERVICES ---
const enqueuePassenger = async (p) => Promise.resolve(p);
const dequeuePassenger = async () => Promise.resolve();
const clearQueue = async () => Promise.resolve();

// --- SAMPLE DATA ---
const PASSENGERS = [
  { name: "Smith, J", icon: "👨‍💼", class: "BUS" },
  { name: "Doe, A", icon: "👩‍🏫", class: "ECO" },
  { name: "Chen, L", icon: "👨‍💻", class: "ECO" },
  { name: "Prince, H", icon: "🤴", class: "FIRST" },
  { name: "Tourist, B", icon: "🎒", class: "ECO" }
];

const FLIGHTS = {
  1: { id: "AA-101", dest: "New York (JFK)", target: 5, capacity: 6, status: "Boarding" },
  2: { id: "BA-249", dest: "London (LHR)", target: 8, capacity: 5, status: "Final Call" },
  3: { id: "EK-505", dest: "Dubai (DXB)", target: 12, capacity: 4, status: "Overbooked" }
};

// --- LOG PARSER ---
const LogLine = ({ content }) => {
  if (content.startsWith('//')) return <span className="text-green-600 italic">{content}</span>;
  const parts = content.split(/(".*?"|[().,])/g).filter(Boolean);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('"')) return <span key={i} className="text-orange-300">{part}</span>;
        if (['enqueue', 'dequeue', 'gateQueue'].some(k => part.toLowerCase().includes(k))) {
            return part.includes('Queue') ? <span key={i} className="text-blue-400">{part}</span> : <span key={i} className="text-yellow-200">{part}</span>;
        }
        return <span key={i} className="text-gray-300">{part}</span>;
      })}
    </span>
  );
};

export default function QueueGame() {
  const [gameState, setGameState] = useState('START');
  const [level, setLevel] = useState(1);
  const [boarded, setBoarded] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [displayQueue, setDisplayQueue] = useState([]);
  const endRef = useRef(null);

  // --- AUTO-INJECT TAILWIND ---
  useEffect(() => {
    if (!document.querySelector('script[src="https://cdn.tailwindcss.com"]')) {
      const script = document.createElement('script');
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);

  const pushLog = useCallback((content) => {
    setLogs(l => [...l, { id: Date.now() + Math.random(), content }]);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    if (gameState === 'BOARDING') {
      pushLog('// System initialized. Protocol: FIFO');
      setDisplayQueue([]);
    }
  }, [gameState, pushLog]);

  async function handleCheckIn() {
    const flight = FLIGHTS[level];
    if (displayQueue.length >= flight.capacity) {
      pushLog('// Gate capacity full');
      return;
    }

    const p = PASSENGERS[Math.floor(Math.random() * PASSENGERS.length)];
    const newPassenger = {
      passengerName: p.name,
      passengerClass: p.class,
      icon: p.icon,
      docId: `P-${Date.now()}-${Math.floor(Math.random() * 999)}`,
      seat: `${Math.floor(Math.random() * 30) + 1}${['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]}`
    };

    setDisplayQueue(prev => [...prev, newPassenger]);
    pushLog(`gateQueue.Enqueue("${p.name}")`);

    try { await enqueuePassenger(newPassenger); } catch (e) { console.error(e); }
  }

  async function handleBoard() {
    if (displayQueue.length === 0) return;

    setProcessing(true);
    const passengerLeaving = displayQueue[0];

    try {
      await new Promise(r => setTimeout(r, 600));
      setDisplayQueue(prev => prev.slice(1));
      setBoarded(b => b + 1);
      pushLog(`gateQueue.Dequeue() // ${passengerLeaving.passengerName}`);
      checkWinCondition(boarded + 1);
      await dequeuePassenger();
    } catch (e) { console.error(e); }
    finally { setProcessing(false); }
  }

  function checkWinCondition(currentBoarded) {
    const flight = FLIGHTS[level];
    if (currentBoarded >= flight.target) {
      setTimeout(() => setGameState(level >= 3 ? 'COMPLETE' : 'DEPARTED'), 500);
    }
  }

  async function nextFlight() {
    await clearQueue();
    setDisplayQueue([]);
    setBoarded(0);
    setLevel(l => l + 1);
    setGameState('BOARDING');
    setLogs([]);
  }

  const flight = FLIGHTS[level] || FLIGHTS[1];
  const progress = Math.min((boarded / flight.target) * 100, 100);

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=JetBrains+Mono:wght@500;700&display=swap');
          
          @keyframes scan { 0% { transform: translateY(-10px); } 100% { transform: translateY(10px); } }
          @keyframes fifo-path {
            0% { transform: translateX(-200px); opacity: 0; }
            10% { opacity: 1; }
            30% { transform: translateX(-40px); }
            70% { transform: translateX(40px); }
            90% { opacity: 1; }
            100% { transform: translateX(200px); opacity: 0; }
          }
          @keyframes scanline { 0% { top: 0; } 100% { top: 100%; } }
          
          .animate-scan { animation: scan 0.5s linear infinite; }
          .animate-scanline { animation: scanline 3s linear infinite; }
          .animate-fifo-1 { animation: fifo-path 4s infinite ease-in-out; animation-delay: 0s; }
          .animate-fifo-2 { animation: fifo-path 4s infinite ease-in-out; animation-delay: 1.3s; }
          .animate-fifo-3 { animation: fifo-path 4s infinite ease-in-out; animation-delay: 2.6s; }
        `}
      </style>

      <div className="fixed inset-0 w-full h-full bg-[#0f172a] text-white font-['Inter'] overflow-hidden flex flex-col p-4 md:p-6 gap-4"
           style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        
        {/* 1. HUD */}
        <div className="flex-none grid grid-cols-[160px_1fr_160px] md:grid-cols-[200px_1fr_200px] gap-5 bg-slate-800/75 border border-white/10 rounded-2xl p-4 md:px-8 items-center backdrop-blur-md shadow-lg z-20">
          <div className="flex flex-col gap-1">
            <span className="text-[0.7rem] text-slate-400 uppercase font-bold tracking-wider">Flight</span>
            <div className="text-xl md:text-2xl font-bold flex items-center gap-2">
              {flight.id} 
              <span className="text-[0.6rem] bg-slate-700 px-2 py-0.5 rounded text-emerald-400 uppercase">{flight.status}</span>
            </div>
            <span className="text-xs text-slate-500">To: {flight.dest}</span>
          </div>

          <div className="flex flex-col items-center w-full">
            <span className="text-[0.7rem] text-slate-400 uppercase font-bold tracking-wider mb-1">BOARDING ({boarded}/{flight.target})</span>
            <div className="w-full max-w-md h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-[0.7rem] text-slate-400 uppercase font-bold tracking-wider">CAPACITY</span>
            <div className={`text-xl md:text-2xl font-bold ${displayQueue.length >= flight.capacity ? 'text-red-500' : 'text-white'}`}>
              {displayQueue.length} / {flight.capacity}
            </div>
            <span className="text-xs text-slate-500">Waiting</span>
          </div>
        </div>

        {/* 2. GAME STAGE */}
        {/* FIX: Increased bottom padding (pb-20) to ensure "REAR" labels aren't cut off by overflow */}
        <div className="flex-1 min-h-0 relative bg-gradient-to-b from-slate-800/30 to-slate-900/80 border border-white/10 rounded-2xl flex items-end px-[3vw] pb-20 gap-[3vw] shadow-inner overflow-hidden">
          
          {/* Tarmac Lines */}
          <div className="absolute bottom-0 left-0 w-full h-[30%] pointer-events-none opacity-20" 
               style={{ background: 'repeating-linear-gradient(90deg, transparent, transparent 100px, #fff 100px, #fff 102px)' }} 
          />
          
          {/* GATE DESK */}
          <div className={`relative w-[220px] h-[65%] max-h-[320px] min-h-[250px] bg-slate-800 border border-slate-600 rounded-xl flex justify-center shadow-2xl flex-shrink-0 z-10 ${processing ? 'ring-2 ring-blue-500/50' : ''}`}>
            <div className="absolute top-0 w-full h-[12%] bg-blue-600 rounded-t-[10px] flex items-center justify-center font-bold text-xs tracking-widest shadow-sm">GATE G-12</div>
            <div className="mt-[40%] w-[70%] h-[30%] bg-black rounded border border-slate-700 flex items-center justify-center text-emerald-500 font-['JetBrains_Mono'] text-xs">
              {processing ? "SCANNING..." : "READY"}
            </div>
            <div className={`absolute top-[55%] w-[70%] h-[2px] bg-red-500 shadow-[0_0_10px_#ef4444] opacity-0 ${processing ? 'animate-scan opacity-100' : ''}`} />
          </div>

          {/* PASSENGER LINE */}
          {/* Added pb-4 to this inner container to lift cards slightly more */}
          <div className="flex-1 min-w-0 flex items-end h-[65%] max-h-[320px] min-h-[250px] gap-4 z-10 pb-4">
            <AnimatePresence mode='popLayout'>
              {displayQueue.map((pax, index) => {
                const isFront = index === 0;
                const isRear = index === displayQueue.length - 1;

                return (
                  <motion.div
                    key={pax.docId}
                    layout="position"
                    initial={{ opacity: 0, x: 50, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, y: -20, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="relative w-[140px] flex-shrink min-w-[80px] h-[70%] bg-white text-slate-900 rounded-xl flex flex-col items-center shadow-xl select-none"
                    style={{ zIndex: 50 - index }}
                  >
                    <div className="w-full h-[18%] bg-blue-600 rounded-t-[10px] flex justify-between items-center px-2 text-white">
                      <span className="font-['JetBrains_Mono'] font-bold text-xs">{pax.seat}</span>
                      <span className="text-[0.6rem] opacity-90">{pax.passengerClass}</span>
                    </div>
                    <div className="text-4xl mt-[10%] mb-auto">{pax.icon}</div>
                    <div className="font-bold text-xs text-center w-full px-1 truncate pb-1">{pax.passengerName}</div>
                    <div className="font-['JetBrains_Mono'] text-[0.6rem] text-slate-500 mb-1">ID: {pax.docId.split('-')[2]}</div>
                    <div className="h-[10%] w-[80%] mb-2 opacity-70" 
                         style={{ background: 'repeating-linear-gradient(90deg, #000, #000 2px, white 2px, white 3px)' }} 
                    />
                    
                    {/* FRONT MARKER (Wait for scan) */}
                    {isFront && (
                      <motion.div layoutId="mark-front" className="absolute -bottom-8 w-full flex justify-center z-20">
                        <span className="bg-slate-900 text-emerald-500 border border-emerald-500 px-2 py-0.5 rounded text-[0.65rem] font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                          FRONT
                        </span>
                      </motion.div>
                    )}

                    {/* REAR MARKER (Just arrived) */}
                    {isRear && (
                      <motion.div layoutId="mark-rear" className="absolute -bottom-14 w-full flex justify-center z-10">
                        <span className="bg-slate-900 text-amber-500 border border-amber-500 px-2 py-0.5 rounded text-[0.65rem] font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                          REAR
                        </span>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* 3. CONSOLE */}
        <div className="flex-none h-[25vh] min-h-[150px] grid grid-cols-[200px_1fr] md:grid-cols-[280px_1fr] gap-5">
          <div className="flex flex-col gap-2 h-full">
            <button 
              className="flex-1 bg-white/5 border border-white/10 text-white rounded-lg px-5 flex items-center justify-between font-semibold hover:bg-white/10 hover:border-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              onClick={handleCheckIn} 
              disabled={processing || gameState !== 'BOARDING'}
            >
              <span>CHECK-IN</span><span className="text-xs font-['JetBrains_Mono'] opacity-60">Enqueue()</span>
            </button>
            <button 
              className="flex-1 bg-emerald-900/20 border border-emerald-500/30 text-emerald-400 rounded-lg px-5 flex items-center justify-between font-semibold hover:bg-emerald-900/40 hover:border-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              onClick={handleBoard} 
              disabled={processing || displayQueue.length === 0 || gameState !== 'BOARDING'}
            >
              <span>BOARD</span><span className="text-xs font-['JetBrains_Mono'] opacity-60">Dequeue()</span>
            </button>
          </div>

          <div className="bg-[#1e1e1e] border border-[#333] rounded-xl flex flex-col overflow-hidden font-['JetBrains_Mono'] shadow-2xl">
            <div className="bg-[#252526] h-[30px] border-b border-[#333] flex items-center px-4 text-xs text-white">
               <span className="flex items-center gap-2 border-t-2 border-blue-500 h-full px-2 bg-[#1e1e1e]">
                 <span className="text-blue-400 font-bold">C#</span> AirportController.cs
               </span>
            </div>
            <div className="p-3 overflow-y-auto flex-1 text-xs text-gray-300">
              {logs.map((l, i) => (
                <div key={l.id} className="flex mb-1 leading-relaxed">
                  <span className="text-gray-600 min-w-[25px] text-right mr-4 select-none">{i + 1}</span>
                  <LogLine content={l.content} />
                </div>
              ))}
              <div ref={endRef}></div>
            </div>
          </div>
        </div>

        {/* --- OVERLAYS --- */}
        {gameState === 'START' && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center">
            <div className="bg-slate-900 border border-white/10 p-10 rounded-3xl text-center shadow-2xl max-w-md w-full">
              <div className="inline-block bg-slate-800 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold mb-4">● SYSTEM ONLINE</div>
              <h1 className="text-5xl font-black mb-6 tracking-tight">SKYGATE</h1>
              <button 
                className="bg-emerald-500 text-slate-900 px-8 py-3 rounded-lg font-bold hover:scale-105 active:scale-95 transition-transform"
                onClick={() => setGameState('TUTORIAL')}
              >
                INITIALIZE SYSTEM
              </button>
            </div>
          </div>
        )}

        {gameState === 'TUTORIAL' && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/95 border border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.2)] rounded-2xl p-10 max-w-2xl w-full text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[4px] bg-blue-500 shadow-[0_0_15px_#3b82f6] animate-scanline opacity-50 pointer-events-none" />
              <h2 className="text-3xl font-bold mb-2 text-white">PROTOCOL: F.I.F.O.</h2>
              <div className="h-32 bg-white/5 border border-dashed border-white/20 rounded-xl my-8 flex items-center justify-center relative overflow-hidden">
                 <div className="w-5 h-5 rounded-full bg-red-500 absolute shadow-lg animate-fifo-1" />
                 <div className="w-5 h-5 rounded-full bg-yellow-500 absolute shadow-lg animate-fifo-2" />
                 <div className="w-5 h-5 rounded-full bg-emerald-500 absolute shadow-lg animate-fifo-3" />
                 <div className="absolute text-white/20 text-5xl">⮕</div>
              </div>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                This terminal operates on a <span className="text-blue-400 font-bold font-['JetBrains_Mono']">QUEUE</span> data structure.<br/>
                The first passenger to enter (<span className="text-blue-400 font-bold font-['JetBrains_Mono']">Enqueue</span>) is the first to leave (<span className="text-blue-400 font-bold font-['JetBrains_Mono']">Dequeue</span>).
              </p>
              <button 
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-500 transition-colors"
                onClick={() => setGameState('BOARDING')}
              >
                START OPERATIONS
              </button>
            </motion.div>
          </div>
        )}

        {(gameState === 'DEPARTED' || gameState === 'COMPLETE') && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center">
            <div className={`bg-slate-900 border-2 p-10 rounded-3xl text-center shadow-2xl max-w-md w-full ${gameState === 'COMPLETE' ? 'border-yellow-400' : 'border-emerald-500'}`}>
              <h1 className="text-6xl mb-4">{gameState === 'COMPLETE' ? '🏆' : '✈️'}</h1>
              <h2 className="text-3xl font-bold mb-6">{gameState}</h2>
              {gameState === 'COMPLETE' ? (
                <button className="bg-yellow-400 text-slate-900 px-8 py-3 rounded-lg font-bold hover:scale-105 transition-transform" onClick={() => window.location.reload()}>REBOOT</button>
              ) : (
                <button className="bg-emerald-500 text-slate-900 px-8 py-3 rounded-lg font-bold hover:scale-105 transition-transform" onClick={nextFlight}>NEXT FLIGHT</button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}