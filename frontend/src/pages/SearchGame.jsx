import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, ArrowRight, Unlock, AlertTriangle, 
  RefreshCw, BookOpen, Star, Target, Lightbulb, Zap 
} from "lucide-react";

/* =========================================
   API SERVICE (Connects to C# Backend)
   ========================================= */
const BASE_URL = "http://localhost:5000/api/search";

const searchApi = {
  startLevel: async (levelId) => {
    try {
      const response = await fetch(`${BASE_URL}/start/${levelId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Backend connection failed");
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      return null;
    }
  },

  clickBox: async (index) => {
    try {
      const response = await fetch(`${BASE_URL}/click/${index}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Backend connection failed");
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      return null;
    }
  }
};

/* =========================================
   MAIN COMPONENT
   ========================================= */
const MAX_LEVELS = 2;

export default function SearchGame() {
    // Game State
    const [level, setLevel] = useState(1);
    const [state, setState] = useState(null);
    const [uiState, setUiState] = useState("intro"); // intro, playing, won, lost, grand_winner
    const [showTheory, setShowTheory] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Interactions
    const [hintUsed, setHintUsed] = useState(false);
    const [highlightedBox, setHighlightedBox] = useState(null);
    const [shakeBox, setShakeBox] = useState(null);

    // Initialization
    useEffect(() => {
        if (uiState === "intro" || uiState === "grand_winner") return;
        initLevel();
    }, [level, uiState]);

    const initLevel = () => {
        setLoading(true);
        setHintUsed(false);
        setHighlightedBox(null);
        setShakeBox(null);

        searchApi.startLevel(level)
            .then(data => {
                if (data) {
                    setState(data);
                } else {
                    // Fallback if backend is down to prevent crash
                    alert("Could not connect to Game Server at " + BASE_URL);
                }
                setLoading(false);
            });
    };

    // Helper: Determine the "Optimal" move for validation & hints
    // Matches the logic in SearchGameService.cs (LinearStep / BinaryStep)
    const getCorrectMove = () => {
        if (!state) return -1;
        
        // Linear Search: Must click current index sequentially
        if (level === 1) {
            return state.currentIndex; 
        }
        
        // Binary Search: Must click the middle index
        if (level === 2) {
            return Math.floor((state.low + state.high) / 2);
        }
        return -1;
    };

    const handleBoxClick = (index) => {
        if (uiState !== "playing" || loading || !state) return;
        
        // Check if box is clickable (not eliminated or already open)
        // Note: Backend 'SearchBox' uses 'status', JSON will be 'status'
        const box = state.boxes[index];
        if (box.status === 'eliminated' || box.status === 'open' || box.status === 'found') return;

        const correctIndex = getCorrectMove();

        // UI Validation: Shake if user clicks wrong box (Client-side check)
        // This prevents wasting a backend call on an obviously invalid move
        if (index !== correctIndex) {
            triggerShake(index);
            return; 
        }

        // Send move to Backend
        searchApi.clickBox(index).then(newData => {
            if (!newData) return;

            setState(newData);
            setHighlightedBox(null); 
            
            // Check Win/Loss flags from C# Backend
            if (newData.isWon) {
                setTimeout(() => {
                    if (level === MAX_LEVELS) setUiState("grand_winner");
                    else setUiState("won");
                }, 600);
            } else if (newData.isLost) {
                setUiState("lost");
            }
        });
    };

    const triggerShake = (index) => {
        setShakeBox(index);
        setTimeout(() => setShakeBox(null), 500); 
    };

    const useHint = () => {
        if (hintUsed || uiState !== "playing") return;

        const correctIndex = getCorrectMove();
        if (correctIndex !== -1) {
            setHighlightedBox(correctIndex);
            setHintUsed(true);

            setTimeout(() => {
                setHighlightedBox(null);
            }, 3000);
        }
    };
    
    const currentInfo = level === 1 
        ? { title: "Linear Search", desc: "The data is messy. You must check sequentially.", rule: "Find the Target." }
        : { title: "Binary Search", desc: "The data is sorted. Cut the problem in half.", rule: "Find the Target." };

    /* --- RENDERING --- */
    
    if (uiState === "grand_winner") {
        return (
            <div className="min-h-screen w-full bg-[#0f1021] flex flex-col items-center justify-center relative overflow-hidden text-white font-sans">
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;700;900&display=swap');`}</style>
                <Confetti recycle={true} numberOfPieces={500} colors={['#00d2ff', '#ffd700', '#ffffff']} />
                
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    className="bg-[#141423]/80 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl flex flex-col items-center gap-6 max-w-lg text-center"
                >
                    <Trophy size={80} className="text-yellow-400 animate-bounce" />
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">
                        Grand Champion
                    </h1>
                    <p className="text-indigo-200 text-lg">You have mastered the art of Search Algorithms.</p>
                    
                    <div className="grid grid-cols-2 gap-4 w-full mt-4">
                        {[1, 2].map((lvl) => (
                            <button 
                                key={lvl} 
                                className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-cyan-400 hover:text-slate-900 border border-white/10 rounded-xl transition-all duration-300" 
                                onClick={() => { setLevel(lvl); setUiState("intro"); }}
                            >
                                <Star size={18} className={lvl === 2 ? "fill-cyan-400 text-cyan-400" : "fill-white text-white"} /> 
                                <span className="font-bold mt-2">Level {lvl}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!state && uiState === "playing") {
        return (
            <div className="min-h-screen w-full bg-[#0f1021] flex items-center justify-center">
                 <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#0f1021] bg-[radial-gradient(at_0%_0%,rgba(58,123,213,0.15)_0%,transparent_50%),radial-gradient(at_100%_100%,rgba(0,210,255,0.1)_0%,transparent_50%)] flex items-center justify-center text-white font-[Outfit] p-4">
            
            {/* Internal Styles for 3D Transforms */}
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .box-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
            `}</style>

            <div className="w-full max-w-6xl h-[90vh] bg-[#141423]/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col relative overflow-hidden">
                
                {/* HUD HEADER */}
                <div className="h-auto md:h-24 bg-black/20 border-b border-white/10 flex flex-col md:flex-row justify-between items-center p-6 gap-4">
                    
                    {/* Left: Target */}
                    <div className="flex flex-col justify-center min-w-[100px]">
                        <span className="text-xs font-bold tracking-widest text-cyan-400 opacity-80 mb-1">TARGET SIGNAL</span>
                        <div className="text-3xl font-bold flex items-center gap-2 text-emerald-400 drop-shadow-[0_0_10px_rgba(0,255,136,0.4)]">
                            <Target size={24} /> {state ? state.target : "--"}
                        </div>
                    </div>
                    
                    {/* Center: Title & Feedback */}
                    <div className="flex flex-col items-center flex-grow">
                        <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400">
                            {currentInfo.title}
                        </h2>
                        <div className="mt-2 text-sm text-indigo-300 flex items-center gap-2">
                           {shakeBox !== null ? 
                             <span className="text-rose-500 font-bold flex items-center gap-1"><AlertTriangle size={14}/> Invalid Algorithm Move</span> : 
                             (level === 2 && state ? `Search Range: [${state.low} - ${state.high}]` : "System Active")}
                        </div>
                    </div>

                    {/* Right: Controls & Score */}
                    <div className="flex items-end gap-6">
                        <div className="flex gap-2">
                            <button 
                                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300
                                    ${hintUsed 
                                        ? 'bg-white/5 border-white/10 text-slate-500 cursor-not-allowed' 
                                        : 'bg-white/5 border-white/10 text-indigo-300 hover:bg-cyan-400 hover:text-slate-900 hover:shadow-[0_0_15px_#00d2ff]'
                                    }`} 
                                onClick={useHint} 
                                title="Use Hint (1 per game)"
                                disabled={hintUsed}
                            >
                                <Lightbulb size={20} className={hintUsed ? "" : "animate-pulse"} />
                            </button>
                            
                            <button 
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-indigo-300 hover:bg-cyan-400 hover:text-slate-900 transition-all duration-300" 
                                onClick={() => setShowTheory(true)}
                            >
                                <BookOpen size={20} />
                            </button>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold tracking-widest text-cyan-400 opacity-80 mb-1">MOVES</span>
                            <div className="text-3xl font-bold">{state ? state.moves : 0}</div>
                        </div>
                    </div>
                </div>

                {/* GRID AREA */}
                <div className="flex-grow p-8 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 content-center">
                    <AnimatePresence>
                        {state && state.boxes.map((box, i) => (
                            <Box 
                                key={i} 
                                data={box} 
                                index={i}
                                isHinted={i === highlightedBox}
                                isShaking={i === shakeBox}
                                onClick={() => handleBoxClick(i)} 
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {(uiState === "intro" || showTheory) && (
                    <Modal title={currentInfo.title} onClose={uiState === "intro" ? null : () => setShowTheory(false)}>
                        <div className="mb-4 text-cyan-400 animate-pulse">
                            <Zap size={64} />
                        </div>
                        <p className="text-gray-300 text-center leading-relaxed text-lg mb-4">{currentInfo.desc}</p>
                        <div className="bg-white/5 border-l-4 border-cyan-400 p-4 rounded w-full text-left mb-6">
                            <strong className="text-white block mb-1">OBJECTIVE:</strong> 
                            <span className="text-indigo-200">{currentInfo.rule}</span>
                        </div>
                        <button 
                            className="w-full py-3 bg-cyan-400 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,210,255,0.3)]" 
                            onClick={() => { setUiState("playing"); setShowTheory(false); }}
                        >
                            {uiState === "intro" ? "INITIALIZE" : "RESUME"} <ArrowRight size={18} />
                        </button>
                    </Modal>
                )}

                {uiState === "won" && (
                    <Modal title="SECTOR CLEARED">
                        <Unlock size={60} className="text-emerald-400 animate-bounce mb-4" />
                        <p className="text-xl text-white mb-6">Target found in {state.moves} moves.</p>
                        <button 
                            className="w-full py-3 bg-cyan-400 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,210,255,0.3)]" 
                            onClick={() => { setLevel(2); setUiState("intro"); }}
                        >
                            NEXT SECTOR <ArrowRight size={18} />
                        </button>
                    </Modal>
                )}

                {uiState === "lost" && (
                    <Modal title="SYSTEM LOCKDOWN">
                        <AlertTriangle size={60} className="text-rose-500 mb-4" />
                        <p className="text-xl text-rose-400 mb-6 font-bold">Move limit exceeded.</p>
                        <button 
                            className="w-full py-3 bg-rose-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white hover:text-rose-600 hover:scale-105 transition-all" 
                            onClick={() => setUiState("intro")}
                        >
                            RETRY <RefreshCw size={18} />
                        </button>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
}

/* =========================================
   SUB-COMPONENTS
   ========================================= */

function Box({ data, onClick, index, isHinted, isShaking }) {
    // Determine visuals based on status
    const isOpen = data.status === "open" || data.status === "found";
    const isFound = data.status === "found";
    const isEliminated = data.status === "eliminated";
    
    // Classes
    const baseClasses = "h-28 w-full cursor-pointer perspective-1000 relative group";
    const shakeClass = isShaking ? "box-shake" : "";
    
    // Hint glow effect
    const hintStyle = isHinted ? "shadow-[0_0_30px_#00d2ff] scale-105 border-cyan-400" : "";

    return (
        <motion.div 
            className={`${baseClasses} ${shakeClass} ${isEliminated ? 'opacity-30 pointer-events-none scale-90 grayscale' : ''}`}
            onClick={onClick}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.03 }}
        >
            <div className={`w-full h-full relative transition-transform duration-500 transform-style-3d ${isOpen ? 'rotate-y-180' : ''}`}>
                
                {/* FRONT FACE (Closed) */}
                <div className={`absolute inset-0 backface-hidden rounded-xl border border-white/10 flex items-center justify-center font-bold text-2xl shadow-lg
                    ${isHinted ? 'bg-cyan-400/20 border-cyan-400' : 'bg-gradient-to-br from-white/10 to-white/5 text-cyan-400'}
                    ${!isEliminated && 'group-hover:-translate-y-2 group-hover:shadow-[0_0_25px_rgba(0,210,255,0.4)] transition-all'}
                `}>
                    {isEliminated ? <span className="text-3xl text-white/20">✕</span> : <span className="opacity-50 text-lg">#{index + 1}</span>}
                </div>

                {/* BACK FACE (Revealed) */}
                <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl border border-white/10 flex items-center justify-center font-bold text-3xl shadow-lg text-slate-900
                    ${isFound ? 'bg-emerald-400 shadow-[0_0_30px_#34d399]' : 'bg-cyan-400'}
                `}>
                    {data.value}
                </div>

            </div>
        </motion.div>
    );
}

function Modal({ title, children, onClose }) {
    return (
        <motion.div 
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#0f1021]/85 backdrop-blur-sm"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
        >
            <motion.div 
                className="w-[480px] bg-[#151628] border border-cyan-400 rounded-3xl shadow-[0_0_60px_rgba(0,210,255,0.15)] relative overflow-hidden"
                initial={{ scale: 0.8, y: 50 }} 
                animate={{ scale: 1, y: 0 }}
            >
                {onClose && (
                    <div className="absolute top-4 right-5 text-indigo-300 text-xl cursor-pointer hover:text-white z-10" onClick={onClose}>
                        ✕
                    </div>
                )}
                
                <div className="bg-cyan-400/10 p-5 text-center border-b border-cyan-400/20">
                    <h3 className="m-0 text-cyan-400 uppercase tracking-[3px] font-bold">{title}</h3>
                </div>
                
                <div className="p-10 flex flex-col items-center">
                    {children}
                </div>
            </motion.div>
        </motion.div>
    );
}