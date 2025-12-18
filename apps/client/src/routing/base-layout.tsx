import { Outlet } from "react-router-dom";

export const BaseLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Starry background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Stars */}
        <div className="absolute top-[10%] left-[15%] w-1 h-1 bg-white/40 rounded-full"></div>
        <div className="absolute top-[20%] left-[25%] w-1 h-1 bg-white/30 rounded-full"></div>
        <div className="absolute top-[15%] left-[75%] w-1 h-1 bg-white/50 rounded-full"></div>
        <div className="absolute top-[30%] left-[60%] w-0.5 h-0.5 bg-white/40 rounded-full"></div>
        <div className="absolute top-[40%] left-[20%] w-1 h-1 bg-white/30 rounded-full"></div>
        <div className="absolute top-[50%] left-[80%] w-0.5 h-0.5 bg-white/50 rounded-full"></div>
        <div className="absolute top-[60%] left-[40%] w-1 h-1 bg-white/40 rounded-full"></div>
        <div className="absolute top-[70%] left-[70%] w-0.5 h-0.5 bg-white/30 rounded-full"></div>
        <div className="absolute top-[80%] left-[30%] w-1 h-1 bg-white/50 rounded-full"></div>
        <div className="absolute top-[25%] left-[90%] w-0.5 h-0.5 bg-white/40 rounded-full"></div>
        <div className="absolute top-[45%] left-[10%] w-1 h-1 bg-white/30 rounded-full"></div>
        <div className="absolute top-[65%] left-[85%] w-0.5 h-0.5 bg-white/50 rounded-full"></div>

        {/* Subtle gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl"></div>
      </div>
      <Outlet />
    </div>
  );
};
