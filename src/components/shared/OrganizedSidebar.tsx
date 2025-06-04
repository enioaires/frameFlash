import { ChevronDown, ChevronRight, LogOut, Menu, X } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { Button } from "../ui/button";
import { TwoColorIcon } from "./TwoColorIcon";
import { allMenuCategories } from "@/contants";
import { cn } from "@/lib/utils";
import { isAdmin } from "@/lib/adventures";
import { useSignOutAccount } from "@/lib/react-query/auth";
import { useUserContext } from "@/context/AuthContext";

const OrganizedSidebar = () => {
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useUserContext();

  // Estados para controle do menu
  const [isFloating, setIsFloating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    rpg: true,
    system: false,
  });

  const userIsAdmin = isAdmin(user);

  // Detectar tamanho da tela
  useEffect(() => {
    const checkScreenSize = () => {
      const isSmallScreen = window.innerWidth < 1440;
      setIsFloating(isSmallScreen);
      // Fechar menu automaticamente em telas pequenas quando a rota muda
      if (isSmallScreen) {
        setIsOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fechar menu quando rota muda (apenas em modo flutuante) - SEM resetar scroll
  useEffect(() => {
    if (isFloating) {
      // Usar setTimeout para não interferir com a navegação
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [pathname, isFloating]);

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess, navigate]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Função para renderizar ícones (Lucide ou PNG customizado)
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
          className={`w-5 h-5 group-hover:text-white transition-colors ${isActive ? "text-white" : "text-primary-500"
            }`}
        />
      );
    }
  };

  // MODIFICADO: Filtrar links baseado no role do usuário
  const getFilteredLinksByCategory = () => {
    const linksByCategory = {
      main: allMenuCategories.filter(link => link.category === 'main'),
      rpg: allMenuCategories.filter(link => link.category === 'rpg'),
      system: allMenuCategories.filter(link => {
        // SISTEMA: apenas para admins
        if (link.category === 'system') {
          // Aventuras sempre requer admin
          if (link.route === '/adventures') {
            return userIsAdmin;
          }
          // Outros itens do sistema também apenas para admins
          return userIsAdmin;
        }
        return false;
      }),
    };

    return linksByCategory;
  };

  const categoryTitles = {
    rpg: 'RPG',
    system: 'Sistema'
  };

  // Função para lidar com cliques nos links - PRESERVAR SCROLL
  const handleLinkClick = (_event: React.MouseEvent, _route: string) => {
    // Salvar posição atual do scroll
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Se estiver no modo flutuante, fechar menu com delay para não interferir na navegação
    if (isFloating) {
      setTimeout(() => {
        setIsOpen(false);
      }, 100);
    }

    // Salvar scroll position no sessionStorage para restaurar depois
    sessionStorage.setItem('scrollPosition', scrollPosition.toString());
    sessionStorage.setItem('preserveScroll', 'true');
  };

  // Restaurar scroll position após navegação
  useEffect(() => {
    const shouldPreserveScroll = sessionStorage.getItem('preserveScroll');
    const savedScrollPosition = sessionStorage.getItem('scrollPosition');

    if (shouldPreserveScroll === 'true' && savedScrollPosition) {
      // Usar requestAnimationFrame para garantir que o DOM foi atualizado
      requestAnimationFrame(() => {
        window.scrollTo(0, parseInt(savedScrollPosition, 10));
        // Limpar flags
        sessionStorage.removeItem('preserveScroll');
        sessionStorage.removeItem('scrollPosition');
      });
    }
  }, [pathname]);

  const renderLinks = (links: typeof allMenuCategories) => (
    <ul className="flex flex-col gap-2">
      {links.map((link) => {
        const isActive = pathname === link.route;

        return (
          <li key={link.label}>
            <NavLink
              to={link.route}
              className={`leftsidebar-link group flex gap-4 items-center p-3 rounded-lg transition-all ${isActive && "bg-primary-500"
                }`}
              onClick={(e) => handleLinkClick(e, link.route)}
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
    // MODIFICADO: Não renderizar seção sistema se usuário não é admin
    if (categoryKey === 'system' && !userIsAdmin) {
      return null;
    }

    if (links.length === 0) {
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
            {renderLinks(links)}
          </div>
        )}
      </div>
    );
  };

  // Menu Content Component
  const MenuContent = () => {
    const filteredLinks = getFilteredLinksByCategory();

    return (
      <div className="flex flex-col justify-between h-full">
        <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
          <div className="flex flex-col gap-6">
            {/* Perfil do usuário */}
            <Link
              to={`/profile/${user.id}`}
              className="flex gap-3 items-center p-4 bg-dark-3 rounded-lg"
              onClick={(e) => handleLinkClick(e, `/profile/${user.id}`)}
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

            {/* Links principais (Início) */}
            {renderLinks(filteredLinks.main)}

            {/* Seções categorizadas */}
            {renderSection('rpg', categoryTitles.rpg, filteredLinks.rpg)}
            {/* MODIFICADO: Sistema apenas aparece se for admin */}
            {userIsAdmin && renderSection('system', categoryTitles.system, filteredLinks.system)}
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
    );
  };

  // Se não é flutuante (tela >= 1440px), renderiza como antes
  if (!isFloating) {
    return (
      <nav className="leftsidebar">
        <MenuContent />
      </nav>
    );
  }

  // Modo flutuante para telas < 1440px
  return (
    <>
      {/* Botão para abrir menu flutuante */}
      <button
        onClick={toggleMenu}
        className={cn(
          "fixed top-4 left-4 z-50 p-3 bg-dark-2 border border-dark-4 rounded-lg shadow-lg transition-all duration-300",
          "hover:bg-dark-3 hover:border-primary-500/50",
          isOpen && "bg-primary-500 border-primary-500"
        )}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <Menu className={cn(
            "w-5 h-5 transition-colors",
            isOpen ? "text-white" : "text-primary-500"
          )} />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu flutuante */}
      <nav
        className={cn(
          "fixed top-0 left-0 h-screen w-80 bg-dark-2 border-r border-dark-4 z-50 transition-transform duration-300 ease-in-out shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header do menu flutuante */}
        <div className="flex items-center justify-between p-4 border-b border-dark-4">
          <h2 className="text-lg font-bold text-light-1">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-dark-3 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-light-3" />
          </button>
        </div>

        {/* Conteúdo do menu */}
        <div className="px-6 py-4 h-[calc(100%-80px)]">
          <MenuContent />
        </div>
      </nav>
    </>
  );
};

export default OrganizedSidebar;