import React, { useEffect, useState } from "react";
import { startLevel, clickBox } from "../services/searchApi";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, ArrowRight, ArrowLeft, Unlock, AlertTriangle, 
  RefreshCw, BookOpen, Star, Target, Lightbulb, Zap
} from "lucide-react";
import "../styles/search-game.css";

const MAX_LEVELS = 2;

export default function SearchGame() {
    const [level, setLevel] = useState(1);
    const [state, setState] = useState(null);
    const [uiState, setUiState] = useState("intro");
    const [showTheory, setShowTheory] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [hintUsed, setHintUsed] = useState(false);
    const [highlightedBox, setHighlightedBox] = useState(null);
    const [shakeBox, setShakeBox] = useState(null);

    useEffect(() => {
        if (uiState === "intro" || uiState === "grand_winner") return;
        initLevel();
    }, [level, uiState]);

    const initLevel = () => {
        setLoading(true);
        setHintUsed(false);
        setHighlightedBox(null);
        setShakeBox(null);

        startLevel(level)
            .then(data => {
                setState(data);
                setLoading(false);
            })
            .catch(err => console.error("API Error:", err));
    };

    const getCorrectMove = () => {
        if (!state) return -1;
        if (level === 1) return state.currentIndex;
        if (level === 2) return Math.floor((state.low + state.high) / 2);
        return -1;
    };

    const handleBoxClick = (index) => {
        if (uiState !== "playing" || loading) return;
        
        const correctIndex = getCorrectMove();

        if (index !== correctIndex) {
            triggerShake(index);
            return; 
        }

        clickBox(index).then(newData => {
            setState(newData);
            setHighlightedBox(null); 
            
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
        setHighlightedBox(correctIndex);
        setHintUsed(true);

        setTimeout(() => {
            setHighlightedBox(null);
        }, 3000);
    };
    
    const currentInfo = level === 1 
        ? { title: "Linear Search", desc: "The data is messy. You must check sequentially.", rule: "Find the Target." }
        : { title: "Binary Search", desc: "The data is sorted. Cut the problem in half.", rule: "Find the Target." };

    if (uiState === "grand_winner") {
        return (
            <div className="search-app-bg">
                <Confetti recycle={true} numberOfPieces={500} colors={['#00d2ff', '#ffd700', '#ffffff']} />
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="game-card glass-panel victory-card">
                    <Trophy size={80} color="#ffd700" className="icon-bounce" />
                    <h1 className="neon-text-gold">Grand Champion</h1>
                    <p className="subtitle">You have mastered the art of Search Algorithms.</p>
                    <div className="level-grid">
                        {[1, 2].map((lvl) => (
                            <button key={lvl} className="btn-glass level-select-btn" onClick={() => { setLevel(lvl); setUiState("intro"); }}>
                                <Star size={18} fill={lvl === 2 ? "#00d2ff" : "white"} /> <span>Level {lvl}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!state && uiState === "playing") return <div className="search-app-bg"><div className="loader"></div></div>;

    return (
        <div className="search-app-bg">
            <div className="game-interface glass-panel">
                
                {/* HUD */}
                <div className="hud-header">
                    <div className="hud-section left">
                        <span className="hud-label">TARGET SIGNAL</span>
                        <div className="hud-value target-glow">
                            <Target size={20} /> {state ? state.target : "--"}
                        </div>
                    </div>
                    
                    <div className="hud-section center">
                        <h2 className="level-title">{currentInfo.title}</h2>
                        <div className="feedback-line">
                           {shakeBox !== null ? 
                             <span className="danger-text"><AlertTriangle size={14}/> Invalid Algorithm Move</span> : 
                             (level === 2 && state ? `Search Range: [${state.low} - ${state.high}]` : "System Active")}
                        </div>
                    </div>

                    <div className="hud-section right">
                        <div className="controls-row">
                            {/* HINT BUTTON */}
                            <button 
                                className={`icon-btn-glass ${hintUsed ? 'disabled' : 'hint-btn'}`} 
                                onClick={useHint} 
                                title="Use Hint (1 per game)"
                                disabled={hintUsed}
                            >
                                <Lightbulb size={20} className={hintUsed ? "" : "icon-pulse"} />
                            </button>
                            
                            <button className="icon-btn-glass" onClick={() => setShowTheory(true)}><BookOpen size={20} /></button>
                        </div>
                        <div className="move-counter">
                            <span className="hud-label">MOVES</span>
                            <div className="hud-value">{state ? state.moves : 0}</div>
                        </div>
                    </div>
                </div>

                {/* GRID */}
                <div className="vault-grid">
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
                        <div className="theory-illustration">
                            <Zap size={64} className="icon-pulse" color="#00d2ff" />
                        </div>
                        <p className="theory-desc">{currentInfo.desc}</p>
                        <div className="theory-rule-box"><strong>OBJECTIVE:</strong> {currentInfo.rule}</div>
                        <button className="btn-glass primary" onClick={() => { setUiState("playing"); setShowTheory(false); }}>
                            {uiState === "intro" ? "INITIALIZE" : "RESUME"} <ArrowRight size={18} />
                        </button>
                    </Modal>
                )}

                {uiState === "won" && (
                    <Modal title="SECTOR CLEARED">
                        <Unlock size={60} color="#00ff88" className="icon-bounce" />
                        <p className="modal-text">Target found in {state.moves} moves.</p>
                        <button className="btn-glass primary" onClick={() => { setLevel(2); setUiState("intro"); }}>
                            NEXT SECTOR <ArrowRight size={18} />
                        </button>
                    </Modal>
                )}

                {uiState === "lost" && (
                    <Modal title="SYSTEM LOCKDOWN">
                        <AlertTriangle size={60} color="#ff4757" />
                        <p className="modal-text danger-text">Move limit exceeded.</p>
                        <button className="btn-glass danger" onClick={() => setUiState("intro")}>RETRY <RefreshCw size={18} /></button>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
}

function Box({ data, onClick, index, isHinted, isShaking }) {
    let statusClass = "box-closed";
    if (data.status === "open") statusClass = "box-open";
    if (data.status === "found") statusClass = "box-found";
    if (data.status === "eliminated") statusClass = "box-eliminated";
    
    const hintClass = isHinted ? "box-hint-active" : "";
    const shakeClass = isShaking ? "box-shake" : "";

    return (
        <motion.div 
            className={`vault-box ${statusClass} ${hintClass} ${shakeClass}`}
            onClick={onClick}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.03 }}
            whileHover={data.status === "closed" ? { translateY: -5, boxShadow: "0 0 25px rgba(0, 210, 255, 0.5)" } : {}}
        >
            <div className="box-inner">
                <div className="box-face box-front">
                    {data.status === "eliminated" ? <span className="eliminated-x">✕</span> : (
                        <span className="box-id">#{index + 1}</span>
                    )}
                </div>
                <div className="box-face box-back">{data.value}</div>
            </div>
        </motion.div>
    );
}

function Modal({ title, children, onClose }) {
    return (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-glass" initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}>
                {onClose && <div className="modal-close-btn" onClick={onClose}>✕</div>}
                <div className="modal-header"><h3>{title}</h3></div>
                <div className="modal-body">{children}</div>
            </motion.div>
        </motion.div>
    );
}