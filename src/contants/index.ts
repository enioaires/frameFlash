import {
  Book,
  Bookmark,
  Castle,
  Crown,
  Home,
  Map,
  Plus,
  Scroll,
  Sparkles,
  Sword,
  User,
  Users,
  Zap
} from "lucide-react";

export const sidebarLinks = [
  {
    icon: Home,
    route: "/",
    label: "Início",
  },
  {
    icon: Sword,
    route: "/tag/item",
    label: "Items",
  },
  {
    icon: Book,
    route: "/tag/lore",
    label: "Lore",
  },
  {
    icon: Users,
    route: "/tag/classe",
    label: "Classes",
  },
  {
    icon: User,
    route: "/tag/raca",
    label: "Raças",
  },
  {
    icon: Map,
    route: "/tag/regiao",
    label: "Regiões",
  },
  {
    icon: Bookmark,
    route: "/saved",
    label: "Salvos",
  },
  {
    icon: Plus,
    route: "/create-post",
    label: "Novo",
  },
];

export const bottombarLinks = [
  {
    icon: Home,
    route: "/",
    label: "Início",
  },
  {
    icon: Users,
    route: "/all-users",
    label: "Usuários",
  },
  {
    icon: Sword,
    route: "/tag/item",
    label: "Items",
  },
  {
    icon: Book,
    route: "/tag/lore",
    label: "Lore",
  },
  {
    icon: Plus,
    route: "/create-post",
    label: "Novo",
  },
];

// Menu expandido com todas as categorias
export const allMenuCategories = [
  {
    icon: Home,
    route: "/",
    label: "Início",
    category: "main"
  },
  // RPG Core
  {
    icon: Users,
    route: "/tag/classe",
    label: "Classes",
    category: "rpg"
  },
  {
    icon: User,
    route: "/tag/raca",
    label: "Raças",
    category: "rpg"
  },
  {
    icon: Crown,
    route: "/tag/personagem",
    label: "Personagens",
    category: "rpg"
  },
  {
    icon: Sparkles,
    route: "/tag/talento",
    label: "Talentos",
    category: "rpg"
  },
  {
    icon: Zap,
    route: "/tag/magia",
    label: "Magias",
    category: "rpg"
  },
  {
    icon: Crown,
    route: "/tag/deus",
    label: "Deuses",
    category: "rpg"
  },
  {
    icon: Book,
    route: "/tag/lore",
    label: "Lore",
    category: "rpg"
  },
  {
    icon: Sword,
    route: "/tag/item",
    label: "Items",
    category: "rpg"
  },
  {
    icon: Scroll,
    route: "/tag/relato",
    label: "Relatos",
    category: "rpg"
  },
  // Sistema
  {
    icon: Bookmark,
    route: "/saved",
    label: "Salvos",
    category: "system"
  },
  {
    icon: Plus,
    route: "/create-post",
    label: "Novo",
    category: "system"
  },
  {
    icon: Castle,
    route: "/adventures",
    label: "Aventuras",
    category: "system"
  },
];