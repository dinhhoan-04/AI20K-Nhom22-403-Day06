import React, { useEffect } from 'react';
import ChatPanel from './components/ChatPanel';
import CarControls from './components/CarControls';
import Sidebar from './components/Sidebar';
import { useStore } from './store';

function App() {
  const { startPolling } = useStore();

  useEffect(() => {
    startPolling();
  }, [startPolling]);

  return (
    <div className="h-screen w-screen bg-vf-bg text-white flex overflow-hidden font-sans">
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 p-8 lg:px-14 lg:py-10 flex flex-col overflow-y-auto">
        <CarControls />
      </div>
      
      {/* Chat Interface Container */}
      <div className="w-[450px] bg-vf-bg flex flex-col shrink-0">
        <ChatPanel />
      </div>
    </div>
  );
}

export default App;
