import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Castle, Sword, Shield, RefreshCw, Zap, 
  Crown, Flag, AlertTriangle, CheckCircle2, 
  Map, Target, TowerControl, ChevronRight, Activity, ScrollText, XCircle
} from 'lucide-react';

// Import logic from your local file
import { RedBlackTree, COLORS } from '../services/RedBlackGame';

// --- VISUAL CONSTANTS ---
const RED = '#ff4757';
const BLACK = '#2f3542';
const GOLD = '#ffd93d';
const BLUE = '#3742fa';
const GREEN = '#2ed573';

const MilitaryBtn = ({ onClick, color, icon: Icon, label, disabled, size = 'md', variant = 'standard' }) => (
  <motion.button
    whileHover={!disabled ? { y: -2, scale: 1.05 } : {}}
    whileTap={!disabled ? { y: 1 } : {}}
    onClick={onClick}
    disabled={disabled}
    className={`
      flex items-center justify-center gap-2 font-extrabold rounded-xl transition-all shadow-md select-none
      ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-300 border-gray-300 text-gray-500' : 'cursor-pointer'}
      ${size === 'lg' ? 'px-6 py-3 text-lg' : 'px-3 py-2 text-xs md:text-sm'}
    `}
    style={{
      backgroundColor: disabled ? undefined : (variant === 'outline' ? 'white' : color),
      border: `2px solid ${disabled ? 'transparent' : color}`,
      color: disabled ? undefined : (variant === 'outline' ? color : 'white'),
    }}
  >
    {Icon && <Icon size={size === 'lg' ? 24 : 16} strokeWidth={2.5} />}
    <span>{label}</span>
  </motion.button>
);

