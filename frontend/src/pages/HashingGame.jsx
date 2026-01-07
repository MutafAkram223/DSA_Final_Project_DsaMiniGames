import React, { useState, useEffect, useCallback } from 'react';
import { validateHashMove } from '../services/hashingApi';

const LEVELS = {
  1: {
    title: "Direct Hashing",
    size: 5,
    target: 5, 
    mode: 'DIRECT',
    desc: "1 Guest per Room. No Collisions.",
    instr: "Welcome Manager! You have 5 Rooms and 5 Guests coming.\n\nAssign each guest to: (Guest #) % 5.\nThe hotel will be 100% full when you finish."
  },
  2: {
    title: "Linear Probing",
    size: 7,
    target: 7,
    mode: 'LINEAR',
    desc: "Wrap around if full.",
    instr: "We have 7 Rooms and 7 Guests.\n\nIf a room is taken, click the NEXT room (+1).\nIf Room 6 is full, wrap around to Room 0!"
  },
  3: {
    title: "Chaining",
    size: 5,
    target: 10,
    mode: 'CHAIN',
    desc: "Infinite Capacity (Stacks).",
    instr: "We installed Bunk Beds! Rooms can hold infinite guests.\n\nALWAYS put guests in their calculated room hash."
  },
  4: {
    title: "Rehashing",
    size: 4, 
    target: 15, 
    mode: 'REHASH',
    desc: "Expand when Load > 0.7",
    instr: "The hotel is small (4 rooms). When the LOAD FACTOR hits 0.7, the 'REHASH' button will flash.\n\nClick it to double the rooms and move guests!"
  }
};

