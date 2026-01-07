import React, { useState, useEffect } from 'react';

const GraphGame = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  // --- AUTO-INJECT TAILWIND ---
  useEffect(() => {
    if (!document.querySelector('script[src="https://cdn.tailwindcss.com"]')) {
      const script = document.createElement('script');
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);

  // --- THE QUESTIONS DATA ---
  const questions = [
    {
      type: 'theory',
      questionText: "In Graph Theory, what do we call the lines connecting the points?",
      options: [
        { text: "Vertices", isCorrect: false },
        { text: "Edges", isCorrect: true },
        { text: "Nodes", isCorrect: false },
        { text: "Pixels", isCorrect: false },
      ],
    },
    {
      type: 'theory',
      questionText: "If you can travel in both directions between two nodes, the graph is:",
      options: [
        { text: "Directed", isCorrect: false },
        { text: "Undirected", isCorrect: true },
        { text: "Broken", isCorrect: false },
        { text: "Weighted", isCorrect: false },
      ],
    },
    {
      type: 'theory',
      questionText: "What is a 'Weighted Graph'?",
      options: [
        { text: "A graph with heavy nodes", isCorrect: false },
        { text: "A graph drawn with thick lines", isCorrect: false },
        { text: "Edges have assigned values (cost)", isCorrect: true },
        { text: "A graph with only one node", isCorrect: false },
      ],
    },
    {
      type: 'visual',
      visualType: 'undirected',
      questionText: "Look at this beauty! What type of graph is this?",
      options: [
        { text: "Directed Graph", isCorrect: false },
        { text: "Undirected Graph", isCorrect: true },
        { text: "Null Graph", isCorrect: false },
        { text: "Cyclic Graph", isCorrect: false },
      ],
    },
    {
      type: 'visual',
      visualType: 'directed',
      questionText: "Notice the arrows? What specific type is this?",
      options: [
        { text: "Undirected Graph", isCorrect: false },
        { text: "Directed Graph (Digraph)", isCorrect: true },
        { text: "Tree", isCorrect: false },
        { text: "Complete Graph", isCorrect: false },
      ],
    },
    {
      type: 'visual',
      visualType: 'cycle',
      questionText: "You can start at A and return to A. This graph contains a:",
      options: [
        { text: "Cycle", isCorrect: true },
        { text: "Dead End", isCorrect: false },
        { text: "Bridge", isCorrect: false },
        { text: "Leaf", isCorrect: false },
      ],
    },
    {
      type: 'visual',
      visualType: 'disconnected',
      questionText: "These two parts don't touch! This graph is:",
      options: [
        { text: "Connected", isCorrect: false },
        { text: "Bipartite", isCorrect: false },
        { text: "Disconnected", isCorrect: true },
        { text: "Complete", isCorrect: false },
      ],
    },
    {
      type: 'visual',
      visualType: 'star',
      questionText: "One center node connected to everyone else. This looks like a:",
      options: [
        { text: "Line Graph", isCorrect: false },
        { text: "Star Graph", isCorrect: true },
        { text: "Ring Graph", isCorrect: false },
        { text: "Mesh Graph", isCorrect: false },
      ],
    },
  ];

  const handleAnswerOptionClick = (isCorrect) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(isCorrect ? 'correct' : 'wrong');
    setIsCorrect(isCorrect);

    if (isCorrect) {
      setScore(score + 1);
    }

    setTimeout(() => {
      const nextQuestion = currentQuestion + 1;
      if (nextQuestion < questions.length) {
        setCurrentQuestion(nextQuestion);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setShowScore(true);
      }
    }, 1500);
  };

  const restartGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  return (
    <>
      <style>
        {`
          @keyframes bounce { 0% { transform: scale(0); } 100% { transform: scale(1); } }
          @keyframes popIn { 
            0% { transform: translate(-50%, -50%) scale(0); } 
            80% { transform: translate(-50%, -50%) scale(1.2); } 
            100% { transform: translate(-50%, -50%) scale(1) rotate(-5deg); } 
          }
          .animate-bounce-custom { animation: bounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
          .animate-popIn { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        `}
      </style>

      <div 
        className="min-h-screen w-full flex justify-center items-center font-sans p-5"
        style={{
          backgroundColor: '#6c5ce7',
          backgroundImage: `
            radial-gradient(#a29bfe 20%, transparent 20%),
            radial-gradient(#a29bfe 20%, transparent 20%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px'
        }}
      >
        <div className="bg-white w-full max-w-[500px] p-8 border-[3px] border-[#2d3436] rounded-[15px] shadow-[8px_8px_0_#2d3436] relative overflow-hidden">
          <h1 className="text-center font-black text-3xl m-0 text-[#2d3436] drop-shadow-[2px_2px_0_#FFD93D] tracking-tight mb-6">
            GRAPH MASTERY
          </h1>
          
          {showScore ? (
            <div className="text-center py-5">
              <h2 className="text-2xl font-bold mb-4">GAME OVER!</h2>
              <div className="w-[120px] h-[120px] mx-auto border-[3px] border-[#2d3436] rounded-full bg-[#FFD93D] flex justify-center items-center text-3xl font-black shadow-[4px_4px_0_#2d3436] animate-bounce-custom">
                {score} / {questions.length}
              </div>
              <p className="mt-5 text-lg font-bold text-[#636e72]">
                {score === 8 ? "PERFECT SCORE! YOU'RE A LEGEND!" : 
                 score > 5 ? "Great Job! Almost a Pro." : "Keep Studying!"}
              </p>
              <button 
                className="mt-6 bg-[#4D96FF] text-white border-[3px] border-[#2d3436] px-8 py-4 text-xl font-bold cursor-pointer shadow-[4px_4px_0_#2d3436] hover:bg-[#3b82f6] rounded-[10px]"
                onClick={restartGame}
              >
                PLAY AGAIN
              </button>
            </div>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="w-full h-[15px] border-[3px] border-[#2d3436] rounded-[10px] bg-[#eee] mb-5 overflow-hidden">
                <div 
                  className="h-full bg-[#6BCB77] transition-all duration-300 ease-out" 
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
              
              <div className="text-center mb-6">
                <div className="font-bold text-sm text-[#636e72] mb-2">
                  <span>QUESTION {currentQuestion + 1}</span>/{questions.length}
                </div>
                
                {/* Visual Container */}
                {questions[currentQuestion].type === 'visual' && (
                  <div className="my-5 p-2.5 bg-[#F7F7F7] border-[3px] border-[#2d3436] rounded-[10px] shadow-[4px_4px_0_rgba(0,0,0,0.1)] group hover:scale-[1.02] transition-transform">
                    <GraphVisual type={questions[currentQuestion].visualType} />
                  </div>
                )}

                <div className="text-xl font-bold leading-snug">
                  {questions[currentQuestion].questionText}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {questions[currentQuestion].options.map((option, index) => {
                  let btnClass = "w-full text-left bg-white border-[3px] border-[#2d3436] rounded-[10px] p-4 text-base font-bold cursor-pointer transition-all shadow-[4px_4px_0_#2d3436] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#2d3436] hover:bg-[#FFD93D]";
                  
                  if (selectedAnswer) {
                    if (option.isCorrect) btnClass = "w-full text-left bg-[#6BCB77] text-[#2d3436] border-[3px] border-[#2d3436] rounded-[10px] p-4 text-base font-bold shadow-[4px_4px_0_#2d3436]";
                    else if (selectedAnswer === 'wrong' && !option.isCorrect) btnClass = "w-full text-left bg-white border-[3px] border-[#2d3436] rounded-[10px] p-4 text-base font-bold shadow-[4px_4px_0_#2d3436] opacity-60 cursor-not-allowed";
                    else btnClass += " opacity-60 cursor-not-allowed hover:bg-white"; // Disabled remaining options
                  }

                  return (
                    <button 
                      key={index} 
                      className={btnClass} 
                      onClick={() => handleAnswerOptionClick(option.isCorrect)}
                      disabled={selectedAnswer !== null}
                    >
                      {option.text}
                    </button>
                  );
                })}
              </div>
              
              {selectedAnswer && (
                 <div 
                  className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-10 py-5 border-[3px] border-[#2d3436] text-3xl font-black z-10 shadow-[10px_10px_0_rgba(0,0,0,0.2)] animate-popIn whitespace-nowrap ${isCorrect ? 'bg-[#6BCB77] text-[#2d3436]' : 'bg-[#FF6B6B] text-white rotate-6'}`}
                 >
                   {isCorrect ? "NAILED IT!" : "OOPS!"}
                 </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

// --- SUB-COMPONENT FOR CARTOON GRAPHICS ---
const GraphVisual = ({ type }) => {
  const strokeColor = "#2d3436";
  const strokeWidth = "3";
  const nodeRadius = 15;

  return (
    <svg viewBox="0 0 300 150" className="w-full h-auto max-h-[200px]">
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="22" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill={strokeColor} />
        </marker>
      </defs>

      {type === 'undirected' && (
        <g>
           <line x1="50" y1="75" x2="150" y2="25" stroke={strokeColor} strokeWidth={strokeWidth} />
           <line x1="50" y1="75" x2="150" y2="125" stroke={strokeColor} strokeWidth={strokeWidth} />
           <line x1="150" y1="25" x2="250" y2="75" stroke={strokeColor} strokeWidth={strokeWidth} />
           <circle cx="50" cy="75" r={nodeRadius} fill="#fab1a0" stroke={strokeColor} strokeWidth={strokeWidth} />
           <circle cx="150" cy="25" r={nodeRadius} fill="#81ecec" stroke={strokeColor} strokeWidth={strokeWidth} />
           <circle cx="150" cy="125" r={nodeRadius} fill="#74b9ff" stroke={strokeColor} strokeWidth={strokeWidth} />
           <circle cx="250" cy="75" r={nodeRadius} fill="#a29bfe" stroke={strokeColor} strokeWidth={strokeWidth} />
        </g>
      )}

      {type === 'directed' && (
        <g>
           <line x1="50" y1="75" x2="150" y2="75" stroke={strokeColor} strokeWidth={strokeWidth} markerEnd="url(#arrow)" />
           <line x1="150" y1="75" x2="250" y2="40" stroke={strokeColor} strokeWidth={strokeWidth} markerEnd="url(#arrow)" />
           <line x1="150" y1="75" x2="250" y2="110" stroke={strokeColor} strokeWidth={strokeWidth} markerEnd="url(#arrow)" />
           <circle cx="50" cy="75" r={nodeRadius} fill="#ffeaa7" stroke={strokeColor} strokeWidth={strokeWidth} />
           <circle cx="150" cy="75" r={nodeRadius} fill="#55efc4" stroke={strokeColor} strokeWidth={strokeWidth} />
           <circle cx="250" cy="40" r={nodeRadius} fill="#ff7675" stroke={strokeColor} strokeWidth={strokeWidth} />
           <circle cx="250" cy="110" r={nodeRadius} fill="#6c5ce7" stroke={strokeColor} strokeWidth={strokeWidth} />
        </g>
      )}

      {type === 'cycle' && (
        <g>
           <polygon points="150,25 225,125 75,125" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
           <circle cx="150" cy="25" r={nodeRadius} fill="#fd79a8" stroke={strokeColor} strokeWidth={strokeWidth} />
           <circle cx="225" cy="125" r={nodeRadius} fill="#fdcb6e" stroke={strokeColor} strokeWidth={strokeWidth} />
           <circle cx="75" cy="125" r={nodeRadius} fill="#00b894" stroke={strokeColor} strokeWidth={strokeWidth} />
        </g>
      )}

      {type === 'disconnected' && (
        <g>
           <line x1="50" y1="50" x2="100" y2="100" stroke={strokeColor} strokeWidth={strokeWidth} />
           <circle cx="50" cy="50" r={nodeRadius} fill="#e17055" stroke={strokeColor} strokeWidth={strokeWidth} />
           <circle cx="100" cy="100" r={nodeRadius} fill="#e17055" stroke={strokeColor} strokeWidth={strokeWidth} />
           
           <line x1="200" y1="50" x2="250" y2="50" stroke={strokeColor} strokeWidth={strokeWidth} />
           <line x1="250" y1="50" x2="225" y2="100" stroke={strokeColor} strokeWidth={strokeWidth} />
           <line x1="225" y1="100" x2="200" y2="50" stroke={strokeColor} strokeWidth={strokeWidth} />
           <circle cx="200" cy="50" r={nodeRadius} fill="#0984e3" stroke={strokeColor} strokeWidth={strokeWidth} />
           <circle cx="250" cy="50" r={nodeRadius} fill="#0984e3" stroke={strokeColor} strokeWidth={strokeWidth} />
           <circle cx="225" cy="100" r={nodeRadius} fill="#0984e3" stroke={strokeColor} strokeWidth={strokeWidth} />
           
           <line x1="150" y1="10" x2="150" y2="140" stroke="#b2bec3" strokeWidth="2" strokeDasharray="5,5" />
        </g>
      )}

      {type === 'star' && (
        <g>
           <line x1="150" y1="75" x2="150" y2="25" stroke={strokeColor} strokeWidth={strokeWidth} />
           <line x1="150" y1="75" x2="200" y2="115" stroke={strokeColor} strokeWidth={strokeWidth} />
           <line x1="150" y1="75" x2="100" y2="115" stroke={strokeColor} strokeWidth={strokeWidth} />
           <line x1="150" y1="75" x2="90" y2="60" stroke={strokeColor} strokeWidth={strokeWidth} />
           <line x1="150" y1="75" x2="210" y2="60" stroke={strokeColor} strokeWidth={strokeWidth} />

           <circle cx="150" cy="25" r={10} fill="#fab1a0" stroke={strokeColor} strokeWidth={strokeWidth} />
           <circle cx="200" cy="115" r={10} fill="#fab1a0" stroke={strokeColor} strokeWidth={strokeWidth} />
           <circle cx="100" cy="115" r={10} fill="#fab1a0" stroke={strokeColor} strokeWidth={strokeWidth} />
           <circle cx="90" cy="60" r={10} fill="#fab1a0" stroke={strokeColor} strokeWidth={strokeWidth} />
           <circle cx="210" cy="60" r={10} fill="#fab1a0" stroke={strokeColor} strokeWidth={strokeWidth} />
           
           <circle cx="150" cy="75" r="20" fill="#fdcb6e" stroke={strokeColor} strokeWidth={strokeWidth} />
        </g>
      )}
    </svg>
  );
};

export default GraphGame;