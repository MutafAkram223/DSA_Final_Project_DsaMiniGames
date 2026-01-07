import React, { useEffect, useState } from "react";
import { startLevel, makeMove } from "..//services/stackApi"; // Adjust path if needed
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ArrowRight, ArrowLeft, Play, Star, Trophy, AlertCircle } from "lucide-react";

// --- CONFIGURATION ---
const MAX_LEVELS = 3;

// Cartoon Palette
const blockPalette = {
    red: "#FF5252", 
    blue: "#448AFF", 
    green: "#69F0AE", 
    yellow: "#FFD740",
    purple: "#E040FB", 
    orange: "#FF6E40", 
    teal: "#64FFDA", 
    pink: "#FF80AB", 
    brown: "#8D6E63", 
    default: "#9E9E9E"
};

// Map Indices to Backend Names as required by StackGameService.cs
const STACK_NAMES = ["MAIN", "AUX_A", "AUX_B"];

function StackGame() {
    const [level, setLevel] = useState(1);
    const [state, setState] = useState(null);
    const [selectedStack, setSelectedStack] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [gameWon, setGameWon] = useState(false);

    // --- SETUP: Inject Styles & Fonts ---
    useEffect(() => {
        // Tailwind
        if (!document.querySelector('script[src="https://cdn.tailwindcss.com"]')) {
            const script = document.createElement('script');
            script.src = "https://cdn.tailwindcss.com";
            document.head.appendChild(script);
        }
        // Google Font: Fredoka (Round/Cartoonish)
        if (!document.querySelector('link[href*="Fredoka"]')) {
            const link = document.createElement('link');
            link.rel = "stylesheet";
            link.href = "https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;600;700&display=swap";
            document.head.appendChild(link);
        }
    }, []);

    // --- DATA TRANSFORMATION ---
    // Adapts C# StackGameState to Frontend format
    const transformState = (backendData) => {
        if (!backendData) return null;

        // Helper to add IDs for animation
        const toBlocks = (list, prefix) => 
            (list || []).map((color, idx) => ({ 
                id: `${prefix}-${idx}-${color}`, 
                color: color.toLowerCase() 
            }));

        return {
            moves: backendData.moves,
            // We map the 3 discrete backend stacks into an array for the UI loop
            stacks: [
                toBlocks(backendData.mainStack, 'm'),
                toBlocks(backendData.auxA, 'a'),
                toBlocks(backendData.auxB, 'b')
            ],
            // FIX: Target is now a SINGLE array, not an array of stacks
            targetState: toBlocks(backendData.target, 't'),
            isWon: backendData.isSolved
        };
    };

    // --- GAME LOGIC ---
    useEffect(() => {
        loadLevel(level);
    }, [level]);

    const loadLevel = async (lvl) => {
        setLoading(true);
        setError(null);
        setGameWon(false);
        setSelectedStack(null);
        try {
            // Calls backend /start/{id}
            const data = await startLevel(lvl);
            setState(transformState(data));
        } catch (err) {
            console.error(err);
            setError("Could not connect to Game Server.");
        } finally {
            setLoading(false);
        }
    };

    const handleStackClick = async (stackIndex) => {
        if (gameWon || !state) return;

        // Deselect if clicking same stack
        if (selectedStack === stackIndex) {
            setSelectedStack(null);
            return;
        }

        // Selection Phase
        if (selectedStack === null) {
            if (state.stacks[stackIndex].length > 0) {
                setSelectedStack(stackIndex);
            }
            return;
        }

        // Move Phase
        try {
            // Map indices 0,1,2 to "MAIN", "AUX_A", "AUX_B"
            const fromName = STACK_NAMES[selectedStack];
            const toName = STACK_NAMES[stackIndex];

            // Calls backend /move
            const rawData = await makeMove(fromName, toName);
            
            const newData = transformState(rawData);
            setState(newData);
            setSelectedStack(null);
            if (newData.isWon) setGameWon(true);
        } catch (err) {
            console.error("Move failed", err);
            setSelectedStack(null); 
        }
    };

    const nextLevel = () => { if (level < MAX_LEVELS) setLevel(l => l + 1); };
    const prevLevel = () => { if (level > 1) setLevel(l => l - 1); };

    // --- LOADING SCREEN ---
    if (loading || !state) return (
        <div className="h-screen w-full bg-[#FFEB3B] flex flex-col items-center justify-center font-['Fredoka']">
            <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-6xl mb-4"
            >
                🧩
            </motion.div>
            <p className="text-2xl font-bold text-black tracking-widest">LOADING WORLD...</p>
        </div>
    );

    return (
        <div className="min-h-screen w-full bg-[#4FC3F7] font-['Fredoka'] overflow-x-hidden relative flex flex-col items-center p-4">
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2px)', backgroundSize: '30px 30px' }}>
            </div>

            {gameWon && <Confetti recycle={false} numberOfPieces={1000} />}

            {/* --- HEADER --- */}
            <header className="w-full max-w-6xl flex flex-wrap gap-4 justify-between items-center mb-8 z-10">
                <div className="bg-white border-4 border-black px-6 py-3 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 transform -rotate-2">
                    <Trophy className="text-[#FFC107] w-8 h-8 fill-current" />
                    <div>
                        <h1 className="text-3xl font-bold text-black leading-none">STACKY<span className="text-[#FF5252]">BLOCKS</span></h1>
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Level {level}</span>
                    </div>
                </div>

                <div className="bg-white border-4 border-black px-6 py-3 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4 transform rotate-1">
                   <div className="text-right">
                        <div className="text-xs font-black text-gray-400 uppercase">MOVES</div>
                        <div className="text-3xl font-black text-black tabular-nums">{state.moves}</div>
                   </div>
                </div>
            </header>

            {/* --- ERROR MESSAGE --- */}
            {error && (
                <div className="mb-4 bg-[#FF5252] border-4 border-black text-white px-6 py-3 rounded-xl flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50">
                    <AlertCircle size={24} /> {error}
                </div>
            )}

            {/* --- MAIN GAME LAYOUT --- */}
            <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-8 z-10 flex-1 items-start">
                
                {/* LEFT: PLAYABLE AREA */}
                <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-10 flex flex-col shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)] relative">
                    
                    {/* Controls */}
                    <div className="flex justify-between items-center mb-10">
                         <button onClick={prevLevel} disabled={level === 1} className="w-12 h-12 rounded-xl bg-[#B0BEC5] border-4 border-black flex items-center justify-center disabled:opacity-50 hover:bg-[#CFD8DC] active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                             <ArrowLeft size={28} color="black" strokeWidth={3} />
                         </button>
                         
                         <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-wide px-4 py-2 rounded-lg transform ${gameWon ? "bg-[#69F0AE] -rotate-2" : "bg-[#FFD740] rotate-1"}`}>
                            {gameWon ? "LEVEL CLEAR!" : "SORT THE BLOCKS"}
                         </h2>
                         
                         <button onClick={nextLevel} disabled={level === MAX_LEVELS || !gameWon} className={`w-12 h-12 rounded-xl border-4 border-black flex items-center justify-center transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none ${gameWon ? 'bg-[#69F0AE] animate-bounce' : 'bg-[#B0BEC5] disabled:opacity-50'}`}>
                             <ArrowRight size={28} color="black" strokeWidth={3} />
                         </button>
                    </div>

                    {/* STACKS CONTAINER */}
                    <div className="flex-1 flex justify-center gap-4 md:gap-12 items-end min-h-[350px] pb-6 border-b-4 border-black/10">
                        {state.stacks.map((stack, i) => (
                            <StackColumn 
                                key={i} 
                                stack={stack} 
                                index={i} 
                                isSelected={selectedStack === i} 
                                onClick={() => handleStackClick(i)} 
                            />
                        ))}
                    </div>

                    <div className="text-center mt-6">
                        <p className="text-lg font-bold text-gray-500">
                            {gameWon ? "🎉 YOU DID IT!" : selectedStack !== null ? "👇 Select where to drop it!" : "👆 Pick a block to move"}
                        </p>
                    </div>
                </div>

                {/* RIGHT: TARGET SIDEBAR */}
                <div className="flex flex-col gap-6">
                    {/* Target Card */}
                    <div className="bg-[#FFF9C4] border-4 border-black rounded-3xl p-6 flex flex-col items-center relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        {/* Label Badge */}
                        <div className="absolute -top-5 bg-[#FF5252] text-white border-4 border-black px-4 py-1 rounded-full font-black tracking-widest transform rotate-2">
                            GOAL
                        </div>

                        <div className="mt-6 flex flex-col items-center w-full">
                            <p className="text-center font-bold text-black/60 text-sm mb-4">MATCH THIS ORDER</p>
                            
                            {/* FIX: Render SINGLE Target Stack */}
                            <div className="relative w-24 bg-black/5 border-b-4 border-black rounded-b-xl flex flex-col-reverse items-center p-2 min-h-[200px]">
                                {state.targetState.map((block, idx) => (
                                    <CartoonBlock key={idx} block={block} isMini={true} />
                                ))}
                            </div>
                            <div className="mt-2 font-bold text-xs text-black/40">MAIN STACK</div>
                        </div>
                    </div>

                    {/* Reset Button */}
                    <button 
                        onClick={() => loadLevel(level)} 
                        className="w-full py-4 rounded-2xl bg-[#FF5252] border-4 border-black text-white font-black text-xl tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-3"
                    >
                        <RefreshCw size={24} strokeWidth={3} /> 
                        RESTART
                    </button>
                </div>
            </main>
        </div>
    );
}

// --- CARTOON SUB-COMPONENTS ---

function StackColumn({ stack, index, isSelected, onClick }) {
    return (
        <div className="flex flex-col items-center justify-end h-full group relative z-0">
            {/* Selection Bouncer */}
            <motion.div 
                animate={isSelected ? { y: [0, -10, 0] } : { y: 0 }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className={`mb-2 text-[#FF5252] transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0'}`}
            >
                <div className="bg-black text-white font-bold px-2 py-1 rounded text-xs">PICKED!</div>
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-black mx-auto"></div>
            </motion.div>

            <motion.div 
                className={`
                    relative w-20 md:w-28 transition-all duration-200
                    bg-white border-x-4 border-b-4 border-black rounded-b-2xl
                    flex flex-col-reverse items-center p-2 cursor-pointer min-h-[250px]
                    ${isSelected ? 'bg-yellow-50 shadow-[0px_0px_0px_4px_#FFD740]' : 'hover:bg-gray-50'}
                `}
                onClick={onClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {/* Empty State */}
                {stack.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                        <div className="w-full h-full border-2 border-dashed border-black rounded-lg m-2"></div>
                    </div>
                )}

                <AnimatePresence mode="popLayout">
                    {stack.map((block) => (
                        <motion.div
                            key={block.id}
                            layoutId={`block-${block.id}`}
                            initial={{ opacity: 0, y: -200, scale: 0.5, rotate: 10 }}
                            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="w-full z-10"
                        >
                            <CartoonBlock block={block} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
            
            <div className="mt-3 bg-black text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                {index === 0 ? "Main" : index === 1 ? "Aux A" : "Aux B"}
            </div>
        </div>
    );
}

function CartoonBlock({ block, isMini = false }) {
    const colorHex = blockPalette[block.color] || blockPalette.default;
    
    return (
        <div 
            className={`
                relative rounded-lg mb-2 flex items-center justify-center border-4 border-black
                ${isMini ? 'h-8 w-full text-[8px] mb-1 border-2' : 'h-12 md:h-14 w-full text-xs'}
            `}
            style={{ backgroundColor: colorHex }}
        >
            {/* Gloss/Shine Effect for Plastic Look */}
            <div className="absolute top-1 right-1 w-2 h-2 bg-white/40 rounded-full" />
            <div className="absolute top-1 right-4 w-6 h-2 bg-white/40 rounded-full" />
            
            <span className="text-black/80 font-black tracking-wider uppercase">
                {block.color}
            </span>
        </div>
    );
}

export default StackGame;