function HashingGame() {
  const [view, setView] = useState('MENU');
  const [lvlId, setLvlId] = useState(1);
  const [showGuide, setShowGuide] = useState(false);

  const [rooms, setRooms] = useState({}); 
  const [tableSize, setTableSize] = useState(5);
  const [guest, setGuest] = useState(null);
  const [servedCount, setServedCount] = useState(0);
  
  const [shakeRoom, setShakeRoom] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isRehashing, setIsRehashing] = useState(false);
  const [rehashNeeded, setRehashNeeded] = useState(false);

  // --- 1. AUTO-INJECT TAILWIND FOR INSTANT STYLING ---
  useEffect(() => {
    const scriptId = 'tailwind-cdn-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);

  // --- LOGIC ---

  const getLoadFactor = (currentRooms, currentSize) => {
    let occupied = 0;
    Object.values(currentRooms).forEach(v => {
      if (Array.isArray(v)) occupied += v.length;
      else if (v !== undefined) occupied++;
    });
    return occupied / currentSize;
  };

  const generateGuest = (size, currentRooms, mode) => {
    let num;
    let safety = 0;
    
    if (mode === 'DIRECT') {
      do {
        num = Math.floor(Math.random() * 89) + 10;
        safety++;
      } while (currentRooms[num % size] !== undefined && safety < 100);
    } else {
      num = Math.floor(Math.random() * 89) + 10;
    }
    return num;
  };

  const startGame = (id) => {
    setLvlId(id);
    setTableSize(LEVELS[id].size);
    setRooms({});
    setServedCount(0);
    setGuest(null);
    setRehashNeeded(false);
    setIsRehashing(false);
    setView('GAME');
    setShowGuide(true);
  };

  const spawnNext = useCallback(() => {
    if (servedCount >= LEVELS[lvlId].target) {
      setView('WIN');
      return;
    }

    if (LEVELS[lvlId].mode === 'REHASH') {
      const lf = getLoadFactor(rooms, tableSize);
      if (lf >= 0.7) {
        setRehashNeeded(true); 
        return; 
      }
    }

    const nextG = generateGuest(tableSize, rooms, LEVELS[lvlId].mode);
    setGuest(nextG);
  }, [servedCount, lvlId, rooms, tableSize]);

  useEffect(() => {
    if (!isRehashing && !rehashNeeded && !guest && view === 'GAME' && !showGuide) {
      const timer = setTimeout(() => {
        spawnNext();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isRehashing, rehashNeeded, guest, view, showGuide, spawnNext]);

  const handleManualRehash = () => {
    setRehashNeeded(false); 
    setIsRehashing(true);   
    setGuest(null);        

    setTimeout(() => {
      const newSize = tableSize * 2;
      const newRooms = {};

      Object.values(rooms).forEach(val => {
        if (val === undefined) return;
        let idx = val % newSize;
        while (newRooms[idx] !== undefined) {
          idx = (idx + 1) % newSize;
        }
        newRooms[idx] = val;
      });

      setTableSize(newSize);
      setRooms(newRooms);
      setIsRehashing(false); 
    }, 2500);
  };

  const handleRoomClick = async (idx) => {
    if (!guest || isRehashing || rehashNeeded) return;

    const mode = LEVELS[lvlId].mode;

    try {
        const result = await validateHashMove(guest, tableSize, mode, idx, rooms);

        if (result.isCorrect) {
          const nextRooms = { ...rooms };
          
          if (mode === 'CHAIN') {
            if (!nextRooms[idx]) nextRooms[idx] = [];
            nextRooms[idx].push(guest);
          } else {
            nextRooms[idx] = guest;
          }
          
          setRooms(nextRooms);
          setServedCount(c => c + 1);
          setGuest(null);
          
          setTimeout(() => {
            if (mode === 'REHASH') {
               const lf = getLoadFactor(nextRooms, tableSize);
               if (lf >= 0.7) {
                 setRehashNeeded(true);
                 return; 
               }
            }
            if (servedCount + 1 >= LEVELS[lvlId].target) {
               setView('WIN');
            } else {
               const nextG = generateGuest(tableSize, nextRooms, mode);
               setGuest(nextG);
            }
          }, 400);

        } else {
          setShakeRoom(idx);
          setTimeout(() => setShakeRoom(null), 400);
          setFeedback(result.message || "Incorrect Move");
          setTimeout(() => setFeedback(null), 1500);
        }
    } catch (err) {
        console.error("Backend Error", err);
        setFeedback("Server Connection Error");
    }
  };

  const lf = getLoadFactor(rooms, tableSize);
  const lfPercent = Math.min(100, lf * 100);
  const lfColor = lf >= 0.7 ? '#ff7675' : '#4ECDC4';

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;600;700&family=Nunito:wght@400;700;900&display=swap');
          @keyframes pop { from {transform:scale(0);} to {transform:scale(1);} }
          @keyframes shake { 0%,100% {transform:translateX(0);} 25% {transform:translateX(-4px);} 75% {transform:translateX(4px);} }
          @keyframes floatUp { 0% {opacity:0; transform:translateY(10px);} 20% {opacity:1; transform:translateY(0);} 80% {opacity:1;} 100% {opacity:0; transform:translateY(-20px);} }
          .animate-pop { animation: pop 0.3s ease-out; }
          .animate-shake { animation: shake 0.4s ease-in-out; }
          .animate-floatUp { animation: floatUp 1.5s forwards; }
        `}
      </style>

      {/* --- MENU SCREEN --- */}
      {view === 'MENU' && (
        <div className="h-screen flex flex-col justify-center items-center bg-[radial-gradient(circle,#fff_0%,#dfe6e9_100%)] font-['Fredoka']">
          <h1 className="text-6xl mb-8 text-[#292F36] drop-shadow-[4px_4px_0_#4ECDC4]">HOTEL HASH</h1>
          <div className="flex gap-5 flex-wrap justify-center p-4">
            {[1, 2, 3, 4].map(l => (
              <div 
                key={l} 
                className="w-[220px] bg-white border-[3px] border-[#292F36] rounded-[15px] p-5 text-center shadow-[5px_5px_0_rgba(0,0,0,0.15)] cursor-pointer transition-transform hover:-translate-y-1 hover:bg-[#fffcf0]"
                onClick={() => startGame(l)}
              >
                <h3 className="text-xl font-bold mb-2">{LEVELS[l].title}</h3>
                <p className="text-sm text-[#666] font-['Nunito'] mb-3">{LEVELS[l].desc}</p>
                <div className="font-bold text-[#FF6B6B]">{LEVELS[l].target} Guests</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- WIN SCREEN --- */}
      {view === 'WIN' && (
        <div className="h-screen flex flex-col justify-center items-center bg-[radial-gradient(circle,#fff_0%,#dfe6e9_100%)] font-['Fredoka']">
          <h1 className="text-6xl mb-4 text-[#4ECDC4] drop-shadow-[2px_2px_0_#292F36]">HOTEL FULL!</h1>
          <p className="text-2xl text-[#292F36] mb-8 font-['Nunito']">Great Job Manager.</p>
          <button 
            className="bg-[#FF6B6B] text-white px-6 py-3 rounded-full font-bold text-lg border-[2px] border-[#292F36] shadow-[0_4px_0_#292F36] hover:scale-105 active:scale-95 transition-transform"
            onClick={() => setView('MENU')}
          >
            BACK TO MENU
          </button>
        </div>
      )}

      {/* --- GAME VIEW --- */}
      {view === 'GAME' && (
        <div className="flex flex-col h-screen p-5 max-w-[1200px] mx-auto font-['Nunito'] text-[#292F36] overflow-hidden bg-[#f4f7f6]">
          
          {/* HUD */}
          <div className="flex justify-between items-center bg-white p-3 px-5 rounded-[30px] border-[3px] border-[#292F36] shadow-[5px_5px_0px_rgba(0,0,0,0.15)] mb-4 shrink-0">
            <div className="flex gap-2.5 items-center">
              <button className="w-10 h-10 rounded-full border-2 border-[#292F36] flex justify-center items-center bg-[#FF6B6B] text-white font-bold text-lg hover:scale-95 transition-transform" onClick={() => setView('MENU')}>✕</button>
              <button className="w-10 h-10 rounded-full border-2 border-[#292F36] flex justify-center items-center bg-[#54a0ff] text-white font-bold text-lg hover:scale-95 transition-transform" onClick={() => setShowGuide(true)}>?</button>
              <div className="font-bold text-lg ml-2 font-['Fredoka']">{LEVELS[lvlId].title}</div>
            </div>

            <div className="flex gap-5 items-center">
              <div className="font-extrabold text-sm">GUESTS: {servedCount} / {LEVELS[lvlId].target}</div>
              
              {LEVELS[lvlId].mode === 'REHASH' && (
                <div className="flex items-center gap-3 pl-5 border-l-2 border-[#ddd]">
                  <div className="text-xs font-bold">LOAD: {lf.toFixed(2)}</div>
                  <div className="w-[100px] h-3 bg-[#eee] border border-[#292F36] rounded-md overflow-hidden relative">
                    <div className="h-full transition-all duration-300 ease-out" style={{width:`${lfPercent}%`, background:lfColor}}></div>
                  </div>
                  <button 
                    className={`px-4 py-2 rounded-full font-bold text-xs border-2 transition-all ${rehashNeeded 
                      ? 'bg-[#FF6B6B] text-white border-[#292F36] shadow-[0_4px_0_#292F36] animate-pulse cursor-pointer' 
                      : 'bg-[#b2bec3] text-[#636e72] border-[#b2bec3] cursor-not-allowed'}`}
                    onClick={rehashNeeded ? handleManualRehash : undefined}
                    disabled={!rehashNeeded}
                  >
                    REHASH & EXPAND ⚠️
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* BOARD */}
          <div className="flex-grow bg-white border-[3px] border-[#292F36] rounded-[20px] p-5 relative flex flex-col items-center justify-between shadow-sm">
            
            {/* Rehash Overlay */}
            {isRehashing && (
              <div className="absolute inset-0 bg-white/90 z-50 flex flex-col justify-center items-center rounded-[17px]">
                <div className="w-10 h-10 border-4 border-[#eee] border-t-[#FF6B6B] rounded-full animate-spin mb-4"></div>
                <h2 className="text-2xl font-['Fredoka'] mb-2">EXPANDING HOTEL...</h2>
                <p>Moving guests to new rooms...</p>
              </div>
            )}

            {/* Reception Area */}
            <div className="h-[35%] w-full flex flex-col justify-center items-center">
              <div className={`bg-[#292F36] text-white px-4 py-1.5 rounded-2xl font-bold mb-2 transition-all duration-300 transform ${guest ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                 Room {guest} % {tableSize} = {guest % tableSize}
              </div>
              
              {guest ? (
                <div className="w-[70px] h-[80px] bg-[#FF6B6B] border-[3px] border-[#292F36] rounded-xl flex justify-center items-center text-white font-black text-2xl shadow-[0_4px_0_rgba(0,0,0,0.2)] animate-bounce z-10">
                  {guest}
                </div>
              ) : (
                <div className="font-bold text-[#aaa] mt-4">
                  {rehashNeeded ? "CAPACITY REACHED! REHASH REQUIRED." : "Waiting..."}
                </div>
              )}
            </div>

            {/* Rooms Grid */}
            <div className="w-full h-[60%] flex justify-center items-end gap-2 pb-8">
              {Array.from({ length: tableSize }).map((_, idx) => {
                const val = rooms[idx];
                return (
                  <div 
                    key={idx} 
                    className={`flex-1 max-w-[90px] h-full bg-[#f1f2f6] border-[3px] border-dashed border-[#b2bec3] rounded-t-xl flex flex-col-reverse items-center p-1 cursor-pointer relative transition-all duration-200
                      hover:bg-[#dff9fb] hover:border-[#4ECDC4] hover:border-solid
                      ${shakeRoom === idx ? 'animate-shake bg-[#ff7675] border-[#292F36] border-solid' : ''}
                    `}
                    onClick={() => handleRoomClick(idx)}
                  >
                    {/* Items Inside Room */}
                    {Array.isArray(val) ? (
                      val.map((v, i) => (
                        <div key={i} className="w-[90%] aspect-square bg-[#4ECDC4] border-2 border-[#292F36] rounded-md mt-1 flex justify-center items-center font-bold text-sm animate-pop text-[#292F36]">
                          {v}
                        </div>
                      ))
                    ) : (
                      val !== undefined && (
                        <div className="w-[90%] aspect-square bg-[#4ECDC4] border-2 border-[#292F36] rounded-md mt-1 flex justify-center items-center font-bold text-sm animate-pop text-[#292F36]">
                          {val}
                        </div>
                      )
                    )}
                    
                    <div className="absolute -bottom-7 font-extrabold text-sm text-[#292F36]">Room {idx}</div>
                  </div>
                );
              })}
            </div>

            {/* Feedback Toast */}
            {feedback && (
              <div className="absolute top-[40%] bg-[#292F36] text-white px-5 py-2.5 rounded-2xl font-bold pointer-events-none z-[60] animate-floatUp shadow-lg">
                {feedback}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- GUIDE MODAL --- */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/85 flex justify-center items-center z-[100] p-4">
          <div className="bg-white p-8 rounded-[20px] border-[3px] border-[#292F36] w-[500px] text-center font-['Nunito']">
            <h2 className="text-2xl font-bold mb-5 font-['Fredoka']">{LEVELS[lvlId].title} Rules</h2>
            <div className="text-left mb-6 whitespace-pre-wrap leading-relaxed text-[#292F36]">
              {LEVELS[lvlId].instr}
            </div>
            
            <button 
              className="bg-[#FF6B6B] text-white px-6 py-2 rounded-full font-bold text-sm border-2 border-[#292F36] shadow-[0_4px_0_#292F36] hover:scale-105 active:scale-95 transition-transform"
              onClick={() => {
                setShowGuide(false);
                if (guest === null && servedCount === 0 && !rehashNeeded) {
                   spawnNext();
                }
              }}
            >
              {guest === null && servedCount === 0 && !rehashNeeded ? "OPEN HOTEL" : "RESUME"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default HashingGame;