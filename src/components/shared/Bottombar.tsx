// components/shared/SmartBottombar.tsx

import { BookOpen, Crown, Home, Plus, Search, Settings, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import React from "react";
import { TwoColorIcon } from "./TwoColorIcon";
import { cn } from "@/lib/utils";
import { isAdmin } from "@/lib/adventures";
import { useUserContext } from "@/context/AuthContext";

// Tipos de configuração do bottom bar
type BottomBarMode = 'default' | 'rpg' | 'admin' | 'minimal';

interface BottomBarItem {
  icon: any; // Lucide component ou string para PNG
  route: string;
  label: string;
  badge?: number | string;
  isNew?: boolean;
  adminOnly?: boolean;
}

const SmartBottombar = () => {
  const { pathname } = useLocation();
  const { user } = useUserContext();
  const userIsAdmin = isAdmin(user);
  
  // Estado para controlar o modo do bottom bar
  const [mode, setMode] = useState<BottomBarMode>('default');
  const [showLabels, setShowLabels] = useState(true);

  // Detectar contexto automaticamente baseado na rota
  useEffect(() => {
    if (pathname.startsWith('/tag/') || pathname.startsWith('/adventure')) {
      setMode('rpg');
    } else if (pathname.startsWith('/admin') || (userIsAdmin && pathname.includes('manage'))) {
      setMode('admin');
    } else {
      setMode('default');
    }
  }, [pathname, userIsAdmin]);

  // Configurações de itens por modo
  const getItemsForMode = (): BottomBarItem[] => {
    const baseItems: BottomBarItem[] = [
      {
        icon: Home,
        route: "/",
        label: "Início"
      }
    ];

    switch (mode) {
      case 'rpg':
        return [
          ...baseItems,
          {
            icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fac80000f71982f3/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
            route: "/tag/mundo",
            label: "Mundo"
          },
          {
            icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fad2002b2704740c/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
            route: "/tag/personagens",
            label: "Chars"
          },
          {
            icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fa81001769e00c73/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
            route: "/tag/artefatos",
            label: "Items"
          },
          {
            icon: Plus,
            route: "/create-post",
            label: "Novo",
            isNew: true
          }
        ];

      case 'admin':
        return [
          ...baseItems,
          {
            icon: Crown,
            route: "/adventures",
            label: "Admin",
            adminOnly: true
          },
          {
            icon: Users,
            route: "/all-users",
            label: "Users"
          },
          {
            icon: Settings,
            route: "/settings",
            label: "Config"
          },
          {
            icon: Plus,
            route: "/create-post",
            label: "Novo"
          }
        ];

      case 'minimal':
        return [
          {
            icon: Home,
            route: "/",
            label: "Home"
          },
          {
            icon: Search,
            route: "/explore",
            label: "Buscar"
          },
          {
            icon: Plus,
            route: "/create-post",
            label: "+"
          }
        ];

      default: // 'default'
        return [
          ...baseItems,
          {
            icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fae60019d142dc6f/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
            route: "/tag/rpg",
            label: "RPG"
          },
          {
            icon: BookOpen,
            route: "/explore",
            label: "Explore"
          },
          {
            icon: Users,
            route: "/all-users",
            label: "Users"
          },
          {
            icon: Plus,
            route: "/create-post",
            label: "Novo",
            isNew: true
          }
        ];
    }
  };

  // Função para renderizar ícones
  const renderIcon = (icon: any, isActive: boolean, item: BottomBarItem) => {
    const iconElement = typeof icon === 'string' ? (
      <TwoColorIcon
        src={icon}
        alt={item.label}
        isActive={isActive}
        size={20}
        hoverEffect="brightness"
      />
    ) : (
      React.createElement(icon, {
        className: cn(
          "w-5 h-5 transition-colors",
          isActive ? "text-white" : "text-primary-500"
        )
      })
    );

    // Wrapper com badge se necessário
    if (item.badge || item.isNew) {
      return (
        <div className="relative">
          {iconElement}
          {item.badge && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
              {item.badge}
            </span>
          )}
          {item.isNew && !item.badge && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          )}
        </div>
      );
    }

    return iconElement;
  };

  const currentItems = getItemsForMode().filter(item => 
    !item.adminOnly || userIsAdmin
  );

  return (
    <section className="bottom-bar relative">
      {/* Indicador de modo (opcional, pode remover) */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
        <div className="flex gap-1">
          {['default', 'rpg', 'admin'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m as BottomBarMode)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                mode === m ? "bg-primary-500" : "bg-dark-4"
              )}
            />
          ))}
        </div>
      </div>

      {/* Itens do menu */}
      <div className="flex items-center justify-around w-full">
        {currentItems.map((item) => {
          const isActive = pathname === item.route;

          return (
            <Link
              to={item.route}
              key={`${mode}-${item.route}`}
              className={cn(
                "flex-center flex-col gap-1 p-2 transition-all duration-200 min-w-[50px]",
                isActive && "bg-primary-500 rounded-[10px]",
                item.isNew && !isActive && "animate-pulse"
              )}
            >
              {renderIcon(item.icon, isActive, item)}
              
              {showLabels && (
                <p className={cn(
                  "tiny-medium transition-colors",
                  isActive ? "text-white" : "text-light-2"
                )}>
                  {item.label}
                </p>
              )}
            </Link>
          );
        })}
      </div>

      {/* Botão para alternar labels (opcional) */}
      <button
        onClick={() => setShowLabels(!showLabels)}
        className="absolute -top-3 right-2 w-6 h-6 bg-dark-3 rounded-full flex items-center justify-center text-xs text-light-4 hover:bg-dark-2 transition-colors"
      >
        {showLabels ? '−' : '+'}
      </button>
    </section>
  );
};

