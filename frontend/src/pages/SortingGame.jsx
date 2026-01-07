import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import { validateSort } from '../services/sortingApi'; // Kept commented out as in your flow

const LEVELS = {
  1: {
    name: "BUBBLE SORT",
    desc: "Push heavy blocks to the right!",
    rule: "Compare the two highlighted blocks.\n\nLeft > Right? → SWAP\nLeft ≤ Right? → KEEP",
    btnLeft: "SWAP 🔁",
    btnRight: "KEEP ✅"
  },
  2: {
    name: "INSERTION SORT",
    desc: "Slide the Key Block to its correct spot!",
    rule: "Compare the Key (Teal) with the Left.\n\nLeft > Key? → SHIFT\nLeft ≤ Key? → DROP",
    btnLeft: "SHIFT ⬅️",
    btnRight: "DROP ⬇️"
  }
};

const Mascot = ({ mood }) => {
  const isHappy = mood === 'happy';
  const isSad = mood === 'sad';

  return (
    <svg viewBox="0 0 100 100" className="w-20 h-20 drop-shadow-md transition-transform duration-300 hover:scale-110">
      <g transform="translate(0, 5)">
        <circle cx="50" cy="50" r="45" fill="#FF7675" stroke="#2D3436" strokeWidth="3" />
        <circle cx="35" cy="40" r="8" fill="white" stroke="#2D3436" strokeWidth="2" />
        <circle cx="65" cy="40" r="8" fill="white" stroke="#2D3436" strokeWidth="2" />
        <circle cx={isHappy ? 35 : 35} cy={isHappy ? 40 : 42} r="3" fill="#2D3436" />
        <circle cx={isHappy ? 65 : 65} cy={isHappy ? 40 : 42} r="3" fill="#2D3436" />
        {isHappy ? (
           <path d="M 35 60 Q 50 75 65 60" fill="none" stroke="#2D3436" strokeWidth="3" strokeLinecap="round" />
        ) : isSad ? (
           <path d="M 35 70 Q 50 55 65 70" fill="none" stroke="#2D3436" strokeWidth="3" strokeLinecap="round" />
        ) : (
           <line x1="40" y1="65" x2="60" y2="65" stroke="#2D3436" strokeWidth="3" strokeLinecap="round" />
        )}
      </g>
    </svg>
  );
};

