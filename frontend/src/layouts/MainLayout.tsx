
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import NoteEditor from "@/components/NoteEditor";
import CommandPalette from "@/components/CommandPalette";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto">
          <div className="container h-full max-w-6xl px-4 py-6">
            <NoteEditor />
          </div>
        </main>
      </div>
      
      <CommandPalette />
    </div>
  );
};

export default MainLayout;
