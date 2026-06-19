import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ children, activePage, onNavigate }) {
  return (
    <div className="min-h-screen flex bg-gray-950 font-sans bg-stitch-grid relative overflow-hidden">
      
      {/* Background glow spots */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full glow-spot-purple -z-10 animate-blob-1 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full glow-spot-blue -z-10 animate-blob-2 pointer-events-none"></div>

      {/* Sidebar - fixed */}
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      
      {/* Content wrapper */}
      <div className="flex-grow flex flex-col pl-64 min-h-screen relative z-10">
        {/* Navbar */}
        <Navbar />
        
        {/* Main page viewport */}
        <main className="flex-grow p-8 overflow-y-auto max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
