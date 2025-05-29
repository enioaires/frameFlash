import { ChevronDown, ChevronRight, LogOut } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { Button } from "../ui/button";
import { allMenuCategories } from "@/contants";
import { isAdmin } from "@/lib/adventures";
import { useSignOutAccount } from "@/lib/react-query/auth";
import { useUserContext } from "@/context/AuthContext";

const OrganizedSidebar = () => {
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useUserContext();

  // VERIFICAR SE USUÁRIO É ADMIN
  const userIsAdmin = isAdmin(user);

  // Estado para controlar quais seções estão expandidas
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    rpg: true,
    system: false,
  });

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess, navigate]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Organiza os links por categoria
  const linksByCategory = {
    main: allMenuCategories.filter(link => link.category === 'main'),
    rpg: allMenuCategories.filter(link => link.category === 'rpg'),
    system: allMenuCategories.filter(link => link.category === 'system'),
  };

  const categoryTitles = {
    rpg: '🎭 RPG',
    system: '⚙️ Sistema'
  };

  const renderLinks = (links: typeof allMenuCategories) => (
    <ul className="flex flex-col gap-2">
      {links
        .filter(link => {
          // FILTRAR AVENTURAS APENAS PARA ADMINS
          if (link.route === '/adventures') {
            return userIsAdmin;
          }
          return true;
        })
        .map((link) => {
          const isActive = pathname === link.route;
          const IconComponent = link.icon;
          
          return (
            <li key={link.label}>
              <NavLink
                to={link.route}
                className={`leftsidebar-link group flex gap-4 items-center p-3 rounded-lg transition-all ${isActive && "bg-primary-500"
                  }`}
              >
                <IconComponent 
                  className={`w-5 h-5 group-hover:text-white ${
                    isActive ? "text-white" : "text-primary-500"
                  }`}
                />
                <span className="text-sm font-medium">{link.label}</span>
              </NavLink>
            </li>
          );
        })}
    </ul>
  );

  const renderSection = (categoryKey: string, title: string, links: typeof allMenuCategories) => {
    // FILTRAR LINKS DA SEÇÃO
    const filteredLinks = links.filter(link => {
      if (link.route === '/adventures') {
        return userIsAdmin;
      }
      return true;
    });

    // NÃO RENDERIZAR SEÇÃO SE ESTIVER VAZIA
    if (filteredLinks.length === 0) {
      return null;
    }

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
            {renderLinks(filteredLinks)}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="leftsidebar">
      <div className="flex flex-col justify-between h-full">
        <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
          <div className="flex flex-col gap-6">
            {/* Perfil do usuário */}
            <Link to={`/profile/${user.id}`} className="flex gap-3 items-center p-4 bg-dark-3 rounded-lg">
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

            {/* Links principais (Início) */}
            {renderLinks(linksByCategory.main)}

            {/* Seções categorizadas */}
            {renderSection('rpg', categoryTitles.rpg, linksByCategory.rpg)}
            {renderSection('system', categoryTitles.system, linksByCategory.system)}
          </div>
        </div>

        {/* Botão de sair */}
        <Button
          variant={"ghost"}
          className="shad-button_ghost mt-6"
          onClick={() => signOut()}
        >
          <LogOut className="w-5 h-5" />
          <p className="small-medium lg:base-medium">Sair</p>
        </Button>
      </div>
    </nav>
  );
};

export default OrganizedSidebar;