export default function CastleRealmDefender() {
  // --- STATE ---
  const [towers, setTowers] = useState([]);
  const [edges, setEdges] = useState([]); // NEW: State for lines
  const [gameState, setGameState] = useState('MENU'); 
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [integrity, setIntegrity] = useState(100);
  const [message, setMessage] = useState({ text: "Commander! The realm awaits your strategy.", type: 'neutral' });
  const [logs, setLogs] = useState([]); 
  const [activeTower, setActiveTower] = useState(null);
  const [showTactics, setShowTactics] = useState(false);
  const [enemies, setEnemies] = useState([]);
  const [currentMission, setCurrentMission] = useState(null);
  
  // Refs
  const treeRef = useRef(new RedBlackTree());
  const [usedValues, setUsedValues] = useState(new Set());

  const CASTLE_LAWS = [
    { title: "ROYAL LAW", desc: "The Central Keep must always be BLACK (Royal Guard).", color: BLACK, icon: Crown },
    { title: "MAGIC LAW", desc: "A RED Sorcerer Tower cannot neighbor another RED tower.", color: RED, icon: Zap },
    { title: "DEFENSE LAW", desc: "Every patrol route must have equal BLACK towers.", color: BLACK, icon: Shield },
    { title: "CONSTRUCTION LAW", desc: "New towers start as RED (Sorcerer's Magic).", color: RED, icon: TowerControl }
  ];

  // --- LOGGING SYSTEM ---
  const addLog = (text, type = 'info') => {
    setLogs(prev => [{ id: Date.now(), text, type }, ...prev].slice(0, 2));
  };

  // --- LOOPS ---
  useEffect(() => {
    let timer;
    if (gameState === 'PUZZLE') {
      timer = setInterval(() => {
        setIntegrity(prev => {
          if (prev <= 0) {
            setGameState('SIEGE_LOST');
            return 0;
          }
          return prev - 0.5;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  useEffect(() => {
    let enemyInterval;
    if (gameState === 'PLAYING' || gameState === 'PUZZLE') {
      enemyInterval = setInterval(() => {
        if (Math.random() > 0.7 && towers.length > 0) {
          const randomTower = towers[Math.floor(Math.random() * towers.length)];
          setEnemies(prev => [...prev, {
            id: Date.now() + Math.random(),
            targetX: randomTower.x,
            targetY: randomTower.y,
            progress: 0
          }]);
        }
      }, 3000);
    }
    return () => clearInterval(enemyInterval);
  }, [gameState, towers]);

  useEffect(() => {
    if (enemies.length === 0) return;
    if (gameState === 'SIEGE_LOST' || gameState === 'MENU' || gameState === 'VICTORY' || gameState === 'LEVEL_COMPLETE') {
      setEnemies([]);
      return;
    }
    const moveInterval = setInterval(() => {
      setEnemies(prev => prev.map(enemy => ({
        ...enemy,
        progress: enemy.progress + 0.05
      })).filter(enemy => enemy.progress < 1));
    }, 100);
    return () => clearInterval(moveInterval);
  }, [enemies, gameState]);

  // --- LOGIC ---
  const generateRandomMission = (lvl) => {
    if (lvl > 7) return null;
    let val;
    do {
      val = Math.floor(Math.random() * 90) + 10;
    } while (usedValues.has(val));

    const missionNames = ["Iron Outpost", "Shadow Keep", "Dragon's Peak", "Frost Spire", "Ember Fort", "Storm Citadel", "Void Nexus"];
    return { name: `${missionNames[lvl-1] || 'Outpost'}`, val, task: `Construct Tower ${val}` };
  };

  const startCampaign = () => {
    if (treeRef.current && typeof treeRef.current.clear === 'function') {
      treeRef.current.clear();
    } else {
      treeRef.current = new RedBlackTree();
    }
    
    setUsedValues(new Set());
    setTowers([]);
    setEdges([]); // Clear edges
    setEnemies([]);
    setLogs([]);
    setLevel(1);
    setScore(0);
    setIntegrity(100);
    setGameState('PLAYING');

    const firstMission = generateRandomMission(1);
    setCurrentMission(firstMission);
    setTimeout(() => buildTower(firstMission.val), 500);
  };

  const buildTower = (val) => {
    setMessage({ text: `Constructing Tower ${val}...`, type: 'neutral' });
    const newNode = treeRef.current.insert(val);
    setUsedValues(prev => new Set(prev).add(val));
    updateVisuals();

    setTimeout(() => {
      if (newNode.parent && newNode.parent.color === COLORS.RED) {
        setGameState('PUZZLE');
        setActiveTower(newNode);
        setMessage({ text: "⚠️ VIOLATION: Double Red detected!", type: 'danger' });
        addLog(`Tower ${val} (RED) has Parent ${newNode.parent.val} (RED). Rule Violation!`, 'danger');
      } else {
        if (treeRef.current.root.color === COLORS.RED) {
          treeRef.current.root.color = COLORS.BLACK;
          addLog("Root node painted BLACK by Royal Law.", 'info');
        } else if (newNode.parent) {
          addLog(`Tower ${val} placed safely. Parent ${newNode.parent.val} is BLACK.`, 'success');
        } else {
          addLog("Root Tower established.", 'success');
        }
        updateVisuals();
        setTimeout(() => completeLevel(), 1000);
      }
    }, 800);
  };

  const completeLevel = () => {
    setScore(s => s + Math.floor(integrity));
    if (level >= 6) {
      setMessage({ text: "CAMPAIGN VICTORY! The Realm is Safe.", type: 'success' });
      setGameState('VICTORY');
    } else {
      setMessage({ text: "Sector Secured. Awaiting Orders.", type: 'success' });
      setGameState('LEVEL_COMPLETE');
    }
  };

  const proceedToNextMission = () => {
    const nextLvl = level + 1;
    setLevel(nextLvl);
    setIntegrity(100);
    setGameState('PLAYING');

    const nextMission = generateRandomMission(nextLvl);
    if(nextMission) {
      setCurrentMission(nextMission);
      buildTower(nextMission.val);
    } else {
      setGameState('VICTORY');
    }
  };

  const updateVisuals = () => {
    const { nodes, edges } = treeRef.current.getVisualData();
    setTowers([...nodes]);
    setEdges([...edges]);
  };

  const handleCommanderOrder = (order) => {
    if (gameState !== 'PUZZLE' || !activeTower) return;
    const tree = treeRef.current;
    let k = activeTower;
    let p = k.parent;
    let g = p ? p.parent : null;
    if (!g) return;

    let uncle = (g.left === p) ? g.right : g.left;
    let uncleIsRed = uncle && (uncle.color === COLORS.RED);
    let correctMove = false;
    let explanation = "";

    if (order === 'RECOLOR_TOWERS') {
      if (uncleIsRed) {
        correctMove = true;
        p.color = COLORS.BLACK;
        uncle.color = COLORS.BLACK;
        g.color = COLORS.RED;
        explanation = `Uncle ${uncle.val} was RED. Recolor Strategy successful.`;
        if (g === tree.root) {
          g.color = COLORS.BLACK;
          explanation += " Root re-painted BLACK.";
          finishPuzzleStep(explanation);
        } else if (g.parent && g.parent.color === COLORS.RED) {
          setActiveTower(g);
          updateVisuals();
          setMessage({ text: "Violation moved up! Stabilize the Grandparent!", type: 'danger' });
          addLog(explanation + " Warning: Violation moved up!", 'warning');
          return;
        } else {
          finishPuzzleStep(explanation);
        }
      }
    } else if (order === 'REALIGN_WALLS') {
      if (!uncleIsRed) {
        correctMove = true;
        if (p === g.left) {
          if (k === p.right) {
            tree.rotateLeft(p);
            tree.rotateRight(g);
            k.color = COLORS.BLACK;
            explanation = "Triangle formation detected. Double Rotation executed.";
          } else {
            tree.rotateRight(g);
            p.color = COLORS.BLACK;
            explanation = "Line formation detected. Single Right Rotation executed.";
          }
        } else {
          if (k === p.left) {
            tree.rotateRight(p);
            tree.rotateLeft(g);
            k.color = COLORS.BLACK;
            explanation = "Triangle formation detected. Double Rotation executed.";
          } else {
            tree.rotateLeft(p);
            p.color = COLORS.BLACK;
            explanation = "Line formation detected. Single Left Rotation executed.";
          }
        }
        g.color = COLORS.RED;
        finishPuzzleStep(explanation);
      }
    }

    if (correctMove) {
      updateVisuals();
    } else {
      setIntegrity(prev => Math.max(0, prev - 20));
      setMessage({ text: "WRONG TACTIC! Analyze the Uncle's color!", type: 'danger' });
      addLog("Failed Order. Check Castle Laws.", 'danger');
      shakeScreen();
    }
  };

  const finishPuzzleStep = (explanation = "Structure Stabilized.") => {
    setActiveTower(null);
    treeRef.current.root.color = COLORS.BLACK;
    addLog(explanation, 'success');
    updateVisuals();
    setTimeout(() => completeLevel(), 1000);
  };

  const shakeScreen = () => {
    const el = document.getElementById('game-container');
    if (el) {
      el.classList.add('animate-shake');
      setTimeout(() => el.classList.remove('animate-shake'), 500);
    }
  };

  return (
    <div id="game-container" className="w-screen h-screen overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-950 flex flex-col font-sans select-none relative">
      
      {/* --- CSS & ANIMATIONS --- */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        .bg-grid-pattern {
          background-image: radial-gradient(circle at 50% 80%, rgba(74, 105, 189, 0.2), transparent 60%);
        }
        .log-scroll::-webkit-scrollbar { width: 4px; }
        .log-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 4px; }
      `}</style>

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-grid-pattern z-0 pointer-events-none" />
      <div className="absolute top-2 w-full text-center text-yellow-300 text-xs font-bold tracking-[0.2em] opacity-60 z-10">
        ⚔️ CASTLE REALM DEFENDER ⚔️
      </div>

      {/* HEADER */}
      <header className="relative z-20 w-full px-4 pt-8 pb-2 flex flex-col items-center gap-2">
        <div className="w-full max-w-4xl bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-2 text-white">
            <div className="bg-black/30 p-1.5 rounded-lg"><Flag className="text-green-400 fill-current" size={16} /></div>
            <div>
              <div className="text-[10px] uppercase opacity-70 font-bold">Honor</div>
              <div className="text-lg font-black text-yellow-300 leading-none">{score}</div>
            </div>
          </div>
          <div className="text-center text-white hidden md:block">
            <div className="text-[10px] uppercase opacity-70 tracking-widest">Target</div>
            <div className="text-base font-black drop-shadow-md leading-none">{currentMission?.name || "Standby"}</div>
          </div>
          <div className="flex items-center gap-2 text-white justify-end">
             <div className="bg-black/30 p-1.5 rounded-lg">
               <Shield className={`${integrity < 30 ? 'text-red-500' : 'text-green-500'} fill-current`} size={16} />
             </div>
            <div>
              <div className="text-[10px] uppercase opacity-70 font-bold">Integrity</div>
              <div className="text-lg font-black text-yellow-300 leading-none">{Math.floor(integrity)}%</div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN BATTLEFIELD */}
      <main className="flex-1 relative w-full overflow-visible flex justify-center z-10">
        
        {/* ALERTS */}
        <AnimatePresence>
          <motion.div 
            key={message.text}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className={`
              absolute top-2 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full font-bold text-xs md:text-sm shadow-xl
              flex items-center gap-2 backdrop-blur-md border-2 z-50 whitespace-nowrap
              ${message.type === 'danger' ? 'bg-red-500/20 border-red-500 text-red-100' : 
                message.type === 'success' ? 'bg-green-500/20 border-green-500 text-green-100' : 
                'bg-blue-900/40 border-blue-400 text-blue-100'}
            `}
          >
            {message.type === 'danger' && <AlertTriangle size={16} />}
            {message.type === 'success' && <CheckCircle2 size={16} />}
            {message.type === 'neutral' && <Activity size={16} />}
            <span>{message.text}</span>
          </motion.div>
        </AnimatePresence>

        <div className="relative w-full h-full">
          {enemies.map(enemy => (
            <motion.div
              key={enemy.id}
              className="absolute text-2xl z-20 pointer-events-none drop-shadow-md opacity-70"
              style={{
                left: `calc(50% + ${enemy.targetX * enemy.progress}px)`,
                top: `${enemy.targetY * enemy.progress}px`,
                opacity: 1 - enemy.progress
              }}
            >
              ⚔️
            </motion.div>
          ))}

          {/* SVG LAYER FOR LINES (BEHIND TOWERS) */}
          <svg className="absolute top-[80px] left-0 w-full h-full pointer-events-none z-10 overflow-visible">
            {edges.map(edge => (
              <motion.line
                key={edge.id}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                x1={`calc(50% + ${edge.x1}px)`}
                y1={edge.y1 + 55} // Connect from bottom of parent (tower height ~60px)
                x2={`calc(50% + ${edge.x2}px)`}
                y2={edge.y2} // Connect to top of child
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.5))" }}
              />
            ))}
          </svg>

          <AnimatePresence>
            {towers.map((tower) => {
              const isRedTower = tower.color === RED || tower.color === COLORS.RED;
              const isViolator = activeTower && activeTower.val === tower.val;

              return (
                <motion.div
                  key={tower.id}
                  initial={{ scale: 0, opacity: 0, y: -50 }}
                  animate={{ 
                    scale: isViolator ? [1, 1.1, 1] : 1, 
                    opacity: 1,
                    y: tower.y 
                  }}
                  transition={{ 
                    scale: isViolator ? { repeat: Infinity, duration: 0.8 } : { type: "spring", stiffness: 200 },
                    y: { type: "spring", stiffness: 120, damping: 14 }
                  }}
                  className={`
                    absolute w-[50px] h-[55px] md:w-[60px] md:h-[65px] rounded-t-xl border-[3px] border-b-0
                    flex flex-col justify-end items-center pb-2 z-30 transition-colors duration-500
                    ${isViolator ? 'z-40 ring-4 ring-yellow-400 shadow-[0_0_30px_rgba(255,215,0,0.6)]' : ''}
                  `}
                  style={{
                    left: `calc(50% + ${tower.x}px - 25px)`, // centered anchor
                    top: '80px', // Adjusted to not hit header
                    background: isRedTower 
                      ? 'linear-gradient(180deg, #ff6b6b 0%, #c0392b 100%)' 
                      : 'linear-gradient(180deg, #57606f 0%, #2f3542 100%)',
                    borderColor: isRedTower ? '#a30000' : '#000',
                    boxShadow: `0 8px 0 ${isRedTower ? '#7f0000' : '#000'}`
                  }}
                >
                  <div className="text-xs md:text-sm mb-0.5">{isRedTower ? '🔥' : '🛡️'}</div>
                  <div className="text-white font-black text-[10px] md:text-xs drop-shadow-md">{tower.val}</div>
                  
                  {isViolator && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: -25 }}
                      className="absolute text-xl"
                    >
                      ⚠️
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* --- MODALS --- */}
        <AnimatePresence>
          {gameState === 'MENU' && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm px-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white/95 p-8 md:p-10 rounded-[40px] border-b-8 border-r-8 border-blue-900 text-center shadow-2xl max-w-md w-full flex flex-col items-center"
              >
                <div className="bg-yellow-400 p-4 rounded-full mb-6 shadow-lg">
                   <Castle size={50} color="#000" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-blue-900 mb-2 tracking-tight">RED-BLACK<br/>REALM</h1>
                <p className="text-gray-500 mb-8 font-medium">Build the castle. Balance the magic.</p>
                <div className="flex flex-col gap-3 w-full">
                  <MilitaryBtn onClick={startCampaign} label="START CAMPAIGN" color={GREEN} icon={Sword} size="lg" />
                  <MilitaryBtn onClick={() => setShowTactics(true)} label="TUTORIAL" color={BLUE} icon={Map} variant="outline" />
                </div>
              </motion.div>
            </div>
          )}

          {gameState === 'LEVEL_COMPLETE' && (
            <div className="absolute inset-0 z-40 flex items-end justify-center pb-20 pointer-events-none">
              <motion.div 
                initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="pointer-events-auto bg-white p-6 rounded-2xl border-4 border-green-500 shadow-2xl flex flex-col items-center gap-4"
              >
                <div className="flex items-center gap-3 text-green-700">
                  <CheckCircle2 size={32} />
                  <span className="text-xl font-black uppercase">Sector Secured</span>
                </div>
                <p className="text-gray-500 text-sm">Structure stable. Ready for next tower.</p>
                <MilitaryBtn onClick={proceedToNextMission} label="NEXT MISSION" color={GREEN} icon={ChevronRight} />
              </motion.div>
            </div>
          )}

          {gameState === 'VICTORY' && (
            <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-md px-4">
              <div className="bg-gradient-to-b from-yellow-100 to-white p-10 rounded-[3rem] border-8 border-yellow-400 text-center shadow-2xl max-w-lg w-full flex flex-col items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-yellow-400/10 z-0 opacity-50"></div>
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="relative z-10 mb-6"
                >
                  <Crown size={80} color={GOLD} strokeWidth={1.5} fill="#fff" />
                </motion.div>
                <h1 className="relative z-10 text-4xl font-black text-blue-900 mb-4 tracking-tighter">VICTORY!</h1>
                <p className="relative z-10 text-gray-600 mb-8 text-lg">The Realm is perfectly balanced.</p>
                <div className="relative z-10 flex gap-4">
                  <div className="bg-blue-900 text-yellow-300 px-6 py-3 rounded-xl font-bold border-2 border-yellow-400">
                    SCORE: {score}
                  </div>
                </div>
                <div className="mt-8 relative z-10">
                   <MilitaryBtn onClick={startCampaign} label="PLAY AGAIN" color={GREEN} icon={RefreshCw} size="lg" />
                </div>
              </div>
            </div>
          )}

           {gameState === 'SIEGE_LOST' && (
            <div className="fixed inset-0 bg-red-900/60 z-[200] flex items-center justify-center backdrop-blur-md px-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-8 rounded-3xl border-4 border-red-500 shadow-2xl text-center max-w-sm"
              >
                <AlertTriangle size={60} className="text-red-500 mx-auto mb-4" />
                <h2 className="text-3xl font-black text-gray-900 mb-2">SIEGE LOST</h2>
                <p className="text-gray-500 mb-6">The magic became unstable.</p>
                <MilitaryBtn onClick={startCampaign} label="RETRY" color={RED} icon={RefreshCw} />
              </motion.div>
            </div>
          )}

          {/* --- TACTICS MANUAL (TUTORIAL) --- */}
          {showTactics && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] backdrop-blur-sm px-4"
            >
              <div className="bg-gray-100 w-full max-w-2xl rounded-3xl border-4 border-blue-500 shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
                
                {/* Modal Header */}
                <div className="bg-white p-4 border-b border-gray-300 flex justify-between items-center shrink-0">
                  <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
                    <Map size={24} className="text-blue-600" />
                    ROYAL ARCHITECT MANUAL
                  </h2>
                  <button 
                    onClick={() => setShowTactics(false)} 
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors"
                  >
                    <XCircle size={28} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {CASTLE_LAWS.map((law, i) => (
                      <div key={i} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-2">
                        <div className="flex items-center gap-2 font-bold" style={{ color: law.color }}>
                          <law.icon size={20} /> {law.title}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{law.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-100 p-5 rounded-xl text-blue-900 text-sm">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                      <Target size={18} /> How to Fix Violations
                    </h3>
                    <p className="mb-2">When a red tower sits on another red tower:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 bg-white/50 p-2 rounded-lg">
                        <span className="font-bold text-blue-600">1. Look at the Uncle:</span> 
                        The sibling of the parent tower.
                      </li>
                      <li className="flex items-start gap-2 bg-white/50 p-2 rounded-lg">
                        <span className="font-bold text-red-500">Uncle is RED?</span> 
                        Use the <strong className="text-orange-600">RECOLOR</strong> button.
                      </li>
                      <li className="flex items-start gap-2 bg-white/50 p-2 rounded-lg">
                        <span className="font-bold text-gray-800">Uncle is BLACK (or missing)?</span> 
                        Use the <strong className="text-purple-600">REALIGN</strong> button to rotate.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-center shrink-0">
                   <MilitaryBtn onClick={() => setShowTactics(false)} label="CLOSE MANUAL" color={BLUE} icon={CheckCircle2} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER CONTROLS & LOGS: REDUCED HEIGHT to 100px */}
      <footer className="h-[100px] w-full bg-slate-50 border-t-2 border-slate-200 flex flex-col relative z-40 shadow-xl">
        {/* LOG PANEL: SMALLER */}
        <div className="flex-1 px-4 py-1 overflow-y-auto log-scroll flex flex-col gap-0.5 bg-white/50">
           {logs.length === 0 && (
             <div className="text-slate-400 text-[10px] italic flex items-center gap-2 mt-1">
               <ScrollText size={12} /> Systems online.
             </div>
           )}
           {logs.map((log) => (
             <div key={log.id} className={`text-[10px] font-semibold flex items-start gap-2 ${
               log.type === 'danger' ? 'text-red-600' : 
               log.type === 'success' ? 'text-green-600' : 
               log.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
             }`}>
               <span className="mt-0.5 opacity-50 text-[8px]">➤</span>
               {log.text}
             </div>
           ))}
        </div>

        {/* BUTTONS: COMPACT BAR */}
        <div className="h-[50px] flex items-center justify-center gap-4 bg-white border-t border-slate-200">
          <MilitaryBtn 
            label="RECOLOR" 
            color="#e67e22" 
            icon={RefreshCw}
            disabled={gameState !== 'PUZZLE'}
            onClick={() => handleCommanderOrder('RECOLOR_TOWERS')}
            size="sm"
          />
          <MilitaryBtn 
            label="REALIGN" 
            color="#9b59b6" 
            icon={Target}
            disabled={gameState !== 'PUZZLE'}
            onClick={() => handleCommanderOrder('REALIGN_WALLS')}
            size="sm"
          />
        </div>
      </footer>
    </div>
  );
}