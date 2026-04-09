import Sidebar from './Sidebar';
import VehicleStatus from './VehicleStatus';
import VehicleControls from './VehicleControls';
import AssistantChat from './AssistantChat';

export default function Dashboard() {
  return (
    <div className="flex h-screen w-full bg-dashboard-bg overflow-hidden font-sans text-white">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 p-8 grid grid-cols-12 gap-8 relative">
        
        {/* Background ambient glow */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-vinfast-blue/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-vinfast-cyan/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Left Column: Vehicle Info & Controls */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-8 z-10">
          <header className="mb-4">
            <h1 className="text-3xl font-light tracking-tight mb-2">Good afternoon, <span className="font-medium">Driver</span></h1>
            <p className="text-gray-400 text-sm font-mono">VF 8 • Smart Cockpit Demo</p>
          </header>

          <VehicleStatus />
          
          <div className="mt-auto">
            <VehicleControls />
          </div>
        </div>

        {/* Right Column: AI Assistant */}
        <div className="col-span-12 lg:col-span-5 h-full z-10 pb-4">
          <AssistantChat />
        </div>
      </div>
    </div>
  );
}
