import { ChevronDown, ChevronRight } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { Button } from "../ui/button";
import { INavLink } from "@/types";
import { allMenuCategories } from "@/contants";
import { useSignOutAccount } from "@/lib/react-query/auth";
import { useUserContext } from "@/context/AuthContext";

const OrganizedSidebar = () => {
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useUserContext();

  // Estado para controlar quais seções estão expandidas
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
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
      {links.map((link: INavLink) => {
        const isActive = pathname === link.route;
        return (
          <li key={link.label}>
            <NavLink
              to={link.route}
              className={`leftsidebar-link group flex gap-4 items-center p-3 rounded-lg transition-all ${
                isActive && "bg-primary-500"
              }`}
            >
              <img
                src={link.imgURL}
                alt={link.label}
                className={`w-5 h-5 group-hover:invert-white ${
                  isActive && "invert-white"
                }`}
              />
              <span className="text-sm font-medium">{link.label}</span>
            </NavLink>
          </li>
        );
      })}
    </ul>
  );

  const renderSection = (categoryKey: string, title: string, links: typeof allMenuCategories) => (
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

  return (
    <nav className="leftsidebar">
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
            <p className="small-regular text-light-3">@{user.username}</p>
          </div>
        </Link>

        {/* Links principais (Início) */}
        {renderLinks(linksByCategory.main)}

        {/* Seções categorizadas */}
        {renderSection('rpg', categoryTitles.rpg, linksByCategory.rpg)}
        {renderSection('system', categoryTitles.system, linksByCategory.system)}
      </div>

      {/* Botão de sair */}
      <Button
        variant={"ghost"}
        className="shad-button_ghost mt-6"
        onClick={() => signOut()}
      >
        <img src="/assets/icons/logout.svg" alt="logout" />
        <p className="small-medium lg:base-medium">Sair</p>
      </Button>
    </nav>
  );
};

export default OrganizedSidebar;