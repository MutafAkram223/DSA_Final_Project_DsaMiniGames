import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Castle, Sword, Shield, RefreshCw, Zap, 
  Crown, Flag, AlertTriangle, CheckCircle2, 
  Map, Target, TowerControl
} from 'lucide-react';
import { RedBlackTree, COLORS } from '../services/RedBlackGame';

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
      flex items-center justify-center gap-2 font-extrabold rounded-xl transition-all
      ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-600' : 'cursor-pointer'}
      ${size === 'lg' ? 'px-8 py-4 text-xl' : 'px-6 py-3 text-base'}
    `}
    style={{
      backgroundColor: disabled ? undefined : (variant === 'outline' ? 'transparent' : color),
      border: `3px solid ${color}`,
      color: variant === 'outline' ? color : 'white',
      boxShadow: disabled ? 'none' : `0 6px 0 ${color}40, inset 0 1px 0 rgba(255,255,255,0.3)`
    }}
  >
    {Icon && <Icon size={size === 'lg' ? 26 : 20} strokeWidth={2.5} />}
    <span>{label}</span>
  </motion.button>
);

export default function CastleRealmDefender() {
  // --- STATE ---
  const [towers, setTowers] = useState([]);
  const [gameState, setGameState] = useState('MENU'); // MENU, PLAYING, PUZZLE, VICTORY, SIEGE_LOST
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [integrity, setIntegrity] = useState(100);
  const [message, setMessage] = useState({ text: "Commander! The realm awaits your strategy.", type: 'neutral' });
  const [activeTower, setActiveTower] = useState(null);
  const [showTactics, setShowTactics] = useState(false);
  const [enemies, setEnemies] = useState([]);
  const [currentMission, setCurrentMission] = useState(null);
  
  // Refs & Sets
  const treeRef = useRef(new RedBlackTree());
  const [usedValues, setUsedValues] = useState(new Set());

  // --- GAME LAWS ---
  const CASTLE_LAWS = [
    { title: "ROYAL LAW", desc: "The Central Keep must always be BLACK (Royal Guard).", color: BLACK, icon: Crown },
    { title: "MAGIC LAW", desc: "A RED Sorcerer Tower cannot neighbor another RED tower.", color: RED, icon: Zap },
    { title: "DEFENSE LAW", desc: "Every patrol route must have equal BLACK towers.", color: BLACK, icon: Shield },
    { title: "CONSTRUCTION LAW", desc: "New towers start as RED (Sorcerer's Magic).", color: RED, icon: TowerControl }
  ];

  // --- LOOPS & EFFECTS ---

  // 1. Integrity Drain (Puzzle Mode)
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

  // 2. Enemy Spawner
  useEffect(() => {
    if (gameState === 'PLAYING' || gameState === 'PUZZLE') {
      const enemyInterval = setInterval(() => {
        if (Math.random() > 0.7 && towers.length > 0) {
          const randomTower = towers[Math.floor(Math.random() * towers.length)];
          setEnemies(prev => [...prev, {
            id: Date.now(),
            targetX: randomTower.x,
            targetY: randomTower.y,
            progress: 0
          }]);
        }
      }, 3000);
      return () => clearInterval(enemyInterval);
    }
  }, [gameState, towers]);

  // 3. Enemy Movement
  useEffect(() => {
    if (enemies.length === 0) return;
    const moveInterval = setInterval(() => {
      setEnemies(prev => prev.map(enemy => ({
        ...enemy,
        progress: enemy.progress + 0.05
      })).filter(enemy => enemy.progress < 1));
    }, 100);
    return () => clearInterval(moveInterval);
  }, [enemies]);

  // --- GAMEPLAY LOGIC ---

  const generateRandomMission = (lvl) => {
    if (lvl > 6) return null;
    let val;
    // Generate unique random value
    do {
      val = Math.floor(Math.random() * 90) + 10;
    } while (usedValues.has(val));

    const missionNames = ["Iron Outpost", "Shadow Keep", "Dragon's Peak", "Frost Spire", "Ember Fort"];
    const name = `${missionNames[Math.floor(Math.random() * missionNames.length)]} #${lvl}`;

    return { name, val, task: `Construct Tower ${val}` };
  };

  const startCampaign = () => {
    treeRef.current = new RedBlackTree();
    setUsedValues(new Set());
    setTowers([]);
    setLevel(1);
    setScore(0);
    setIntegrity(100);
    setGameState('PLAYING');

    const firstMission = generateRandomMission(1);
    setCurrentMission(firstMission);
    buildTower(firstMission.val);
  };

  const buildTower = (val) => {
    // 1. Insert into Logic Tree
    const newNode = treeRef.current.insert(val);
    setUsedValues(prev => new Set(prev).add(val));
    updateVisuals();

    // 2. Check for Red-Red Violation
    if (newNode.parent && newNode.parent.color === COLORS.RED) {
      setGameState('PUZZLE');
      setActiveTower(newNode);
      setMessage({ text: "⚠️ VIOLATION: Double Red! Magic interference detected!", type: 'danger' });
    } else {
      // Root must always be black logic (simplified for game start)
      if (treeRef.current.root.color === COLORS.RED) {
        treeRef.current.root.color = COLORS.BLACK;
      }
      updateVisuals();
      completeLevel();
    }
  };

  const completeLevel = () => {
    setMessage({ text: "Sector Stabilized! Honor increased.", type: 'success' });
    setScore(s => s + Math.floor(integrity));
    setTimeout(() => {
      setGameState('VICTORY');
    }, 1000);
  };

  const proceedToNextMission = () => {
    if (level >= 6) {
      setGameState('MENU');
      return;
    }
    const nextLvl = level + 1;
    setLevel(nextLvl);
    setIntegrity(100);
    setGameState('PLAYING');

    const nextMission = generateRandomMission(nextLvl);
    setCurrentMission(nextMission);
    buildTower(nextMission.val);
  };

  const updateVisuals = () => {
    const data = treeRef.current.getVisualData();
    setTowers([...data]);
  };

  // --- PUZZLE LOGIC (Red-Black Tree Fixes) ---
  const handleCommanderOrder = (order) => {
    if (gameState !== 'PUZZLE' || !activeTower) return;

    const tree = treeRef.current;
    let k = activeTower;
    let p = k.parent;
    let g = p ? p.parent : null;

    if (!g) return; // Should not happen in puzzle mode usually

    let uncle = (g.left === p) ? g.right : g.left;
    let uncleIsRed = uncle && (uncle.color === COLORS.RED);
    let correctMove = false;

    if (order === 'RECOLOR_TOWERS') {
      if (uncleIsRed) {
        correctMove = true;
        p.color = COLORS.BLACK;
        uncle.color = COLORS.BLACK;
        g.color = COLORS.RED;
        
        if (g === tree.root) {
          g.color = COLORS.BLACK;
          finishPuzzleStep();
        } else if (g.parent && g.parent.color === COLORS.RED) {
          setActiveTower(g);
          updateVisuals();
          setMessage({ text: "Violation moved up! Stabilize the Grandparent!", type: 'danger' });
          return;
        } else {
          finishPuzzleStep();
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
          } else {
            tree.rotateRight(g);
            p.color = COLORS.BLACK;
          }
        } else {
          if (k === p.left) {
            tree.rotateRight(p);
            tree.rotateLeft(g);
            k.color = COLORS.BLACK;
          } else {
            tree.rotateLeft(p);
            p.color = COLORS.BLACK;
          }
        }
        g.color = COLORS.RED;
        finishPuzzleStep();
      }
    }

    if (correctMove) {
      updateVisuals();
    } else {
      setIntegrity(prev => Math.max(0, prev - 20));
      setMessage({ text: "WRONG TACTIC! The walls are crumbling!", type: 'danger' });
      shakeScreen();
    }
  };

  const finishPuzzleStep = () => {
    setActiveTower(null);
    treeRef.current.root.color = COLORS.BLACK;
    updateVisuals();
    completeLevel();
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
      
      {/* INTERNAL STYLES FOR CUSTOM ANIMATIONS */}
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
      `}</style>

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-grid-pattern z-0 pointer-events-none" />
      <div className="absolute top-2 w-full text-center text-yellow-300 text-xs font-bold tracking-[0.2em] opacity-60 z-10">
        ⚔️ CASTLE REALM DEFENDER ⚔️
      </div>

      {/* HEADER: WAR ROOM */}
      <header className="relative z-20 w-full px-10 pt-8 pb-4 flex flex-col items-center gap-4">
        {/* Badge */}
        <div className="flex items-center gap-2 bg-gradient-to-br from-gray-800 to-black px-6 py-2 rounded-full border-2 border-yellow-400 shadow-xl text-gray-200 text-sm font-black">
          <Crown size={20} color={GOLD} />
          <span>COMMANDER</span>
        </div>

        {/* Resources Panel */}
        <div className="w-full max-w-4xl bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-10 py-4 flex justify-between items-center shadow-lg">
          
          {/* Honor */}
          <div className="flex items-center gap-4 text-white min-w-[120px]">
            <Flag className="text-green-400 fill-current" />
            <div>
              <div className="text-[10px] uppercase opacity-70 font-bold tracking-wider">Honor</div>
              <div className="text-2xl font-black text-yellow-300">{score}</div>
            </div>
          </div>

          {/* Battle Info */}
          <div className="text-center text-white">
            <div className="text-[10px] uppercase opacity-70 tracking-widest">Battle Status</div>
            <div className="text-xl font-black drop-shadow-md">{currentMission?.name || "Awaiting Orders"}</div>
          </div>

          {/* Integrity */}
          <div className="flex items-center gap-4 text-white min-w-[120px] justify-end">
            <Shield className={`${integrity < 30 ? 'text-red-500' : 'text-green-500'} fill-current`} />
            <div>
              <div className="text-[10px] uppercase opacity-70 font-bold tracking-wider">Integrity</div>
              <div className="text-2xl font-black text-yellow-300">{Math.floor(integrity)}%</div>
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
              absolute top-4 left-1/2 -translate-x-1/2 px-8 py-3 rounded-xl font-bold text-sm shadow-2xl
              flex items-center gap-3 backdrop-blur-md border-2 z-50 whitespace-nowrap
              ${message.type === 'danger' ? 'bg-red-500/20 border-red-500 text-red-100' : 
                message.type === 'success' ? 'bg-green-500/20 border-green-500 text-green-100' : 
                'bg-white/90 border-blue-500 text-gray-900'}
            `}
          >
            {message.type === 'danger' && <AlertTriangle size={18} />}
            {message.type === 'success' && <CheckCircle2 size={18} />}
            <span>{message.text}</span>
          </motion.div>
        </AnimatePresence>

        {/* CASTLE GROUNDS (Tree Visualization) */}
        <div className="relative w-full h-full">
          
          {/* Enemies */}
          {enemies.map(enemy => (
            <motion.div
              key={enemy.id}
              className="absolute text-2xl z-20 pointer-events-none drop-shadow-md"
              style={{
                left: `calc(50% + ${enemy.targetX * enemy.progress}px)`,
                top: `${enemy.targetY * enemy.progress}px`,
                opacity: 1 - enemy.progress
              }}
            >
              ⚔️
            </motion.div>
          ))}

          {/* Towers */}
          <AnimatePresence>
            {towers.map((tower) => {
              const isRedTower = tower.color === RED || tower.color === COLORS.RED;
              const isViolator = activeTower && activeTower.val === tower.val;

              return (
                <motion.div
                  key={tower.id}
                  initial={{ scale: 0, y: -20 }}
                  animate={{ 
                    scale: isViolator ? [1, 1.1, 1] : 1, 
                    y: tower.y // Adjusted in CSS using 'bottom' usually, but here strictly controlling Y relative to container top
                  }}
                  transition={{ 
                    scale: isViolator ? { repeat: Infinity, duration: 0.8 } : { type: "spring", stiffness: 200 },
                    y: { type: "spring", stiffness: 200 }
                  }}
                  className={`
                    absolute w-[70px] h-[75px] rounded-t-2xl border-[3px] border-b-0
                    flex flex-col justify-end items-center pb-2 z-30
                    ${isViolator ? 'z-40 ring-4 ring-yellow-400 ring-offset-2 ring-offset-transparent' : ''}
                  `}
                  style={{
                    left: `calc(50% + ${tower.x}px - 35px)`, // Center anchor
                    top: '100px', // Base offset
                    background: isRedTower 
                      ? 'linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)' 
                      : 'linear-gradient(135deg, #2d3436 0%, #000000 100%)',
                    borderColor: isRedTower ? '#c0392b' : '#000',
                    boxShadow: `0 10px 0 ${isRedTower ? '#c0392b' : '#000'}, 0 0 20px ${isRedTower ? '#ff475755' : '#00000055'}`
                  }}
                >
                  <div className="text-lg mb-0.5">{isRedTower ? '🔥' : '🛡️'}</div>
                  <div className="text-white font-black text-sm drop-shadow-md">{tower.val}</div>
                  <div className="text-[8px] text-white/80 tracking-widest mt-1">
                    {isRedTower ? 'SORCERER' : 'KNIGHT'}
                  </div>

                  {isViolator && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="absolute -top-8 text-2xl"
                    >
                      ⚠️
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* MODALS */}
        <AnimatePresence>
          
          {/* TACTICS MANUAL */}
          {showTactics && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]"
            >
              <motion.div 
                initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                className="bg-gray-100 w-[90%] max-w-2xl p-8 rounded-3xl border-4 border-yellow-400 shadow-2xl flex flex-col gap-6"
              >
                <div className="flex justify-between items-center border-b-2 border-blue-500/20 pb-4">
                  <h2 className="text-2xl font-black text-gray-900">WAR COUNCIL</h2>
                  <button onClick={() => setShowTactics(false)} className="text-2xl text-gray-500 hover:text-red-500">✕</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CASTLE_LAWS.map((law, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border shadow-sm">
                      <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: law.color }}>
                        <law.icon size={16} /> {law.title}
                      </h3>
                      <p className="text-gray-800 text-sm leading-relaxed">{law.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="self-center">
                  <MilitaryBtn onClick={() => setShowTactics(false)} label="RETURN" color={BLUE} icon={Sword} />
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* MAIN MENU */}
          {gameState === 'MENU' && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white/95 p-12 rounded-[40px] border-[6px] border-yellow-400 text-center shadow-2xl max-w-md w-full flex flex-col items-center">
                <Castle size={80} color={GOLD} className="mb-4 drop-shadow-lg" />
                <h1 className="text-4xl font-black text-blue-900 mb-8 leading-tight">CASTLE REALM<br/>DEFENDER</h1>
                <div className="flex gap-4">
                  <MilitaryBtn onClick={() => setShowTactics(true)} label="MANUAL" color={BLUE} icon={Map} variant="outline" />
                  <MilitaryBtn onClick={startCampaign} label="CAMPAIGN" color={GREEN} icon={Sword} />
                </div>
              </div>
            </div>
          )}

          {/* GAME OVER */}
          {gameState === 'SIEGE_LOST' && (
            <div className="fixed inset-0 bg-red-900/40 z-[200] flex items-center justify-center backdrop-blur-md">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white max-w-md w-full rounded-2xl overflow-hidden border-2 border-red-500 shadow-2xl"
              >
                <div className="bg-red-50 p-8 text-center flex flex-col items-center gap-2 border-b border-red-100">
                  <AlertTriangle size={50} color={RED} />
                  <h1 className="text-3xl font-black text-red-500">SIEGE LOST</h1>
                </div>
                <div className="p-8 text-center text-gray-600">
                  <p className="mb-6">The castle walls have crumbled under the arcane pressure. Your strategy was not completed in time.</p>
                  <div className="flex justify-center">
                    <MilitaryBtn onClick={startCampaign} label="RETRY" color={RED} icon={RefreshCw} />
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* VICTORY */}
          {gameState === 'VICTORY' && (
            <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
              <div className="bg-gradient-to-br from-white to-yellow-50 p-10 rounded-[40px] border-[6px] border-yellow-400 text-center max-w-lg w-full flex flex-col items-center shadow-2xl">
                <Crown size={80} color={GOLD} className="mb-6 drop-shadow-md" />
                <h1 className="text-4xl font-black text-blue-900 mb-2">VICTORY!</h1>
                <p className="text-lg text-gray-500 mb-8 font-medium">{currentMission?.name} is secure.</p>
                
                <div className="flex gap-4 mb-8">
                  <div className="bg-blue-900 text-yellow-300 px-6 py-3 rounded-xl font-bold">
                    HONOR: {score}
                  </div>
                  <div className="bg-blue-900 text-yellow-300 px-6 py-3 rounded-xl font-bold">
                    LEVEL: {level}/6
                  </div>
                </div>

                <MilitaryBtn 
                  onClick={proceedToNextMission} 
                  label={level >= 6 ? "CLAIM FINAL VICTORY" : `MARCH TO LEVEL ${level + 1}`} 
                  color={GREEN} 
                  icon={level >= 6 ? Crown : Sword} 
                  size="lg" 
                />
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER CONTROLS */}
      <footer className="h-[140px] bg-white w-full border-t-4 border-gray-800 flex flex-col items-center justify-center relative z-40">
        <div className="absolute -top-8 bg-gray-800 text-gray-400 px-4 py-1 rounded-t-lg text-[10px] font-black tracking-widest uppercase">
          Commander's Orders
        </div>
        
        <div className="flex gap-6 mb-3">
          <MilitaryBtn 
            label="RECOLOR" 
            color="#e67e22" 
            icon={RefreshCw}
            disabled={gameState !== 'PUZZLE'}
            onClick={() => handleCommanderOrder('RECOLOR_TOWERS')}
          />
          <MilitaryBtn 
            label="REALIGN" 
            color="#9b59b6" 
            icon={Target}
            disabled={gameState !== 'PUZZLE'}
            onClick={() => handleCommanderOrder('REALIGN_WALLS')}
          />
        </div>

        <div className="text-xs text-gray-500 italic font-medium">
          {gameState === 'PUZZLE' 
            ? "⚠️ DEFENSE BREACH! Issue orders to secure the castle!" 
            : "Awaiting strategic positioning..."
          }
        </div>
      </footer>
    </div>
  );
}