import {
  Bookmark,
  ChevronUp,
  Crown,
  Home,
  Menu,
  Plus,
  X,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

import NotificationBell from './NotificationBell';
import { TwoColorIcon } from './TwoColorIcon';
import { cn } from '@/lib/utils';
import { isAdmin } from '@/lib/adventures';
import { useUserContext } from '@/context/AuthContext';

const SlideOutMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUserContext();
  const { pathname } = useLocation();
  const userIsAdmin = isAdmin(user);

  // Função para lidar com cliques nos links - PRESERVAR SCROLL
  const handleLinkClick = (_event: React.MouseEvent, _route: string) => {
    // Salvar posição atual do scroll
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Fechar menu
    setIsOpen(false);

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

  // Todas as categorias do OrganizedSidebar
  const menuCategories = [
    {
      title: "PRINCIPAL",
      items: [
        { icon: Home, route: "/", label: "Início" }
      ]
    },
    {
      title: "RPG",
      items: [
        {
          icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fac80000f71982f3/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
          route: "/tag/mundo",
          label: "O Mundo"
        },
        {
          icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fad2002b2704740c/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
          route: "/tag/personagens",
          label: "Personagens"
        },
        {
          icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fa900015b0c7f7cb/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
          route: "/tag/classes",
          label: "Classes"
        },
        {
          icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fadb0013ee894d37/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
          route: "/tag/racas",
          label: "Raças"
        },
        {
          icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fa96003c5883eade/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
          route: "/tag/deuses",
          label: "Deuses"
        },
        {
          icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fa81001769e00c73/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
          route: "/tag/artefatos",
          label: "Artefatos"
        },
        {
          icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fa8a002f803f1acc/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
          route: "/tag/aventuras",
          label: "Aventuras"
        },
        {
          icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fade0031b898aff2/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
          route: "/tag/relato",
          label: "Relatos"
        },
        {
          icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fae60019d142dc6f/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
          route: "/tag/rpg",
          label: "RPG"
        },
        {
          icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839faa6002492050434/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
          route: "/tag/jogadores",
          label: "Jogadores"
        },
        {
          icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839faad001dc83bf15d/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
          route: "/tag/magias",
          label: "Magias"
        },
        {
          icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839faed0008b77d04ab/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
          route: "/tag/talentos",
          label: "Talentos"
        },
        {
          icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fa9a00396a877a41/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
          route: "/tag/inventario",
          label: "Inventário"
        },
        {
          icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fa9f000af690c9ed/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
          route: "/tag/irmandades",
          label: "Irmandades"
        },
        {
          icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fad600128cc08c0b/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
          route: "/tag/produtos",
          label: "Produtos"
        }
      ]
    }
  ];

  // MODIFICADO: Adicionar categoria Sistema apenas se for admin
  if (userIsAdmin) {
    menuCategories.push({
      title: "SISTEMA",
      items: [
        { icon: Bookmark, route: "/saved", label: "Salvos" },
        { icon: Plus, route: "/create-post", label: "Novo" }
      ]
    });

    menuCategories.push({
      title: "ADMIN",
      items: [
        { icon: Crown, route: "/adventures", label: "Aventuras" }
      ]
    });
  }

  const renderIcon = (icon: any, isActive: boolean, label: string, size = 24) => {
    if (typeof icon === 'string') {
      return (
        <TwoColorIcon
          src={icon}
          alt={label}
          size={size}
          isActive={isActive}
        />
      );
    }

    const IconComponent = icon;
    return (
      <IconComponent
        className={cn(
          `w-6 h-6 transition-colors`,
          isActive ? "text-white" : "text-primary-500"
        )}
      />
    );
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 hover:bg-primary-600 rounded-full shadow-lg flex items-center justify-center z-50 md:hidden"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu Panel */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 bg-dark-2 border-t border-dark-4 z-50 transition-transform duration-300 max-h-[85vh] overflow-y-auto custom-scrollbar",
        isOpen ? "translate-y-0" : "translate-y-full"
      )}>
        {/* Handle */}
        <div className="flex justify-center py-2 border-b border-dark-4/50">
          <div className="w-12 h-1 bg-dark-4 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-4/50">
          <div className="flex items-center gap-3">
            <img
              src={user.imageUrl || "/assets/images/profile-placeholder.svg"}
              alt="avatar"
              className="h-10 w-10 rounded-full"
            />
            <div>
              <h2 className="text-lg font-bold text-light-1">Menu Rápido</h2>
              <p className="text-sm text-light-3">@{user.username}</p>
            </div>
          </div>
          
          {/* 🆕 NOVO: Notification Bell no header mobile */}
          <div className="flex items-center gap-2">
            <NotificationBell className="hover:bg-dark-3/50" />
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-dark-3 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-light-3" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pb-8 space-y-6">
          {menuCategories.map((category) => (
            <div key={category.title}>
              <h3 className="text-xs font-semibold text-light-3 mb-4 uppercase tracking-wider flex items-center gap-2">
                {category.title === "RPG" && "🎭"}
                {category.title === "SISTEMA" && "⚙️"}
                {category.title === "ADMIN" && "👑"}
                {category.title === "PRINCIPAL" && "🏠"}
                {category.title}
              </h3>

              <div className="grid grid-cols-3 gap-3">
                {category.items.map((item) => {
                  const isActive = pathname === item.route;

                  return (
                    <Link
                      key={item.route}
                      to={item.route}
                      onClick={(e) => handleLinkClick(e, item.route)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 min-h-[80px] justify-center",
                        isActive
                          ? "bg-primary-500 text-white shadow-lg transform scale-105"
                          : "bg-dark-3 hover:bg-dark-4 text-light-3 hover:scale-102"
                      )}
                    >
                      {renderIcon(item.icon, isActive, item.label)}
                      <span className="text-xs text-center font-medium leading-tight">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick Create Action - Apenas para admins */}
          {userIsAdmin && (
            <div className="border-t border-dark-4 pt-6 mt-6">
              <Link
                to="/create-post"
                onClick={(e) => handleLinkClick(e, "/create-post")}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-4 rounded-xl flex items-center justify-center gap-3 font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Criar Novo Post
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Versão compacta com scroll horizontal para muitas opções
export const CompactSlideMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUserContext();
  const { pathname } = useLocation();
  const userIsAdmin = isAdmin(user);

  // Função para lidar com cliques nos links - PRESERVAR SCROLL
  const handleLinkClick = (_event: React.MouseEvent, _route: string) => {
    // Salvar posição atual do scroll
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Fechar menu
    setIsOpen(false);

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

  // Todas as opções em uma lista única para scroll horizontal
  const allMenuItems = [
    { icon: Home, route: "/", label: "Início", category: "main" },
    // RPG items
    {
      icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fad2002b2704740c/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
      route: "/tag/personagens",
      label: "Personagens",
      category: "rpg"
    },
    {
      icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fa900015b0c7f7cb/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
      route: "/tag/classes",
      label: "Classes",
      category: "rpg"
    },
    {
      icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fadb0013ee894d37/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
      route: "/tag/racas",
      label: "Raças",
      category: "rpg"
    },
    {
      icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fa81001769e00c73/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
      route: "/tag/artefatos",
      label: "Artefatos",
      category: "rpg"
    }
  ];

  // MODIFICADO: Adicionar itens do sistema apenas se for admin
  if (userIsAdmin) {
    allMenuItems.push(
      { icon: Bookmark, route: "/saved", label: "Salvos", category: "system" },
      { icon: Plus, route: "/create-post", label: "Novo", category: "system" },
      { icon: Crown, route: "/adventures", label: "Admin", category: "admin" }
    );
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 hover:bg-primary-600 rounded-full shadow-lg flex items-center justify-center z-50 md:hidden"
      >
        <ChevronUp className="w-6 h-6 text-white" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu Panel - Compact with Horizontal Scroll */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 bg-dark-2 border-t border-dark-4 z-50 transition-transform duration-300",
        isOpen ? "translate-y-0" : "translate-y-full"
      )}>
        {/* Handle */}
        <div className="flex justify-center py-2">
          <div className="w-12 h-1 bg-dark-4 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-4/50">
          <h2 className="text-lg font-bold text-light-1">Menu Rápido</h2>
          <div className="flex items-center gap-2">
            <NotificationBell className="hover:bg-dark-3/50" />
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-dark-3 rounded-full"
            >
              <X className="w-4 h-4 text-light-3" />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll Menu */}
        <div className="overflow-x-auto custom-scrollbar">
          <div className="flex gap-3 p-4 min-w-max">
            {allMenuItems.map((item) => {
              const isActive = pathname === item.route;

              return (
                <Link
                  key={item.route}
                  to={item.route}
                  onClick={(e) => handleLinkClick(e, item.route)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 min-w-[70px]",
                    isActive
                      ? "bg-primary-500 text-white"
                      : "bg-dark-3 hover:bg-dark-4 text-light-3"
                  )}
                >
                  {typeof item.icon === 'string' ? (
                    <TwoColorIcon
                      src={item.icon}
                      alt={item.label}
                      size={20}
                      isActive={isActive}
                    />
                  ) : (
                    <item.icon className="w-5 h-5" />
                  )}
                  <span className="text-xs text-center">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default SlideOutMenu;