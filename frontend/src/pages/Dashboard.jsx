import React from 'react';

const games = [
  { name: "Search Game", path: "/search", icon: "🔍", color: "bg-blue-100" },
  { name: "Sorting Game", path: "/sorting", icon: "🛁", color: "bg-purple-100" },
  { name: "Stack Game", path: "/stack", icon: "📚", color: "bg-indigo-100" },
  { name: "Queue Game", path: "/queue", icon: "🚶", color: "bg-green-100" },
  { name: "Hashing Game", path: "/hashing", icon: "#️⃣", color: "bg-yellow-100" },
  { name: "Tree Game", path: "/tree", icon: "🌳", color: "bg-emerald-100" },
  { name: "Graph Game", path: "/graph", icon: "🕸️", color: "bg-red-100" },
  { name: "Dijkstra Game", path: "/dijkstra", icon: "🚗", color: "bg-orange-100" },
];

export default function Dashboard() {
  return (
    <>
      {/* 1. Internal Style Block for Fonts */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@700;900&display=swap');
          
          /* Custom text stroke utility not available in default Tailwind */
          .text-stroke-2 { -webkit-text-stroke: 2px #1a1a1a; }
          .text-stroke-sm { -webkit-text-stroke: 1px #1a1a1a; }
        `}
      </style>

      {/* 2. Main Dashboard Container */}
      <div 
        className="min-h-screen w-full relative flex flex-col items-center bg-[#0f1720] text-white font-['Nunito'] overflow-x-hidden"
        style={{
          backgroundImage: `
            radial-gradient(1200px 700px at 10% 10%, rgba(255,200,20,0.06), transparent 6%),
            radial-gradient(800px 500px at 95% 85%, rgba(50,120,255,0.04), transparent 6%),
            linear-gradient(180deg, #1b1f24, #0f1216)
          `
        }}
      >
        {/* Comic Overlay (Dots Pattern) */}
        <div 
          className="fixed inset-0 pointer-events-none z-[1] mix-blend-overlay opacity-50"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 2px, transparent 3px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Content Wrapper */}
        <div className="relative z-10 w-full max-w-7xl p-6 flex flex-col flex-1">
          
          {/* Header Section */}
          <div className="flex flex-col items-center justify-end pb-2 mt-8 mb-12">
            <div className="text-center -rotate-1 group hover:rotate-0 transition-transform duration-300">
              <h1 
                className="font-['Bangers'] text-[#ffd54a] text-6xl md:text-8xl m-0 leading-none drop-shadow-[6px_6px_0_rgba(0,0,0,0.6)] text-stroke-2 tracking-wide"
              >
                DSA Games
              </h1>
              <div className="inline-block mt-4 bg-[#ff385b] px-6 py-2 text-white rounded-xl border-[3px] border-black/60 rotate-2 font-black shadow-[0_8px_0_rgba(0,0,0,0.45)] text-sm md:text-base tracking-wider uppercase group-hover:scale-110 transition-transform">
                Level Up Your Skills
              </div>
            </div>
          </div>

          {/* Grid Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 pb-10">
            {games.map((game, index) => (
              <button
                key={game.name}
                onClick={() => window.location.href = game.path}
                className="
                  group relative h-[260px] w-full
                  flex flex-col items-center justify-center 
                  bg-white text-[#111] 
                  rounded-2xl border-[6px] border-black 
                  shadow-[10px_12px_0_rgba(0,0,0,0.5)] 
                  transition-all duration-200 ease-[cubic-bezier(.2,.9,.2,1)]
                  hover:-translate-y-3 hover:rotate-1 hover:scale-[1.02]
                  hover:shadow-[16px_18px_0_#ffd54a] hover:border-[#ffd54a]
                  overflow-hidden
                "
              >
                {/* Watermark Number */}
                <span className="absolute left-3 top-2 text-black/5 font-['Bangers'] text-5xl pointer-events-none select-none">
                  {index + 1}
                </span>

                {/* Icon Bubble */}
                <div className="relative w-28 h-28 flex items-center justify-center mb-3">
                  <div 
                    className={`absolute inset-0 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.15)] -rotate-[8deg] group-hover:scale-110 transition-transform duration-300 ${game.color}`} 
                  />
                  <span className="relative z-10 text-5xl filter drop-shadow-sm group-hover:animate-bounce">
                    {game.icon}
                  </span>
                </div>

                {/* Game Title */}
                <span className="font-['Bangers'] text-2xl md:text-3xl text-[#111] text-center px-4 leading-tight group-hover:text-[#ff385b] transition-colors">
                  {game.name}
                </span>

                {/* 'Play Now' Tag */}
                <span className="mt-3 bg-black text-white px-3 py-1 rounded-lg font-black text-xs uppercase tracking-widest group-hover:bg-[#ff385b] transition-colors">
                  Play Now
                </span>

                {/* Decorative Ribbon (Bottom Right) */}
                <div className="absolute -right-6 -bottom-6 rotate-[20deg] px-8 py-3 bg-[#ff385b] border-[4px] border-black/20 text-white font-black text-xs shadow-sm group-hover:bg-[#ffd54a] group-hover:text-black group-hover:border-black/10 transition-colors">
                  START
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-auto text-center py-6 text-white/40 text-sm font-bold tracking-widest uppercase">
            © DSA Game Dashboard • React + Tailwind
          </div>
        </div>
      </div>
    </>
  );
}