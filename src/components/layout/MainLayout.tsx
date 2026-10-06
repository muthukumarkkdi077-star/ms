import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { VoiceAssistant } from '../assistant/VoiceAssistant';

export const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090d16] dark:bg-[#090d16] light:bg-[#f8fafc] text-slate-100 dark:text-slate-100 light:text-slate-800 font-sans transition-colors duration-200">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Persistent Left Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopBar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Dynamic Page Outlet */}
        <main className="flex-1 overflow-y-auto min-h-0 relative">
          <Outlet />
        </main>
      </div>

      {/* Universal Floating AI Voice Assistant */}
      <VoiceAssistant />
    </div>
  );
};