export default function SortingGame() {
  const [view, setView] = useState('MENU');
  const [level, setLevel] = useState(1);
  const [blocks, setBlocks] = useState([]);
  const [activeIndices, setActiveIndices] = useState([]); 
  const [keyIndex, setKeyIndex] = useState(null); 
  const [sortedIndex, setSortedIndex] = useState(-1); 
  const [mascotMood, setMascotMood] = useState('neutral');
  const [apiResult, setApiResult] = useState(null);

  useEffect(() => {
    if (!document.querySelector('script[src="https://cdn.tailwindcss.com"]')) {
      const script = document.createElement('script');
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);

  const generateBlocks = (lvl) => {
    const count = 6;
    let arr = Array.from({ length: count }, () => Math.floor(Math.random() * 80) + 20);
    arr = [...new Set(arr)];
    while(arr.length < count) arr.push(Math.floor(Math.random() * 80) + 20);
    return arr.map(val => ({ val, id: Math.random() }));
  };

  const initLevel = (lvl) => {
    setLevel(lvl);
    setBlocks(generateBlocks(lvl));
    
    if (lvl === 1) {
        // Bubble Sort Setup
        setActiveIndices([0, 1]);
        setKeyIndex(null);
        setSortedIndex(-1);
    } else {
        // Insertion Sort Setup
        // Index 0 is considered "sorted" initially. We start with Index 1 as the Key.
        setActiveIndices([0, 1]); 
        setKeyIndex(1);
        setSortedIndex(0); 
    }

    setApiResult(null);
    setMascotMood('neutral');
    setView('TUTORIAL');
  };

  const startGame = () => {
    setView('GAME');
  };

  const handleDecision = (action) => {
    const [i, j] = activeIndices;
    // Guard clause
    if (i === undefined || j === undefined) return;

    let correctAction = "";
    
    if (level === 1) { 
       const a = blocks[i].val;
       const b = blocks[j].val;
       correctAction = (a > b) ? 'LEFT' : 'RIGHT'; 
    } else { 
       // INSERTION SORT LOGIC
       // Active Indices are [ComparisonItem, KeyItem]
       // i = index of left neighbor (Comparison)
       // j = index of Key (Teal block)
       
       const leftVal = blocks[i].val;
       const keyVal = blocks[j].val; // or blocks[keyIndex].val

       // If Left > Key, we must SHIFT (Swap them) to make room.
       // If Left <= Key, the Key is in the right place relative to this neighbor -> DROP.
       correctAction = (leftVal > keyVal) ? 'LEFT' : 'RIGHT'; 
    }

    if (action === correctAction) {
       setMascotMood('happy');
       setTimeout(() => setMascotMood('neutral'), 800);
       nextStep(action === 'LEFT'); // Pass true if swapped/shifted
    } else {
       setMascotMood('sad');
       setTimeout(() => setMascotMood('neutral'), 800);
    }
  };

  const nextStep = (swapped) => {
    let newBlocks = [...blocks];

    if (level === 1) { 
        // --- BUBBLE SORT LOGIC (UNTOUCHED) ---
        const [i, j] = activeIndices;
        if (swapped && newBlocks[i].val > newBlocks[j].val) {
             [newBlocks[i], newBlocks[j]] = [newBlocks[j], newBlocks[i]];
             setBlocks(newBlocks);
        }
        if (j + 1 < newBlocks.length - (sortedIndex + 1)) {
            setActiveIndices([i + 1, j + 1]);
        } else {
            setSortedIndex(prev => prev + 1); 
            setActiveIndices([0, 1]); 
        }
        if (sortedIndex >= newBlocks.length - 2) {
             finishLevel();
        }

    } else { 
        // --- INSERTION SORT LOGIC (IMPROVED) ---
        // activeIndices is [leftIdx, keyIdx]
        const [leftIdx, currentKeyIdx] = activeIndices;
        
        if (swapped) { 
             // SHIFT ACTION
             [newBlocks[leftIdx], newBlocks[currentKeyIdx]] = [newBlocks[currentKeyIdx], newBlocks[leftIdx]];
             setBlocks(newBlocks);
             
             // The Key is now at 'leftIdx'
             const newKeyPos = leftIdx;
             setKeyIndex(newKeyPos);

             // Can we move further left?
             if (newKeyPos > 0) {
                 // Update comparison window to [newKeyPos - 1, newKeyPos]
                 setActiveIndices([newKeyPos - 1, newKeyPos]);
             } else {
                 // We hit the start of the array (index 0).
                 // The key is now at the beginning. It is placed.
                 // Force advance to next key.
                 advanceInsertion();
             }
        } else { 
             // DROP ACTION
             // User decided the Key fits here (Left <= Key).
             // We stop processing this key and pick the next one.
             advanceInsertion();
        }
    }
  };

  const advanceInsertion = () => {
      // In Insertion Sort, 'sortedIndex' represents the end of the sorted portion.
      // We have just finished placing a key. The sorted portion grows by 1.
      const newSortedBoundary = sortedIndex + 1;
      setSortedIndex(newSortedBoundary);

      // The next key to process is the element immediately following the new sorted boundary.
      const nextKey = newSortedBoundary + 1;

      if (nextKey < blocks.length) {
          setKeyIndex(nextKey);
          // Initial comparison for new key is with its immediate left neighbor
          setActiveIndices([nextKey - 1, nextKey]);
      } else {
          // No more keys to process
          finishLevel();
      }
  };

  const finishLevel = async () => {
      // Mock API result
      setApiResult({ message: "Level Complete!" });
      setView('WIN');
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap');
          @keyframes popIn { 
            0% { transform: scale(0); opacity: 0; } 
            100% { transform: scale(1); opacity: 1; } 
          }
          .animate-popIn { animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        `}
      </style>

      <div 
        className="min-h-screen w-full flex flex-col items-center justify-center font-['Fredoka'] text-[#2d3436] p-4 overflow-hidden"
        style={{
          backgroundColor: '#6c5ce7',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 2px, transparent 2px)',
          backgroundSize: '40px 40px'
        }}
      >
        {/* --- MENU VIEW --- */}
        {view === 'MENU' && (
          <div className="flex flex-col items-center gap-8 animate-popIn">
            <h1 className="text-6xl font-black text-white drop-shadow-[4px_4px_0_rgba(0,0,0,0.2)] tracking-wider">
              SORT SQUAD
            </h1>
            <div className="flex gap-6">
              {[1, 2].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => initLevel(lvl)}
                  className="
                    w-[220px] bg-white border-[3px] border-[#2d3436] rounded-[20px] 
                    p-6 text-center shadow-[6px_6px_0_rgba(0,0,0,0.25)] 
                    hover:-translate-y-1 hover:bg-[#fffcf0] active:translate-y-[2px] active:shadow-none 
                    transition-all cursor-pointer
                  "
                >
                  <div className="text-4xl mb-3">{lvl === 1 ? '🛁' : '🃏'}</div>
                  <h2 className="text-2xl font-bold mb-2">{LEVELS[lvl].name}</h2>
                  <p className="text-sm text-[#636e72] leading-relaxed font-bold">{LEVELS[lvl].desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- GAME VIEW --- */}
        {view === 'GAME' && (
          <div className="w-full max-w-[900px] bg-white border-[3px] border-[#2d3436] rounded-[30px] shadow-[8px_8px_0_rgba(0,0,0,0.2)] p-6 relative">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b-[3px] border-dashed border-[#dfe6e9] pb-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setView('MENU')}
                  className="w-10 h-10 rounded-full border-[2px] border-[#2d3436] flex items-center justify-center bg-[#ffeaa7] hover:bg-[#ff7675] hover:text-white transition-colors"
                >
                  ✕
                </button>
                <h2 className="text-2xl font-bold text-[#6c5ce7]">{LEVELS[level].name}</h2>
              </div>
              <div className="bg-[#2d3436] text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide">
                LEVEL {level}
              </div>
            </div>

            {/* Mascot */}
            <div className="absolute top-[-50px] right-[40px] z-10">
              <Mascot mood={mascotMood} />
            </div>

            {/* Sorting Area */}
            <div className="h-[300px] flex items-end justify-center gap-2 mb-8 px-4 bg-[#f1f2f6] rounded-[20px] border-inner relative">
              <AnimatePresence>
                {blocks.map((block, index) => {
                  
                  const isActive = activeIndices.includes(index);
                  const isSortedBubble = level === 1 && index >= blocks.length - sortedIndex; 
                  
                  // For Insertion Sort: Items from 0 to sortedIndex are considered "Sorted"
                  // BUT, the current "Key" might be inside that range temporarily while shifting.
                  // We prioritize "isKey" styling.
                  const isSortedInsertion = level === 2 && index <= sortedIndex;
                  const isKey = level === 2 && index === keyIndex;

                  let bgColor = '#a29bfe'; // Default purple
                  
                  if (level === 1) {
                      if (isSortedBubble) bgColor = '#dfe6e9'; // Silver
                      if (isActive) bgColor = '#fdcb6e'; // Yellow/Orange
                  } else {
                      // Insertion Colors
                      if (isSortedInsertion) bgColor = '#dfe6e9'; // Silver (Sorted wall)
                      if (isActive && !isKey) bgColor = '#fdcb6e'; // Comparison Target (Yellow)
                      if (isKey) bgColor = '#00cec9'; // Key (Teal) - High Priority
                  }

                  return (
                    <motion.div
                      key={block.id}
                      layout
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="w-12 md:w-16 rounded-t-lg border-[3px] border-[#2d3436] border-b-0 flex flex-col items-center justify-end pb-2 shadow-sm relative overflow-hidden"
                      style={{ height: `${block.val * 3}px`, backgroundColor: bgColor }}
                    >
                      <span className="font-bold text-[#2d3436] bg-white/50 px-1 rounded text-sm z-10">{block.val}</span>
                      
                      {/* Face decoration */}
                      <div className="absolute top-2 w-full flex justify-center gap-1 opacity-50">
                          <div className="w-1.5 h-1.5 bg-[#2d3436] rounded-full"></div>
                          <div className="w-1.5 h-1.5 bg-[#2d3436] rounded-full"></div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex justify-center items-center gap-6">
              <button 
                onClick={() => handleDecision('LEFT')}
                className="bg-[#fdcb6e] text-[#2d3436] border-[3px] border-[#2d3436] px-8 py-4 rounded-[15px] text-xl font-bold shadow-[4px_4px_0_#2d3436] active:translate-y-[2px] active:shadow-none hover:brightness-110 transition-all"
              >
                {LEVELS[level].btnLeft}
              </button>
              
              <div className="w-12 h-12 rounded-full bg-[#2d3436] text-white flex items-center justify-center font-black text-xl border-[3px] border-white shadow-lg">
                VS
              </div>

              <button 
                onClick={() => handleDecision('RIGHT')}
                className="bg-[#00cec9] text-[#2d3436] border-[3px] border-[#2d3436] px-8 py-4 rounded-[15px] text-xl font-bold shadow-[4px_4px_0_#2d3436] active:translate-y-[2px] active:shadow-none hover:brightness-110 transition-all"
              >
                {LEVELS[level].btnRight}
              </button>
            </div>
          </div>
        )}

        {/* --- TUTORIAL MODAL --- */}
        {view === 'TUTORIAL' && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-white w-[500px] p-10 rounded-[30px] border-[4px] border-[#2d3436] text-center shadow-[0_20px_0_rgba(0,0,0,0.2)] animate-popIn">
              <h2 className="text-3xl font-black text-[#6c5ce7] mb-6 uppercase tracking-wide">HOW TO PLAY</h2>
              <div className="bg-[#dfe6e9] border-[2px] border-dashed border-[#2d3436] p-6 rounded-[15px] mb-8 text-left text-lg leading-relaxed whitespace-pre-wrap font-bold text-[#2d3436]">
                {LEVELS[level].rule}
              </div>
              <button 
                onClick={startGame}
                className="bg-[#ff7675] text-[#2d3436] border-[3px] border-[#2d3436] px-12 py-4 text-2xl font-black rounded-full shadow-[0_6px_0_#2d3436] hover:-translate-y-1 hover:shadow-[0_8px_0_#2d3436] active:translate-y-[2px] active:shadow-[0_2px_0_#2d3436] transition-all"
              >
                START GAME
              </button>
            </div>
          </div>
        )}

        {/* --- WIN MODAL --- */}
        {view === 'WIN' && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
             <div className="bg-white w-[500px] p-10 rounded-[30px] border-[4px] border-[#2d3436] text-center shadow-[0_20px_0_rgba(0,0,0,0.2)] animate-popIn">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-4xl font-black text-[#00cec9] mb-4">SORTED!</h2>
                <p className="text-xl font-bold text-[#636e72] mb-8">
                  {apiResult ? apiResult.message : "Level Complete!"}
                </p>
                <button 
                  onClick={() => setView('MENU')}
                  className="bg-[#fdcb6e] text-[#2d3436] border-[3px] border-[#2d3436] px-12 py-4 text-2xl font-black rounded-full shadow-[0_6px_0_#2d3436] hover:-translate-y-1 active:translate-y-[2px] active:shadow-none transition-all"
                >
                  MENU
                </button>
             </div>
          </div>
        )}
      </div>
    </>
  );
}