export default SmartBottombar;

// Versão alternativa mais simples, sem detecção automática
export const ContextualBottombar = () => {
  const { pathname } = useLocation();
  const { user } = useUserContext();
  const userIsAdmin = isAdmin(user);

  // Itens sempre visíveis
  const coreItems = [
    {
      icon: Home,
      route: "/",
      label: "Início"
    }
  ];

  // Itens contextuais baseados na rota atual
  const getContextualItems = () => {
    // Em páginas de RPG
    if (pathname.startsWith('/tag/')) {
      return [
        {
          icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fac80000f71982f3/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
          route: "/tag/mundo",
          label: "Mundo"
        },
        {
          icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fad2002b2704740c/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
          route: "/tag/personagens", 
          label: "Chars"
        },
        {
          icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fa81001769e00c73/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
          route: "/tag/artefatos",
          label: "Items"
        }
      ];
    }

    // Em área administrativa
    if (userIsAdmin && (pathname.includes('/adventures') || pathname.includes('/manage'))) {
      return [
        {
          icon: Crown,
          route: "/adventures",
          label: "Admin"
        },
        {
          icon: Users,
          route: "/all-users", 
          label: "Users"
        },
        {
          icon: Settings,
          route: "/settings",
          label: "Config"
        }
      ];
    }

    // Padrão para outras páginas
    return [
      {
        icon: "https://fra.cloud.appwrite.io/v1/storage/buckets/6839fa5d002fe089d09b/files/6839fae60019d142dc6f/view?project=653bbdb36f4fd0fbd9f7&mode=admin",
        route: "/tag/rpg",
        label: "RPG"
      },
      {
        icon: BookOpen,
        route: "/explore",
        label: "Explore"
      },
      {
        icon: Users,
        route: "/all-users",
        label: "Users"
      }
    ];
  };

  // Sempre inclui o botão de criar
  const createButton = {
    icon: Plus,
    route: "/create-post",
    label: "Novo"
  };

  const allItems = [...coreItems, ...getContextualItems(), createButton];

  const renderIcon = (icon: any, isActive: boolean, label: string) => {
    if (typeof icon === 'string') {
      return (
        <TwoColorIcon
          src={icon}
          alt={label}
          isActive={isActive}
          size={20}
          hoverEffect="brightness"
        />
      );
    }
    
    const IconComponent = icon;
    return (
      <IconComponent 
        className={cn(
          "w-5 h-5",
          isActive ? "text-white" : "text-primary-500"
        )}
      />
    );
  };

  return (
    <section className="bottom-bar">
      {allItems.map((item) => {
        const isActive = pathname === item.route;

        return (
          <Link
            to={item.route}
            key={item.route}
            className={cn(
              "flex-center flex-col gap-1 p-2 transition",
              isActive && "bg-primary-500 rounded-[10px]"
            )}
          >
            {renderIcon(item.icon, isActive, item.label)}
            <p className="tiny-medium text-light-2">{item.label}</p>
          </Link>
        );
      })}
    </section>
  );
};