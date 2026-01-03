import { useEffect, useState } from "react";
import { startLevel, makeMove } from "../services/stackApi";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ArrowRight, ArrowLeft, Layers, Trophy, Star, BookOpen } from "lucide-react";
import "../styles/stack-game.css";

const blockPalette = {
    red: "#ff4757", blue: "#2e86de", green: "#2ecc71", yellow: "#f1c40f",
    purple: "#9b59b6", orange: "#e67e22", teal: "#1abc9c", pink: "#fd79a8",
    brown: "#8d6e63", default: "#636e72"
};

const MAX_LEVELS = 3;

function StackGame() {
    const [level, setLevel] = useState(1);
    const [state, setState] = useState(null);
    const [selectedStack, setSelectedStack] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [gameWon, setGameWon] = useState(false);
    
    // Feature: Show Theory Rule at start
    const [showTheory, setShowTheory] = useState(true);

    useEffect(() => {
        loadLevel(level);
    }, [level]);

    const loadLevel = (lvl) => {
        if (lvl > MAX_LEVELS) { setGameWon(true); return; }
        setLoading(true);
        setError(null);
        setGameWon(false);
        
        startLevel(lvl)
            .then(data => {
                setState(data);
                setSelectedStack(null);
                setLoading(false);
            })
            .catch(err => {
                setError("Level load failed. Is backend running?");
                setLoading(false);
            });
    };

    const handleNextLevel = () => {
        if (level < MAX_LEVELS) setLevel(level + 1);
        else setGameWon(true);
    };

    const handlePrevLevel = () => {
        if (level > 1) {
            setLevel(level - 1);
            setGameWon(false);
        }
    };

    const handleStackClick = (stackName) => {
        if (state?.isSolved || loading || gameWon) return;

        if (!selectedStack) {
            const stackItems = getItemsByStackName(stackName);
            if (stackItems && stackItems.length > 0) setSelectedStack(stackName);
            return;
        }

        if (selectedStack === stackName) {
            setSelectedStack(null);
            return;
        }

        handleMove(selectedStack, stackName);
    };

    const handleMove = (from, to) => {
        setLoading(true);
        makeMove(from, to)
            .then(data => {
                setState(data);
                setSelectedStack(null);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                setSelectedStack(null);
            });
    };

    const getItemsByStackName = (name) => {
        if (!state) return [];
        if (name === 'MAIN') return state.mainStack || state.MainStack;
        if (name === 'AUX_A') return state.auxA || state.AuxA;
        if (name === 'AUX_B') return state.auxB || state.AuxB;
        return [];
    };

    // --- RENDER: VICTORY SCREEN ---
    if (gameWon) {
        return (
            <div className="app-bg">
                <Confetti recycle={true} numberOfPieces={400} />
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="game-card glass victory-card">
                    <Trophy size={80} color="#f1c40f" />
                    <h1>Grand Champion!</h1>
                    <p>You have mastered the Stack Data Structure.</p>
                    <div className="level-grid">
                        {[...Array(MAX_LEVELS)].map((_, i) => (
                            <button key={i} className="btn level-select-btn" onClick={() => { setLevel(i + 1); setGameWon(false); }}>
                                <Star size={16} fill="white" /> Level {i + 1}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!state && !error) return <div className="app-bg"><div className="loader"></div></div>;
    if (error) return <div className="app-bg"><h2 style={{color:'white'}}>{error}</h2></div>;

    const isSolved = state?.isSolved || state?.IsSolved;

    return (
        <div className="app-bg">
            {/* --- THEORY MODAL (Pure Text) --- */}
            <AnimatePresence>
                {showTheory && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="modal-overlay"
                    >
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                            className="modal-card glass"
                        >
                            <div className="modal-header">
                                <BookOpen size={24} color="#a5b4fc" />
                                <h2>Stack Theory Rule</h2>
                            </div>
                            
                            <div className="theory-content">
                                <p>Welcome! In Computer Science, a Stack follows one strict rule:</p>
                                <div className="highlight-box">
                                    <strong>LIFO: Last-In, First-Out</strong>
                                </div>
                                <p>Think of it like a stack of plates:</p>
                                <ul>
                                    <li>⬇️ You can only add (PUSH) to the <strong>top</strong>.</li>
                                    <li>⬆️ You can only remove (POP) from the <strong>top</strong>.</li>
                                    <li>🚫 You cannot pull a block from the middle.</li>
                                </ul>
                            </div>
                            <button className="btn primary full-width" onClick={() => setShowTheory(false)}>
                                I Understand, Let's Play! <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {isSolved && <Confetti recycle={false} numberOfPieces={800} gravity={0.2} />}
            
            <div className="game-card glass">
                <div className="game-header">
                    <div className="title-area">
                        <Layers size={32} color="#a5b4fc" />
                        <h1>Stack Sort</h1>
                    </div>
                    <div className="meta-badges">
                        {level > 1 && (
                            <button className="icon-btn-small" onClick={handlePrevLevel} title="Previous Level">
                                <ArrowLeft size={16} />
                            </button>
                        )}
                        <span className="badge">Level {level} / {MAX_LEVELS}</span>
                        <span className="badge">Moves: {state?.moves || 0}</span>
                        
                        {/* Button to reopen rules if needed */}
                        <button className="icon-btn-small" onClick={() => setShowTheory(true)} title="View Rules">
                            <BookOpen size={16} />
                        </button>

                        {isSolved && <span className="badge success">Solved!</span>}
                    </div>
                </div>

                <div className="boards">
                    <StackView title="Main Stack" items={getItemsByStackName('MAIN')} isSelected={selectedStack === 'MAIN'} onClick={() => handleStackClick('MAIN')} />
                    <StackView title="Aux A" items={getItemsByStackName('AUX_A')} isSelected={selectedStack === 'AUX_A'} onClick={() => handleStackClick('AUX_A')} />
                    <StackView title="Aux B" items={getItemsByStackName('AUX_B')} isSelected={selectedStack === 'AUX_B'} onClick={() => handleStackClick('AUX_B')} />
                    <StackView title="Target" items={state?.target || []} isGhost={true} disabled={true} />
                </div>

                <div className="actions">
                    {isSolved ? (
                        <motion.button 
                            initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                            className="btn primary" 
                            onClick={handleNextLevel}
                        >
                             {level === MAX_LEVELS ? "Finish Game 🏆" : "Next Level"} <ArrowRight size={20} />
                        </motion.button>
                    ) : (
                        <div className="instruction-text">
                            {selectedStack ? "Select destination stack..." : "Select stack to pick up"}
                        </div>
                    )}
                    
                    {!isSolved && (
                         <button className="btn icon-only" onClick={() => loadLevel(level)}>
                            <RefreshCw size={20} />
                         </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function StackView({ title, items, isSelected, onClick, disabled, isGhost }) {
    const safeItems = items || [];
    return (
        <motion.div 
            className={`panel glass ${isSelected ? 'selected' : ''} ${!disabled ? 'interactive' : ''} ${isGhost ? 'target-panel' : ''}`}
            onClick={!disabled ? onClick : undefined}
            whileHover={!disabled ? { translateY: -5 } : {}}
        >
            <h3>{title}</h3>
            <div className={`stack-container ${isGhost ? 'ghost' : ''}`}>
                <AnimatePresence mode="popLayout">
                    {safeItems.map((colorName, index) => (
                        <motion.div
                            key={`${colorName}-${index}`}
                            layoutId={isGhost ? `ghost-${index}` : `block-${colorName}`} 
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className={`block ${isGhost ? 'ghost-block' : ''}`}
                            style={{ 
                                backgroundColor: isGhost ? 'transparent' : (blockPalette[colorName.toLowerCase()] || blockPalette.default),
                                borderColor: isGhost ? (blockPalette[colorName.toLowerCase()] || '#fff') : 'transparent'
                            }}
                        >
                            <span className="block-label">{colorName.toUpperCase()}</span>
                            {!isGhost && <div className="block-shine"></div>}
                        </motion.div>
                    ))}
                </AnimatePresence>
                {safeItems.length === 0 && !isGhost && <div className="empty-indicator">EMPTY</div>}
            </div>
        </motion.div>
    );
}

export default StackGame;