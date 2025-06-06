import { Home, LogOut, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { Button } from "../ui/button";
import NotificationBell from "./NotificationBell";
import React from 'react';
import { useSignOutAccount } from "@/lib/react-query/auth";
import { useUserContext } from "@/context/AuthContext";

// Context simples para controlar o sidebar

export const SidebarContext = React.createContext<{
  isOpen: boolean;
  toggleSidebar: () => void;
}>({
  isOpen: false,
  toggleSidebar: () => {}
});

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => React.useContext(SidebarContext);

const Topbar = () => {
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess, navigate]);

  return (
    <section className="sticky top-0 z-50 bg-dark-2 w-full">
      <div className="flex items-center justify-between py-4 px-5 w-full">
        {/* Menu Button e Home */}
        <div className="flex items-center gap-3">
          <Button
            onClick={toggleSidebar}
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-dark-3 rounded-lg"
            title="Menu"
          >
            <Menu className="w-6 h-6 text-primary-500" />
          </Button>
          
          <Link 
            to="/"
            className="p-2 hover:bg-dark-3 rounded-lg transition-colors"
            title="Início"
          >
            <Home className="w-5 h-5 text-primary-500 hover:text-primary-400" />
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex gap-3 items-center">
          <NotificationBell />
          
          <Button
            variant="ghost"
            className="shad-button_ghost"
            onClick={() => signOut()}
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </Button>
          
          <Link 
            to={`/profile/${user.id}`} 
            className="hover:opacity-80 transition-opacity"
            title={`Perfil de ${user.name}`}
          >
            <img
              src={user.imageUrl || "/assets/images/profile-placeholder.svg"}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover border border-dark-4"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Topbar;