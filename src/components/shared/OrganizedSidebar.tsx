import { ChevronDown, ChevronRight, LogOut, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { Button } from "../ui/button";
import { TwoColorIcon } from "./TwoColorIcon";
import { allMenuCategories } from "@/contants";
import { cn } from "@/lib/utils";
import { isAdmin } from "@/lib/adventures";
import { useSidebar } from "./Topbar";
import { useSignOutAccount } from "@/lib/react-query/auth";
import { useState } from "react";
import { useUserContext } from "@/context/AuthContext";

const OrganizedSidebar = () => {
  const { mutate: signOut } = useSignOutAccount();
  const { pathname } = useLocation();
  const { user } = useUserContext();
  const { isOpen, toggleSidebar } = useSidebar();

  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    rpg: true,
    system: false,
  });

  const userIsAdmin = isAdmin(user);

  const handleLinkClick = () => {
    // Fechar menu quando clicar em um link
    if (isOpen) {
      toggleSidebar();
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderIcon = (icon: any, isActive: boolean, size: number = 40) => {
    if (typeof icon === 'string') {
      return (
        <TwoColorIcon
          src={icon}
          alt="menu icon"
          isActive={isActive}
          size={size}
          hoverEffect="glow"
        />
      );
    } else {
      const IconComponent = icon;
      return (
        <IconComponent
          className={`w-5 h-5 group-hover:text-white transition-colors ${
            isActive ? "text-white" : "text-primary-500"
          }`}
        />
      );
    }
  };

  const getFilteredLinksByCategory = () => {
    return {
      main: allMenuCategories.filter(link => link.category === 'main'),
      rpg: allMenuCategories.filter(link => link.category === 'rpg'),
      system: allMenuCategories.filter(link => {
        if (link.category === 'system') {
          return userIsAdmin;
        }
        return false;
      }),
    };
  };

  const renderLinks = (links: typeof allMenuCategories) => (
    <ul className="flex flex-col gap-2">
      {links.map((link) => {
        const isActive = pathname === link.route;
        return (
          <li key={link.label}>
            <NavLink
              to={link.route}
              onClick={handleLinkClick}
              className={`leftsidebar-link group flex gap-4 items-center p-3 rounded-lg transition-all ${
                isActive && "bg-primary-500"
              }`}
            >
              {renderIcon(link.icon, isActive)}
              <span className="text-sm font-medium">{link.label}</span>
            </NavLink>
          </li>
        );
      })}
    </ul>
  );

  const renderSection = (categoryKey: string, title: string, links: typeof allMenuCategories) => {
    if (categoryKey === 'system' && !userIsAdmin) return null;
    if (links.length === 0) return null;

    return (
      <div key={categoryKey} className="mb-4">
        <button
          onClick={() => toggleSection(categoryKey)}
          className="flex items-center gap-2 w-full p-2 text-left text-light-2 hover:text-light-1 transition-colors"
        >
          {expandedSections[categoryKey] ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <span className="text-sm font-semibold">{title}</span>
        </button>
        {expandedSections[categoryKey] && (
          <div className="ml-4 mt-2">
            {renderLinks(links)}
          </div>
        )}
      </div>
    );
  };

  const MenuContent = () => {
    const filteredLinks = getFilteredLinksByCategory();

    return (
      <div className="flex flex-col justify-between h-full">
        <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
          <div className="flex flex-col gap-6">
            {/* Perfil do usuário */}
            <Link
              to={`/profile/${user.id}`}
              onClick={handleLinkClick}
              className="flex gap-3 items-center p-4 bg-dark-3 rounded-lg"
            >
              <img
                src={user.imageUrl || "/assets/images/profile-placeholder.svg"}
                alt="avatar"
                className="h-12 w-12 rounded-full"
              />
              <div className="flex flex-col">
                <p className="body-bold text-white">{user.name}</p>
                <div className="flex items-center gap-1">
                  <p className="small-regular text-light-3">@{user.username}</p>
                  {userIsAdmin && (
                    <span className="text-xs bg-primary-500/20 text-primary-400 px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </Link>
            {/* Links principais */}
            {renderLinks(filteredLinks.main)}

            {/* Seções categorizadas */}
            {renderSection('rpg', 'RPG', filteredLinks.rpg)}
            {userIsAdmin && renderSection('system', 'Sistema', filteredLinks.system)}
          </div>
        </div>

        {/* Botão de sair */}
        <Button
          variant="ghost"
          className="shad-button_ghost mt-6"
          onClick={() => signOut()}
        >
          <LogOut className="w-5 h-5" />
          <p className="small-medium lg:base-medium">Sair</p>
        </Button>
      </div>
    );
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Menu flutuante */}
      <nav
        className={cn(
          "fixed top-0 left-0 h-screen w-80 bg-dark-2 border-r border-dark-4 z-50 transition-transform duration-300 ease-in-out shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-4">
          <h2 className="text-lg font-bold text-light-1">Menu</h2>
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-dark-3 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-light-3" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="px-6 py-4 h-[calc(100%-80px)]">
          <MenuContent />
        </div>
      </nav>
    </>
  );
};

export default OrganizedSidebar;