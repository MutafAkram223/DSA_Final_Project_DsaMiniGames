import React, { useState, useEffect, useCallback } from 'react';
import '../styles/hashing-game.css';
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

const HashGame = () => {
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

  if (view === 'MENU') {
    return (
      <div className="menu-screen">
        <h1 className="game-title">HOTEL HASH</h1>
        <div className="level-grid">
          {[1, 2, 3, 4].map(l => (
            <div key={l} className="level-card" onClick={() => startGame(l)}>
              <h3>{LEVELS[l].title}</h3>
              <p style={{fontSize:'0.9rem', color:'#666'}}>{LEVELS[l].desc}</p>
              <div style={{marginTop:'10px', fontWeight:'bold', color:'var(--primary)'}}>
                {LEVELS[l].target} Guests
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'WIN') {
    return (
      <div className="menu-screen">
        <h1 style={{color:'var(--secondary)'}}>HOTEL FULL!</h1>
        <p>Great Job Manager.</p>
        <button className="btn-rehash active" onClick={() => setView('MENU')}>BACK TO MENU</button>
      </div>
    );
  }

  return (
    <div className="game-layout">
      {/* HUD */}
      <div className="hud">
        <div className="hud-left">
          <button className="btn-icon btn-red" onClick={() => setView('MENU')}>✕</button>
          <button className="btn-icon btn-blue" onClick={() => setShowGuide(true)}>?</button>
          <div style={{fontWeight:'bold'}}>{LEVELS[lvlId].title}</div>
        </div>

        <div className="stats-container">
          <div className="stat-box">GUESTS: {servedCount} / {LEVELS[lvlId].target}</div>
          
          {LEVELS[lvlId].mode === 'REHASH' && (
            <div className="rehash-controls">
              <div style={{fontSize:'0.8rem', fontWeight:'bold'}}>LOAD: {lf.toFixed(2)}</div>
              <div className="load-meter">
                <div className="load-fill" style={{width:`${lfPercent}%`, background:lfColor}}></div>
              </div>
              <button 
                className={`btn-rehash ${rehashNeeded ? 'active' : ''}`}
                onClick={handleManualRehash}
              >
                REHASH & EXPAND ⚠️
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BOARD */}
      <div className="board">
        {isRehashing && (
          <div className="rehash-msg">
            <div className="spinner"></div>
            <h2>EXPANDING HOTEL...</h2>
            <p>Moving guests to new rooms...</p>
          </div>
        )}

        <div className="reception">
          <div className={`bubble ${guest ? 'show' : ''}`}>
             Room {guest} % {tableSize} = {guest % tableSize}
          </div>
          {guest ? (
            <div className="guest">{guest}</div>
          ) : (
            <div style={{fontWeight:'bold', color:'#aaa'}}>
              {rehashNeeded ? "CAPACITY REACHED! REHASH REQUIRED." : "Waiting..."}
            </div>
          )}
        </div>

        <div className="rooms-wrap">
          {Array.from({ length: tableSize }).map((_, idx) => {
            const val = rooms[idx];
            return (
              <div 
                key={idx} 
                className={`room ${shakeRoom === idx ? 'flash-red' : ''}`}
                onClick={() => handleRoomClick(idx)}
              >
                {Array.isArray(val) ? (
                  val.map((v, i) => <div key={i} className="item">{v}</div>)
                ) : (
                  val !== undefined && <div className="item">{val}</div>
                )}
                <div className="room-num">Room {idx}</div>
              </div>
            );
          })}
        </div>

        {feedback && <div className="toast">{feedback}</div>}
      </div>

      {/* GUIDE MODAL */}
      {showGuide && (
        <div className="overlay">
          <div className="modal">
            <h2>{LEVELS[lvlId].title} Rules</h2>
            <div style={{textAlign:'left', margin:'20px 0', whiteSpace:'pre-wrap', lineHeight:'1.5'}}>
              {LEVELS[lvlId].instr}
            </div>
            {/* Conditional Button based on game state */}
            {guest === null && servedCount === 0 && !rehashNeeded ? (
               <button className="btn-rehash active" onClick={() => { setShowGuide(false); spawnNext(); }}>
                 OPEN HOTEL
               </button>
            ) : (
               <button className="btn-rehash active" onClick={() => setShowGuide(false)}>
                 RESUME
               </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HashGame;