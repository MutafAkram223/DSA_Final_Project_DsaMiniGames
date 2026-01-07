import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import SearchGame from './pages/SearchGame';
import SortingGame from './pages/SortingGame';
import StackGame from './pages/StackGame';
import QueueGame from './pages/QueueGame';
import HashingGame from './pages/HashingGame';
import TreeGame from './pages/Treegame';
import GraphGame from './pages/GraphGame';
import DijkstraGame from './pages/Dijkstra';

import CastleRealmDefender from './pages/RedBlackGame';

export default function App() {
  
  useEffect(() => {
    if (!document.querySelector('script[src="https://cdn.tailwindcss.com"]')) {
      const script = document.createElement('script');
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Main Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Game Routes - matching the paths in your Dashboard.jsx */}
        <Route path="/search" element={<SearchGame />} />
        <Route path="/sorting" element={<SortingGame />} />
        <Route path="/stack" element={<StackGame />} />
        <Route path="/queue" element={<QueueGame />} />
        <Route path="/hashing" element={<HashingGame />} />
        <Route path="/tree" element={<TreeGame />} />
        <Route path="/graph" element={<GraphGame />} />
        <Route path="/dijkstra" element={<DijkstraGame />} />

        <Route path="/red-black-tree" element={<CastleRealmDefender />} />
        
        {/* Fallback for unknown routes */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}